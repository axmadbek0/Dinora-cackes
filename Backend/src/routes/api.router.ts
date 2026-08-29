import { Router } from 'express';
import { ProductController } from '../modules/products/product.controller.js';
import { OrderController } from '../modules/orders/order.controller.js';
import { CustomCakeController } from '../modules/custom-cakes/custom-cake.controller.js';
import { AuthController } from '../modules/auth/auth.controller.js';
import { SettingController } from '../modules/settings/setting.controller.js';
import { AnalyticsController } from '../modules/analytics/analytics.controller.js';
import { PaymentController } from '../modules/payment/payment.controller.js';
import { BlockedDateController } from '../modules/blocked-dates/blocked-date.controller.js';
import { UserController } from '../modules/users/user.controller.js';
import { validate } from '../middlewares/validation.js';
import { authenticateJWT, requireAdmin } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rate-limiter.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
} from '../modules/products/product.schema.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  rateOrderSchema,
  getOrdersQuerySchema,
} from '../modules/orders/order.schema.js';
import {
  createCustomCakeSchema,
  updateCustomCakeStatusSchema,
} from '../modules/custom-cakes/custom-cake.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export const apiRouter = Router();

const productController = new ProductController();
const orderController = new OrderController();
const customCakeController = new CustomCakeController();
const authController = new AuthController();
const settingController = new SettingController();
const analyticsController = new AnalyticsController();
const paymentController = new PaymentController();

// --- Auth API (Harden with rate limiter) ---
apiRouter.post('/auth/login', authRateLimiter, asyncHandler(authController.login));
apiRouter.post('/auth/telegram-login', authRateLimiter, asyncHandler(authController.telegramLogin));
apiRouter.get('/auth/me', authenticateJWT, asyncHandler(authController.me));

// --- System Settings API (Public READ, Admin Only WRITE) ---
apiRouter.get('/settings', asyncHandler(settingController.getSettings));
apiRouter.put('/settings', authenticateJWT, requireAdmin, asyncHandler(settingController.updateSettings));
apiRouter.delete('/settings/clear-all-data', authenticateJWT, requireAdmin, asyncHandler(settingController.clearAllData));

// --- Blocked Dates API (Public READ, Admin Only WRITE) ---
const blockedDateController = new BlockedDateController();
apiRouter.get('/blocked-dates', asyncHandler(blockedDateController.getBlockedDates));
apiRouter.post('/blocked-dates', authenticateJWT, requireAdmin, asyncHandler(blockedDateController.blockDate));
apiRouter.delete('/blocked-dates/:date', authenticateJWT, requireAdmin, asyncHandler(blockedDateController.unblockDate));

import { OnlineTracker } from '../utils/online-tracker.js';

// --- Live Realtime Visitors Ping (Public) ---
apiRouter.post('/analytics/ping', asyncHandler(async (req, res) => {
  const sessionId = String(req.body?.sessionId || req.ip || 'anon');
  const count = OnlineTracker.ping(sessionId);
  res.json({ success: true, count, data: { onlineCount: count } });
}));

apiRouter.get('/analytics/live-visitors', asyncHandler(async (_req, res) => {
  const count = OnlineTracker.getCount();
  res.json({ success: true, count, data: { onlineCount: count } });
}));

// --- Analytics API (Protected: Admin Only) ---
apiRouter.get('/analytics/summary', authenticateJWT, requireAdmin, asyncHandler(analyticsController.getSummary));
apiRouter.get('/analytics/dashboard', authenticateJWT, requireAdmin, asyncHandler(analyticsController.getDashboard));

// --- Users Management API (Protected: Admin Only) ---
const userController = new UserController();
apiRouter.get('/users', authenticateJWT, requireAdmin, asyncHandler(userController.getUsers));
apiRouter.get('/users/:id', authenticateJWT, requireAdmin, asyncHandler(userController.getUserById));
apiRouter.patch('/users/:id/role', authenticateJWT, requireAdmin, asyncHandler(userController.updateUserRole));
apiRouter.delete('/users/:id', authenticateJWT, requireAdmin, asyncHandler(userController.deleteUser));

// --- Product Catalog API ---
apiRouter.get(
  '/products',
  validate(getProductsQuerySchema),
  asyncHandler(productController.getProducts)
);
apiRouter.get('/products/categories', asyncHandler(productController.getCategories));

