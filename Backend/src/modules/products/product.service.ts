import { ProductRepository } from './product.repository.js';
import { CreateProductDTO, UpdateProductDTO } from './product.schema.js';
import { NotFoundError } from '../../utils/errors.js';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async getAllProducts(filter: { categoryId?: string; isAvailable?: boolean; search?: string }) {
    return this.repository.findAll(filter);
  }

  async getProductById(id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async createProduct(data: CreateProductDTO) {
    return this.repository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductDTO) {
    await this.getProductById(id); // Ensure exists
    return this.repository.update(id, data);
  }

  async toggleStock(id: string, isAvailable: boolean) {
    await this.getProductById(id); // Ensure exists
    return this.repository.toggleStock(id, isAvailable);
  }

  async deleteProduct(id: string) {
    await this.getProductById(id); // Ensure exists
    return this.repository.delete(id);
  }

  async getCategories() {
    return this.repository.findAllCategories();
  }
}
