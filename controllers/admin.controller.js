const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard statistics...');
    // Basic Stats
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    console.log('Done fetching basic stats. Total orders:', totalOrders, ', total users:', totalUsers, ', total products:', totalProducts);

    // Orders by Status
    const orderStats = {
      pending: await Order.countDocuments({ status: 'pending' }),
      processing: await Order.countDocuments({ status: 'processing' }),
      shipped: await Order.countDocuments({ status: 'shipped' }),
      delivered: await Order.countDocuments({ status: 'delivered' }),
      cancelled: await Order.countDocuments({ status: 'cancelled' })
    };
    console.log('Done fetching order stats:', orderStats);

    // Payment Stats
    const paymentStats = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$finalPrice' }
        }
      }
    ]);
    console.log('Done fetching payment stats:', paymentStats);

    // Calculate total revenue from all orders
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalPrice' }
        }
      }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    console.log('Done fetching total revenue:', totalRevenue);

    // Calculate monthly revenue for the last 12 months
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$finalPrice' }
        }
      },
      {
        $sort: { 
          '_id.year': -1, 
          '_id.month': -1 
        }
      },
      {
        $limit: 12
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' }
                }
              }
            ]
          },
          amount: '$revenue'
        }
      }
    ]);

    // Calculate current month's revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const currentMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalPrice' }
        }
      }
    ]);

    // Recent Orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .select('orderNumber status finalPrice createdAt items');
    console.log('Done fetching recent orders:', recentOrders);

    // Growth Stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const newUsers = await User.countDocuments({ createdAt: { $gte: thisMonth } });
    const newOrders = await Order.countDocuments({ createdAt: { $gte: thisMonth } });
    console.log('Done fetching growth stats:', newUsers, newOrders);

    // Low Stock Alert
    const lowStockItems = await Product.countDocuments({ stock: { $lt: 10 } });
    console.log('Done fetching low stock items:', lowStockItems);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      currentMonthRevenue: currentMonthRevenue[0]?.total || 0,
      orderStats,
      paymentStats,
      monthlyRevenue,
      recentOrders,
      newUsers,
      newOrders,
      lowStockItems
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

const getSalesAnalytics = async (req, res) => {
    try {
        // Daily sales for last 30 days
        const dailySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$finalPrice" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Average order value
        const averageOrderValue = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    avg: { $avg: "$finalPrice" }
                }
            }
        ]);

        // Sales by time of day
        const salesByHour = await Order.aggregate([
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    sales: { $sum: "$finalPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({ dailySales, averageOrderValue: averageOrderValue[0]?.avg, salesByHour });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductAnalytics = async (req, res) => {
    try {
        // Best selling products
        const bestSellers = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.productId",
                    totalSold: { $sum: "$orderItems.quantity" },
                    revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            }
        ]);

        // Product category performance
        const categoryPerformance = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.category",
                    sales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
                    quantity: { $sum: "$orderItems.quantity" }
                }
            }
        ]);

        res.json({ bestSellers, categoryPerformance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCustomerAnalytics = async (req, res) => {
    try {
        // Customer retention rate
        const totalCustomers = await User.countDocuments();
        const repeatCustomers = await Order.aggregate([
            { $group: { _id: "$userId", orderCount: { $sum: 1 } } },
            { $match: { orderCount: { $gt: 1 } } },
            { $count: "count" }
        ]);

        // Average customer lifetime value
        const customerLifetimeValue = await Order.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: "$finalPrice" }
                }
            },
            {
                $group: {
                    _id: null,
                    averageLTV: { $avg: "$totalSpent" }
                }
            }
        ]);

        res.json({
            retentionRate: (repeatCustomers[0]?.count || 0) / totalCustomers,
            averageLTV: customerLifetimeValue[0]?.averageLTV || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInventoryAnalytics = async (req, res) => {
    try {
        // Inventory turnover
        const inventoryTurnover = await Product.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "orderItems.productId",
                    as: "orders"
                }
            },
            {
                $project: {
                    name: 1,
                    stock: 1,
                    sold: { $size: "$orders" }
                }
            }
        ]);

        // Stock alerts
        const stockAlerts = await Product.find({ stock: { $lt: 10 } })
            .select('name stock category price')
            .sort({ stock: 1 });

        res.json({ inventoryTurnover, stockAlerts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRevenueMetrics = async (req, res) => {
    try {
        // Average Order Value (AOV)
        const aov = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    averageOrderValue: { $avg: "$finalPrice" }
                }
            }
        ]);

        // Revenue by Category
        const categoryRevenue = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.category",
                    revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // Year-over-Year Growth
        const thisYear = new Date().getFullYear();
        const yearlyRevenue = await Order.aggregate([
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    revenue: { $sum: "$finalPrice" }
                }
            },
            { $sort: { "_id": -1 } }
        ]);

        // Calculate growth rate
        const currentYearRevenue = yearlyRevenue.find(y => y._id === thisYear)?.revenue || 0;
        const lastYearRevenue = yearlyRevenue.find(y => y._id === thisYear - 1)?.revenue || 0;
        const growthRate = lastYearRevenue ? ((currentYearRevenue - lastYearRevenue) / lastYearRevenue) * 100 : 0;

        res.json({
            aov: aov[0]?.averageOrderValue || 0,
            categoryRevenue,
            yearlyRevenue,
            growthRate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPerformanceMetrics = async (req, res) => {
    try {
        // Customer Lifetime Value (CLV)
        const clv = await Order.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: "$finalPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    averageLifetimeValue: { $avg: "$totalSpent" },
                    averageOrdersPerCustomer: { $avg: "$orderCount" }
                }
            }
        ]);

        // Customer Acquisition Cost (dummy calculation - should be replaced with actual marketing costs)
        const totalCustomers = await User.countDocuments();
        const marketingCost = 100000; // Example fixed cost
        const cac = totalCustomers ? marketingCost / totalCustomers : 0;

        // Return on Investment (ROI)
        const totalRevenue = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$finalPrice" }
                }
            }
        ]);
        const roi = ((totalRevenue[0]?.total || 0) - marketingCost) / marketingCost * 100;

        // Conversion Rate
        const totalVisits = 10000; // Example - should be replaced with actual analytics data
        const totalOrders = await Order.countDocuments();
        const conversionRate = (totalOrders / totalVisits) * 100;

        res.json({
            customerLifetimeValue: clv[0]?.averageLifetimeValue || 0,
            ordersPerCustomer: clv[0]?.averageOrdersPerCustomer || 0,
            customerAcquisitionCost: cac,
            roi,
            conversionRate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export all controllers
module.exports = {
    getDashboardStats,
    getSalesAnalytics,
    getProductAnalytics,
    getCustomerAnalytics,
    getInventoryAnalytics,
    getRevenueMetrics,
    getPerformanceMetrics
};