// Image Upload Endpoint with Strict Validation (Protected: Admin Only)
apiRouter.post(
  '/products/upload-image',
  authenticateJWT,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { imageBase64, fileName } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image/')) {
      res.status(400).json({ success: false, message: 'Rasm ma\'lumoti noto\'g\'ri formatda' });
      return;
    }

    const matches = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
    if (!matches) {
      res.status(400).json({ success: false, message: 'Faqat PNG, JPG, JPEG va WEBP rasmlar ruxsat etiladi!' });
      return;
    }

    const ext = matches[1].toLowerCase() === 'jpeg' ? 'jpg' : matches[1].toLowerCase();
    const buffer = Buffer.from(matches[2], 'base64');

    // Strict Size Limit Check (Max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ success: false, message: 'Rasm hajmi 5MB dan oshmasligi kerak!' });
      return;
    }

    const { default: fs } = await import('fs');
    const { default: path } = await import('path');

    const safeName = (fileName || `product-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalName = `${Date.now()}-${safeName}.${ext}`;
    const dir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(path.join(dir, finalName), buffer);
    const imageUrl = `/uploads/products/${finalName}`;
    res.json({ success: true, data: { imageUrl } });
  })
);

apiRouter.get('/products/:id', asyncHandler(productController.getProductById));
apiRouter.post(
  '/products',
  authenticateJWT,
  requireAdmin,
  validate(createProductSchema),
  asyncHandler(productController.createProduct)
);
apiRouter.put(
  '/products/:id',
  authenticateJWT,
  requireAdmin,
  validate(updateProductSchema),
  asyncHandler(productController.updateProduct)
);
apiRouter.patch('/products/:id/toggle-stock', authenticateJWT, requireAdmin, asyncHandler(productController.toggleStock));
apiRouter.delete('/products/:id', authenticateJWT, requireAdmin, asyncHandler(productController.deleteProduct));

// --- Public Payment Config API ---
apiRouter.get('/config/payment', (_req, res) => {
  import('../config/env.js').then(({ env }) => {
    res.json({
      success: true,
      data: {
        adminCardNumber: env.ADMIN_CARD_NUMBER,
        adminCardHolder: env.ADMIN_CARD_HOLDER,
        deliveryRegion: 'Sirdaryo tumani',
      },
    });
  });
});

// --- Orders API ---
apiRouter.get(
  '/orders',
  validate(getOrdersQuerySchema),
  asyncHandler(orderController.getOrders)
);
apiRouter.get('/orders/:id', asyncHandler(orderController.getOrderById));
apiRouter.post(
  '/orders',
  validate(createOrderSchema),
  asyncHandler(orderController.createOrder)
);
apiRouter.post('/orders/:id/receipt', asyncHandler(orderController.uploadReceipt));
apiRouter.post(
  '/orders/:id/rate',
  validate(rateOrderSchema),
  asyncHandler(orderController.rateOrder)
);
apiRouter.patch(
  '/orders/:id/status',
  authenticateJWT,
  requireAdmin,
  validate(updateOrderStatusSchema),
  asyncHandler(orderController.updateOrderStatus)
);
apiRouter.put(
  '/orders/:id/status',
  authenticateJWT,
  requireAdmin,
  validate(updateOrderStatusSchema),
  asyncHandler(orderController.updateOrderStatus)
);

// --- Custom Cake Requests API ---
apiRouter.get('/custom-cakes', authenticateJWT, requireAdmin, asyncHandler(customCakeController.getRequests));
apiRouter.get('/custom-cakes/:id', asyncHandler(customCakeController.getRequestById));
apiRouter.post(
  '/custom-cakes',
  validate(createCustomCakeSchema),
  asyncHandler(customCakeController.createRequest)
);
apiRouter.patch(
  '/custom-cakes/:id/status',
  authenticateJWT,
  requireAdmin,
  validate(updateCustomCakeStatusSchema),
  asyncHandler(customCakeController.updateStatus)
);
apiRouter.put(
  '/custom-cakes/:id/status',
  authenticateJWT,
  requireAdmin,
  validate(updateCustomCakeStatusSchema),
  asyncHandler(customCakeController.updateStatus)
);

// --- Payment & Webhook API ---
apiRouter.post('/payments/generate-invoice', asyncHandler(paymentController.generateInvoice));
apiRouter.post('/payments/webhook', asyncHandler(paymentController.handleClickWebhook));
apiRouter.post('/payments/click/webhook', asyncHandler(paymentController.handleClickWebhook));
apiRouter.post('/payments/payme/webhook', asyncHandler(paymentController.handlePaymeWebhook));
