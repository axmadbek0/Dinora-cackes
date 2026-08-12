import { Request, Response } from 'express';
import { ProductService } from './product.service.js';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  public getProducts = async (req: Request, res: Response) => {
    const { categoryId, isAvailable, search } = req.query;
    const filter = {
      categoryId: categoryId as string | undefined,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
      search: search as string | undefined,
    };
    const products = await this.productService.getAllProducts(filter);
    return res.json({ success: true, data: products });
  };

  public getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.getProductById(id);
    return res.json({ success: true, data: product });
  };

  public createProduct = async (req: Request, res: Response) => {
    const product = await this.productService.createProduct(req.body);
    return res.status(201).json({ success: true, data: product });
  };

  public updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.updateProduct(id, req.body);
    return res.json({ success: true, data: product });
  };

  public toggleStock = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const product = await this.productService.toggleStock(id, Boolean(isAvailable));
    return res.json({ success: true, data: product });
  };

  public deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.deleteProduct(id);
    return res.json({ success: true, message: 'Product deleted successfully' });
  };

  public getCategories = async (_req: Request, res: Response) => {
    const categories = await this.productService.getCategories();
    return res.json({ success: true, data: categories });
  };
}
