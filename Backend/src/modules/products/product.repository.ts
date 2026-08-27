import { prisma } from '../../config/database.js';
import { CreateProductDTO, UpdateProductDTO } from './product.schema.js';
import { ProductFileStore } from '../../utils/product-file-store.js';

export class ProductRepository {
  private async ensureCategoriesExist() {
    try {
      const count = await prisma.category.count();
      if (count === 0) {
        await prisma.category.createMany({
          data: [
            { id: 'cat-1', name: 'Tortlar', slug: 'tortlar', isActive: true },
            { id: 'cat-2', name: 'Pirojniylar', slug: 'pirojniylar', isActive: true },
            { id: 'cat-3', name: 'Art Desertlar', slug: 'art-desertlar', isActive: true },
            { id: 'cat-4', name: 'Korpus Pirojniylar', slug: 'korpus-pirojniylar', isActive: true },
          ],
          skipDuplicates: true,
        });
      }
    } catch (err) {
      // Ignored if DB offline
    }
  }

  async findAll(filter: { categoryId?: string; isAvailable?: boolean; search?: string }) {
    try {
      await this.ensureCategoriesExist().catch(() => {});
      const where: any = {};
      
      if (filter.categoryId && filter.categoryId !== 'cat-all') {
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
      // DB offline fallback: persistent file store
      let products = ProductFileStore.getProducts();
      if (filter.categoryId && filter.categoryId !== 'cat-all') {
        products = products.filter((p) => p.categoryId === filter.categoryId);
      }
      if (typeof filter.isAvailable === 'boolean') {
        products = products.filter((p) => p.isAvailable === filter.isAvailable);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        products = products.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
      }
      return products;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });
    } catch (err) {
      const products = ProductFileStore.getProducts();
      return products.find((p) => p.id === id) || null;
    }
  }

  async create(data: CreateProductDTO) {
    try {
      await this.ensureCategoriesExist().catch(() => {});

      let categoryId = data.categoryId;
      if (!categoryId || categoryId === 'cat-all') {
        const firstCat = await prisma.category.findFirst();
        if (firstCat) categoryId = firstCat.id;
      }

      return await prisma.product.create({
        data: {
          name: data.name,
          nameUz: data.nameUz || data.name,
          nameUzCyrl: data.nameUzCyrl || null,
          nameRu: data.nameRu || null,
          description: data.description || '',
          descriptionUz: data.descriptionUz || data.description || '',
          descriptionUzCyrl: data.descriptionUzCyrl || null,
          descriptionRu: data.descriptionRu || null,
          price: data.price,
          imageUrl: data.imageUrl || '',
          isAvailable: data.isAvailable ?? true,
          categoryId: categoryId || 'cat-1',
          ingredients: data.ingredients || null,
          storageConditions: data.storageConditions || null,
          deliveryTerms: data.deliveryTerms || null,
        },
        include: { category: true },
      });
    } catch (err) {
      // DB offline fallback: create in persistent disk store
      console.warn('PostgreSQL DB connection error, saving product to persistent disk store');
      return ProductFileStore.createProduct(data);
    }
  }

  async update(id: string, data: UpdateProductDTO) {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.nameUz !== undefined) updateData.nameUz = data.nameUz;
      if (data.nameUzCyrl !== undefined) updateData.nameUzCyrl = data.nameUzCyrl;
      if (data.nameRu !== undefined) updateData.nameRu = data.nameRu;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.descriptionUz !== undefined) updateData.descriptionUz = data.descriptionUz;
      if (data.descriptionUzCyrl !== undefined) updateData.descriptionUzCyrl = data.descriptionUzCyrl;
      if (data.descriptionRu !== undefined) updateData.descriptionRu = data.descriptionRu;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
      if (data.categoryId !== undefined && data.categoryId !== 'cat-all') updateData.categoryId = data.categoryId;
      if (data.ingredients !== undefined) updateData.ingredients = data.ingredients;
      if (data.storageConditions !== undefined) updateData.storageConditions = data.storageConditions;
      if (data.deliveryTerms !== undefined) updateData.deliveryTerms = data.deliveryTerms;

      return await prisma.product.update({
        where: { id },
        data: updateData,
        include: { category: true },
      });
    } catch (err) {
      return ProductFileStore.updateProduct(id, data);
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
      return ProductFileStore.deleteProduct(id);
    }
  }

  async findAllCategories() {
    try {
      await this.ensureCategoriesExist().catch(() => {});
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      if (categories.length > 0) return categories;
      return ProductFileStore.getCategories();
    } catch (err) {
      return ProductFileStore.getCategories();
    }
  }
}
