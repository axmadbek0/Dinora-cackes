import { prisma } from '../../config/database.js';
import { CreateCustomCakeDTO, UpdateCustomCakeStatusDTO } from './custom-cake.schema.js';
import { CustomCakeStatus } from '@prisma/client';

// In-memory cache for fallback when database is unavailable
const MOCK_CUSTOM_CAKES: any[] = [];

export class CustomCakeRepository {
  async upsertUser(
    telegramId?: number | string,
    phone?: string,
    firstName?: string,
    lastName?: string,
    username?: string
  ) {
    // Generate a fallback numeric ID if telegramId is not provided
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
    // Determine main reference image URL
    const imageUrl = data.referenceImageUrl || (data.referenceImages && data.referenceImages.length > 0 ? data.referenceImages[0] : null);

    try {
      return await prisma.customCakeRequest.create({
        data: {
          userId,
          referenceImageUrl: imageUrl,
          description: data.description,
          deliveryType: data.deliveryType,
          deliveryAddress: data.deliveryAddress,
          latitude: data.latitude,
          longitude: data.longitude,
          status: CustomCakeStatus.PENDING_PRICING,
        },
        include: {
          user: true,
        },
      });
    } catch (err) {
      const newCake: any = {
        id: `cake-req-${Date.now()}`,
        requestNumber: Math.floor(500 + Math.random() * 500),
        userId,
        referenceImageUrl: imageUrl,
        referenceImages: data.referenceImages || (imageUrl ? [imageUrl] : []),
        photos: data.referenceImages || (imageUrl ? [imageUrl] : []),
        description: data.description,
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryAddress,
        estimatedPrice: null,
        status: CustomCakeStatus.PENDING_PRICING,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: userId,
          firstName: data.firstName || 'Storefront Mijoz',
          phone: data.phone || '',
        },
      };
      MOCK_CUSTOM_CAKES.unshift(newCake);
      return newCake;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.customCakeRequest.findUnique({
        where: { id },
        include: { user: true },
      });
    } catch (err) {
      return MOCK_CUSTOM_CAKES.find((c) => c.id === id) || null;
    }
  }

  async findAll(filter: { telegramId?: number; status?: CustomCakeStatus }) {
    try {
      const where: any = {};
      if (filter.telegramId) {
        where.user = { telegramId: BigInt(filter.telegramId) };
      }
      if (filter.status) {
        where.status = filter.status;
      }

      return await prisma.customCakeRequest.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      let filtered = [...MOCK_CUSTOM_CAKES];
      if (filter.status) {
        filtered = filtered.filter((c) => c.status === filter.status);
      }
      return filtered;
    }
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

      return await prisma.customCakeRequest.update({
        where: { id },
        data: updateData,
        include: { user: true },
      });
    } catch (err) {
      const index = MOCK_CUSTOM_CAKES.findIndex((c) => c.id === id);
      if (index !== -1) {
        MOCK_CUSTOM_CAKES[index] = {
          ...MOCK_CUSTOM_CAKES[index],
          status: data.status,
          estimatedPrice: data.estimatedPrice ?? MOCK_CUSTOM_CAKES[index].estimatedPrice,
          adminNotes: data.adminNotes ?? MOCK_CUSTOM_CAKES[index].adminNotes,
          updatedAt: new Date(),
        };
        return MOCK_CUSTOM_CAKES[index];
      }
      throw err;
    }
  }
}
