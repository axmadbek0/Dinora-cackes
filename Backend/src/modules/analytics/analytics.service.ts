import { prisma } from '../../config/database.js';
import { ProductFileStore } from '../../utils/product-file-store.js';
import { OrderFileStore } from '../../utils/order-file-store.js';
import { CustomCakeFileStore } from '../../utils/custom-cake-file-store.js';

export class AnalyticsService {
  async getSummary() {
    let orders: any[] = [];
    let products: any[] = [];
    let customCakes: any[] = [];
    let categories: any[] = [];

    // 1. Fetch Orders (Prisma DB with OrderFileStore fallback)
    try {
      orders = await prisma.order.findMany({
        include: {
          items: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (!orders || orders.length === 0) {
        orders = OrderFileStore.getOrders();
      }
    } catch {
      orders = OrderFileStore.getOrders();
    }

    // 2. Fetch Products
    try {
      products = await prisma.product.findMany({
        include: {
          category: true,
        },
      });
      if (!products || products.length === 0) {
        products = ProductFileStore.getProducts();
      }
    } catch {
      products = ProductFileStore.getProducts();
    }

    // 3. Fetch Custom Cakes
    try {
      customCakes = await prisma.customCakeRequest.findMany({
        include: {
          user: true,
        },
      });
      if (!customCakes || customCakes.length === 0) {
        customCakes = CustomCakeFileStore.getRequests();
      }
    } catch {
      customCakes = CustomCakeFileStore.getRequests();
    }

    // 4. Fetch Categories
    try {
      categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
      if (!categories || categories.length === 0) {
        categories = ProductFileStore.getCategories();
      }
    } catch {
      categories = ProductFileStore.getCategories();
    }

    // Calculations:
    const totalOrders = orders.length;
    const pendingCustomCakes = customCakes.filter(
      (c) => c.status === 'PENDING_PRICING' || c.status === 'PENDING'
    ).length;
    const activeProducts = products.filter((p) => p.isAvailable !== false).length;

    // Total Revenue (all non-rejected/cancelled orders)
    const totalRevenue = orders.reduce((sum, o) => {
      if (o.status === 'REJECTED' || o.status === 'CANCELLED' || o.status === 'CANCELED') {
        return sum;
      }
      return sum + Number(o.totalAmount || 0);
    }, 0);

    // Status map
    const statusMap: Record<string, number> = {};
    orders.forEach((o) => {
      let normalizedStatus = o.status;
      if (normalizedStatus === 'AWAITING_RECEIPT' || normalizedStatus === 'RECEIPT_SUBMITTED') {
        normalizedStatus = 'PENDING_APPROVAL';
      } else if (normalizedStatus === 'CANCELED' || normalizedStatus === 'REJECTED') {
        normalizedStatus = 'CANCELLED';
      }
      statusMap[normalizedStatus] = (statusMap[normalizedStatus] || 0) + 1;
    });

    const orderStatusCounts = Object.keys(statusMap).map((status) => ({
      status,
      count: statusMap[status],
    }));

    // Category distribution
    const categoryCountMap: Record<string, number> = {};
    products.forEach((p) => {
      const catName = p.category?.name || 'Boshqa';
      categoryCountMap[catName] = (categoryCountMap[catName] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categoryCountMap).map((category) => ({
      category,
      count: categoryCountMap[category],
    }));

    // Monthly revenue calculation (Past 6 months dynamic grouping)
    const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const now = new Date();
    const monthlyRevenue: Array<{ month: string; revenue: number; orders: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();
      const monthLabel = monthNames[targetMonth];

      let monthRev = 0;
      let monthOrderCount = 0;

      orders.forEach((o) => {
        const orderDate = new Date(o.createdAt);
        if (
          !isNaN(orderDate.getTime()) &&
          orderDate.getFullYear() === targetYear &&
          orderDate.getMonth() === targetMonth
        ) {
          if (o.status !== 'REJECTED' && o.status !== 'CANCELLED' && o.status !== 'CANCELED') {
            monthRev += Number(o.totalAmount || 0);
          }
          monthOrderCount += 1;
        }
      });

      monthlyRevenue.push({
        month: monthLabel,
        revenue: monthRev,
        orders: monthOrderCount,
      });
    }

    // Top selling product calculation
    const productSalesMap: Record<string, { name: string; count: number }> = {};
    orders.forEach((o) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const name = item.productName || item.product?.name || 'Noma\'lum';
          if (!productSalesMap[name]) {
            productSalesMap[name] = { name, count: 0 };
          }
          productSalesMap[name].count += Number(item.quantity || 1);
        });
      }
    });

    const topProducts = Object.values(productSalesMap).sort((a, b) => b.count - a.count);
    const topProduct = topProducts.length > 0 ? topProducts[0].name : (products[0]?.name || null);

    return {
      totalRevenue,
      totalOrders,
      pendingCustomCakes,
      activeProducts,
      monthlyRevenue,
      categoryDistribution,
      orderStatusCounts,
      topProduct,
    };
  }
}
