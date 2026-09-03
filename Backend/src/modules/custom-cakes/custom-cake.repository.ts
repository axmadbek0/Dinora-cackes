import { prisma } from '../../config/database.js';
import { CreateCustomCakeDTO, UpdateCustomCakeStatusDTO } from './custom-cake.schema.js';
import { CustomCakeStatus } from '@prisma/client';
import { CustomCakeFileStore } from '../../utils/custom-cake-file-store.js';

export class CustomCakeRepository {
  async upsertUser(
    telegramId?: number | string | null,
    phone?: string | null,
    firstName?: string | null,
    lastName?: string | null,
    username?: string | null
  ) {
    const rawPhone = phone || '';
    const cleanPhoneDigits = rawPhone.replace(/\D/g, '');
    const fallbackId = cleanPhoneDigits && cleanPhoneDigits.length >= 4
      ? parseInt(cleanPhoneDigits.slice(-9), 10)
      : Math.floor(100000 + Math.random() * 900000);

    let validTelegramId: bigint;
    if (telegramId) {
      const cleanTgStr = String(telegramId).replace(/\D/g, '');
      validTelegramId = cleanTgStr ? BigInt(cleanTgStr) : BigInt(fallbackId);
    } else {
      validTelegramId = BigInt(fallbackId);
    }

    const userName = firstName || (cleanPhoneDigits ? `Mijoz (${cleanPhoneDigits.slice(-4)})` : 'Storefront Mijoz');

    try {
      return await prisma.user.upsert({
        where: { telegramId: validTelegramId },
        update: {
          phone: rawPhone || undefined,
          firstName: userName || undefined,
          lastName: lastName || undefined,
          username: username || undefined,
        },
        create: {
          telegramId: validTelegramId,
          phone: rawPhone || undefined,
          firstName: userName,
          lastName: lastName || undefined,
          username: username || undefined,
        },
      });
    } catch (err) {
      return {
        id: `usr-${validTelegramId.toString()}`,
        telegramId: validTelegramId,
        phone: rawPhone || '+998900000000',
        firstName: userName,
        lastName: lastName || '',
        username: username || '',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  async create(userId: string, data: CreateCustomCakeDTO) {
    const imagesList = data.referenceImages && data.referenceImages.length > 0
      ? data.referenceImages
      : (data.referenceImageUrl ? [data.referenceImageUrl] : []);
    const imageUrl = data.referenceImageUrl || (imagesList.length > 0 ? imagesList[0] : null);

    const lat = typeof data.latitude === 'number' ? data.latitude : (data.latitude ? parseFloat(String(data.latitude)) : null);
    const lng = typeof data.longitude === 'number' ? data.longitude : (data.longitude ? parseFloat(String(data.longitude)) : null);
    const dist = typeof data.distanceKm === 'number' ? data.distanceKm : (data.distanceKm ? parseFloat(String(data.distanceKm)) : null);
    const fee = typeof data.deliveryFee === 'number' ? data.deliveryFee : (data.deliveryFee ? parseFloat(String(data.deliveryFee)) : null);

    const customerPhone = data.phone || data.customerPhone || '';
    const customerName = data.firstName || data.customerName || 'Mijoz';

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
        referenceImageUrl: imageUrl,
        referenceImages: imagesList,
        photos: imagesList,
        customDetails: data.customDetails,
        distanceKm: dist,
        deliveryFee: fee,
        phone: customerPhone || created.user?.phone || null,
        customerName: customerName || created.user?.firstName || 'Mijoz',
        user: {
          ...created.user,
          phone: customerPhone || created.user?.phone || null,
          firstName: customerName || created.user?.firstName || 'Mijoz',
        },
      };

      CustomCakeFileStore.createRequest(enriched);
      return enriched;
    } catch (err) {
      return CustomCakeFileStore.createRequest({
        userId,
        referenceImageUrl: imageUrl,
        referenceImages: imagesList,
        photos: imagesList,
        description: data.description,
        customDetails: data.customDetails,
        deliveryType: data.deliveryType || 'DELIVERY',
        deliveryAddress: data.deliveryAddress,
        latitude: lat,
        longitude: lng,
        distanceKm: dist,
        deliveryFee: fee,
        estimatedPrice: null,
        status: 'PENDING_PRICING',
        customerName: customerName,
        phone: customerPhone,
        user: {
          id: userId,
          firstName: customerName,
          phone: customerPhone,
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

    const photos = fileCake.photos || fileCake.referenceImages || (dbCake.referenceImageUrl ? [dbCake.referenceImageUrl] : []);

    return {
      ...fileCake,
      ...dbCake,
      photos,
      referenceImages: photos,
      customDetails: fileCake.customDetails || (dbCake as any).customDetails,
      distanceKm: fileCake.distanceKm !== undefined && fileCake.distanceKm !== null ? fileCake.distanceKm : (dbCake as any).distanceKm,
      deliveryFee: fileCake.deliveryFee !== undefined && fileCake.deliveryFee !== null ? fileCake.deliveryFee : (dbCake as any).deliveryFee,
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
      combinedMap.set(item.id, {
        ...item,
        photos: item.referenceImageUrl ? [item.referenceImageUrl] : [],
        referenceImages: item.referenceImageUrl ? [item.referenceImageUrl] : [],
      });
    }

    for (const fItem of fileList) {
      if (!combinedMap.has(fItem.id)) {
        combinedMap.set(fItem.id, fItem);
      } else {
        const existing = combinedMap.get(fItem.id);
        const mergedPhotos = fItem.photos || fItem.referenceImages || existing.photos || (existing.referenceImageUrl ? [existing.referenceImageUrl] : []);
        combinedMap.set(fItem.id, {
          ...existing,
          customDetails: existing.customDetails || fItem.customDetails,
          distanceKm: existing.distanceKm !== undefined && existing.distanceKm !== null ? existing.distanceKm : fItem.distanceKm,
          deliveryFee: existing.deliveryFee !== undefined && existing.deliveryFee !== null ? existing.deliveryFee : fItem.deliveryFee,
          referenceImages: mergedPhotos,
          photos: mergedPhotos,
          user: {
            ...existing.user,
            phone: existing.user?.phone || fItem.phone || fItem.user?.phone,
            firstName: existing.user?.firstName || fItem.customerName || fItem.user?.firstName,
          },
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

      if (data.estimatedPrice !== undefined && data.estimatedPrice !== null) {
        updateData.estimatedPrice = data.estimatedPrice;
      }

      if (data.adminNotes !== undefined && data.adminNotes !== null) {
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

