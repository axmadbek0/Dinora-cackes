import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products_store.json');

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Tortlar', slug: 'tortlar', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Pirojniylar', slug: 'pirojniylar', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Art Desertlar', slug: 'art-desertlar', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Korpus Pirojniylar', slug: 'korpus-pirojniylar', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class ProductFileStore {
  private static ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  static getProducts(): any[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  }

  static saveProducts(products: any[]) {
    try {
      this.ensureFile();
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save products to disk store:', err);
    }
  }

  static getCategories() {
    return DEFAULT_CATEGORIES;
  }

  static createProduct(data: any) {
    const products = this.getProducts();
    const cat = DEFAULT_CATEGORIES.find(c => c.id === data.categoryId) || DEFAULT_CATEGORIES[0];
    const newProduct = {
      id: `prod-${Date.now()}`,
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
      categoryId: cat.id,
      category: cat,
      ingredients: data.ingredients || null,
      storageConditions: data.storageConditions || null,
      deliveryTerms: data.deliveryTerms || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  static updateProduct(id: string, data: any) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      const cat = DEFAULT_CATEGORIES.find(c => c.id === (data.categoryId || products[index].categoryId)) || DEFAULT_CATEGORIES[0];
      products[index] = {
        ...products[index],
        ...data,
        categoryId: cat.id,
        category: cat,
        updatedAt: new Date().toISOString(),
      };
      this.saveProducts(products);
      return products[index];
    }
    throw new Error('Mahsulot topilmadi');
  }

  static deleteProduct(id: string) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
    return { id };
  }
}
