import { prisma } from '../../config/database.js';
import { CreateCustomCakeDTO, UpdateCustomCakeStatusDTO } from './custom-cake.schema.js';
import { CustomCakeStatus } from '@prisma/client';
import { CustomCakeFileStore } from '../../utils/custom-cake-file-store.js';

export class CustomCakeRepository {
  async upsertUser(
    telegramId?: number | string,
    phone?: string,
    firstName?: string,
    lastName?: string,
    username?: string
  ) {
    const cleanPhoneDigits = (phone || '').replace(/\D/g, '');
    const fallbackId = cleanPhoneDigits ? parseInt(cleanPhoneDigits.slice(-9), 10) : Math.floor(100000 + Math.random() * 900000);
    const validTelegramId = telegramId ? BigInt(telegramId) : BigInt(fallbackId);

    try {
      return await prisma.user.upsert({
        where: { telegramId: validTelegramId },
        update: {
          phone: phone || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          username: username || undefined,
        },
        create: {
          telegramId: validTelegramId,
          phone,
          firstName: firstName || 'Storefront Mijoz',
          lastName,
          username,
        },
      });
    } catch (err) {
      return {
        id: `usr-${validTelegramId.toString()}`,
        telegramId: validTelegramId,
        phone: phone || '+998900000000',
        firstName: firstName || 'Storefront Mijoz',
        lastName: lastName || '',
        username: username || '',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  async create(userId: string, data: CreateCustomCakeDTO) {
    const imageUrl = data.referenceImageUrl || (data.referenceImages && data.referenceImages.length > 0 ? data.referenceImages[0] : null);
    const lat = typeof data.latitude === 'number' ? data.latitude : (data.latitude ? parseFloat(data.latitude) : null);
    const lng = typeof data.longitude === 'number' ? data.longitude : (data.longitude ? parseFloat(data.longitude) : null);
    const dist = typeof data.distanceKm === 'number' ? data.distanceKm : (data.distanceKm ? parseFloat(data.distanceKm) : null);
    const fee = typeof data.deliveryFee === 'number' ? data.deliveryFee : (data.deliveryFee ? parseFloat(data.deliveryFee) : null);

    try {
      const created = await prisma.customCakeRequest.create({
        data: {
          userId,
          referenceImageUrl: imageUrl,
          description: data.description,
          deliveryType: (data.deliveryType as any) || 'DELIVERY',
          deliveryAddress: data.deliveryAddress,
          latitude: lat,
          longitude: lng,
          status: CustomCakeStatus.PENDING_PRICING,
        },
        include: {
          user: true,
        },
      });
      const enriched = {
        ...created,
        customDetails: data.customDetails,
        distanceKm: dist,
        deliveryFee: fee,
      };
      CustomCakeFileStore.createRequest(enriched);
      return enriched;
    } catch (err) {
      return CustomCakeFileStore.createRequest({
        userId,
        referenceImageUrl: imageUrl,
        referenceImages: data.referenceImages || (imageUrl ? [imageUrl] : []),
        description: data.description,
        customDetails: data.customDetails,
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryAddress,
        latitude: lat,
        longitude: lng,
        distanceKm: dist,
        deliveryFee: fee,
        estimatedPrice: null,
        status: 'PENDING_PRICING',
        customerName: data.firstName || 'Storefront Mijoz',
        phone: data.phone || '',
        user: {
          id: userId,
          firstName: data.firstName || 'Storefront Mijoz',
          phone: data.phone || '',
        },
      });
    }
  }

  async findById(id: string) {
    let dbCake = null;
    try {
      dbCake = await prisma.customCakeRequest.findUnique({
        where: { id },
        include: { user: true },
      });
    } catch (err) {}

    const fileCake = CustomCakeFileStore.findById(id);
    if (!dbCake && !fileCake) return null;
    if (!dbCake) return fileCake;
    if (!fileCake) return dbCake;

    return {
      ...fileCake,
      ...dbCake,
      customDetails: fileCake.customDetails || (dbCake as any).customDetails,
      distanceKm: fileCake.distanceKm !== undefined ? fileCake.distanceKm : (dbCake as any).distanceKm,
      deliveryFee: fileCake.deliveryFee !== undefined ? fileCake.deliveryFee : (dbCake as any).deliveryFee,
    };
  }

  async findAll(filter: { telegramId?: number; status?: CustomCakeStatus; query?: string; phone?: string }) {
    let list: any[] = [];
    try {
      const where: any = {};
      if (filter.telegramId) {
        where.user = { telegramId: BigInt(filter.telegramId) };
      }
      if (filter.status) {
        where.status = filter.status;
      }
      if (filter.phone || filter.query) {
        const q = (filter.phone || filter.query || '').trim();
        where.OR = [
          { deliveryAddress: { contains: q } },
          { user: { phone: { contains: q } } },
          { user: { firstName: { contains: q } } },
        ];
      }

      list = await prisma.customCakeRequest.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {}

    const fileList = CustomCakeFileStore.findRequests(filter as any);
    const combinedMap = new Map<string, any>();

    for (const item of list) {
      combinedMap.set(item.id, item);
    }

    for (const fItem of fileList) {
      if (!combinedMap.has(fItem.id)) {
        combinedMap.set(fItem.id, fItem);
      } else {
        const existing = combinedMap.get(fItem.id);
        combinedMap.set(fItem.id, {
          ...existing,
          customDetails: existing.customDetails || fItem.customDetails,
          distanceKm: existing.distanceKm !== undefined ? existing.distanceKm : fItem.distanceKm,
          deliveryFee: existing.deliveryFee !== undefined ? existing.deliveryFee : fItem.deliveryFee,
          referenceImages: existing.referenceImages || fItem.referenceImages,
        });
      }
    }

    return Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateStatus(id: string, data: UpdateCustomCakeStatusDTO) {
    try {
      const updateData: any = {
        status: data.status,
      };

      if (data.estimatedPrice !== undefined) {
        updateData.estimatedPrice = data.estimatedPrice;
      }

      if (data.adminNotes !== undefined) {
        updateData.adminNotes = data.adminNotes;
      }

      const updated = await prisma.customCakeRequest.update({
        where: { id },
        data: updateData,
        include: { user: true },
      });
      CustomCakeFileStore.updateRequest(id, updateData);
      return updated;
    } catch (err) {
      return CustomCakeFileStore.updateRequest(id, {
        status: data.status,
        estimatedPrice: data.estimatedPrice,
        adminNotes: data.adminNotes,
      });
    }
  }
}
