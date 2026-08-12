import { prisma } from '../../config/database.js';
import { CreateProductDTO, UpdateProductDTO } from './product.schema.js';

const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Tortlar', slug: 'tortlar', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-2', name: 'Pirojnoelar', slug: 'pirojnoelar', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-3', name: 'Pechenelar', slug: 'pechenelar', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const MOCK_PRODUCTS: any[] = [
  {
    id: 'prod-1',
    name: 'Shokoladli Medovik',
    description: "Tabiiy asal va shokoladli sous bilan tayyorlangan mayin medovik torti",
    price: 185000,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    categoryId: 'cat-1',
    category: MOCK_CATEGORIES[0],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-2',
    name: 'Pistachili Ekler Set',
    description: "Krem-bryule va tabiiy pista pastasi to'ldirilgan 6 talik ekler to'plami",
    price: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    categoryId: 'cat-2',
    category: MOCK_CATEGORIES[1],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class ProductRepository {
  async findAll(filter: { categoryId?: string; isAvailable?: boolean; search?: string }) {
    try {
      const where: any = {};
      
      if (filter.categoryId) {
        where.categoryId = filter.categoryId;
      }
      
      if (typeof filter.isAvailable === 'boolean') {
        where.isAvailable = filter.isAvailable;
      }

      if (filter.search) {
        where.OR = [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      return await prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      let filtered = [...MOCK_PRODUCTS];
      if (filter.categoryId) {
        filtered = filtered.filter((p) => p.categoryId === filter.categoryId);
      }
      return filtered;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });
    } catch (err) {
      return MOCK_PRODUCTS.find((p) => p.id === id) || null;
    }
  }

  async create(data: CreateProductDTO) {
    try {
      return await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          isAvailable: data.isAvailable ?? true,
          categoryId: data.categoryId,
        },
        include: { category: true },
      });
    } catch (err) {
      const newProduct: any = {
        id: `prod-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        price: data.price,
        imageUrl: data.imageUrl || '',
        isAvailable: data.isAvailable ?? true,
        categoryId: data.categoryId,
        category: MOCK_CATEGORIES.find((c) => c.id === data.categoryId) || MOCK_CATEGORIES[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_PRODUCTS.unshift(newProduct);
      return newProduct;
    }
  }

  async update(id: string, data: UpdateProductDTO) {
    try {
      return await prisma.product.update({
        where: { id },
        data,
        include: { category: true },
      });
    } catch (err) {
      const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
      if (index !== -1) {
        MOCK_PRODUCTS[index] = {
          ...MOCK_PRODUCTS[index],
          ...data,
          price: data.price !== undefined ? data.price : MOCK_PRODUCTS[index].price,
        };
        return MOCK_PRODUCTS[index];
      }
      throw err;
    }
  }

  async toggleStock(id: string, isAvailable: boolean) {
    return this.update(id, { isAvailable });
  }

  async delete(id: string) {
    try {
      return await prisma.product.delete({
        where: { id },
      });
    } catch (err) {
      const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
      if (index !== -1) {
        MOCK_PRODUCTS.splice(index, 1);
      }
      return { id };
    }
  }

  async findAllCategories() {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      if (categories.length > 0) return categories;
      return MOCK_CATEGORIES;
    } catch (err) {
      return MOCK_CATEGORIES;
    }
  }
}
