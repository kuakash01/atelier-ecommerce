const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");
const { autoExpireStaleOrders } = require("../order.controller");

// admin controllers
const getAllOrders = async (req, res) => {
  try {
    // Proactively clean up any stale unverified online orders older than 20 mins
    await autoExpireStaleOrders();

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { status, search } = req.query;

    let filter = {};

    // Status filter
    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }

    // Search filter across orderId, customer name/email, and address
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }]
      }).select('_id').lean();
      const userIds = matchingUsers.map(u => u._id);

      filter.$or = [
        { orderId: searchRegex },
        { 'address.fullName': searchRegex },
        { 'address.phone': searchRegex },
        { 'paymentDetails.transactionId': searchRegex },
        { user: { $in: userIds } }
      ];
    }

    // Run paginated orders query, total matching count, and status distribution in parallel
    const [orders, totalOrders, countsAgg] = await Promise.all([
      Order.find(filter)
        .select("orderId user priceSummary status cancelReason createdAt paymentDetails address items")
        .populate({ path: "user", select: "name email" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    // Format status counts dictionary
    const statusCounts = {
      all: 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0
    };

    let grandTotalOrders = 0;
    countsAgg.forEach(item => {
      const key = (item._id || '').toLowerCase();
      grandTotalOrders += item.count;
      if (statusCounts[key] !== undefined) {
        statusCounts[key] = item.count;
      } else if (key) {
        statusCounts[key] = item.count;
      }
    });
    statusCounts.all = grandTotalOrders;

    const totalPages = Math.ceil(totalOrders / limit) || 1;

    res.status(200).json({
      status: "success",
      message: "Orders fetched successfully",
      data: orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages
      },
      counts: statusCounts
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ status: "failed", message: "Internal server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'pending', 'confirmed', 'processing',
      'shipped', 'delivered', 'cancelled', 'returned'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid status"
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found"
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      status: "success",
      message: "Order status updated"
    });

  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Server error"
    });
  }
};





const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { orderId: id }] };
    } else {
      query = { orderId: id };
    }

    const order = await Order.findOne(query)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: order
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to fetch order"
    });
  }
};

const Product = require("../../models/product.model");

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const totalUsers = await User.countDocuments({ role: "customer" });

    // Total revenue from all non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled", "returned"] } } },
      { $group: { _id: null, total: { $sum: "$priceSummary.total" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Monthly revenue for the last 6-12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          status: { $nin: ["cancelled", "returned"] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$priceSummary.total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = monthlyAgg.find(item => item._id.year === y && item._id.month === m);
      monthlyRevenue.push({
        name: `${monthNames[m - 1]} ${String(y).slice(-2)}`,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0
      });
    }

    // Recent 6 orders
    const recentOrders = await Order.find()
      .select("orderId user priceSummary status paymentDetails createdAt")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(6);

    // Top products by order count
    const topProductsAgg = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.title",
          totalQuantity: { $sum: "$items.quantity" },
          totalSales: { $sum: "$items.subTotal" },
          gallery: { $first: "$items.gallery" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        revenue: totalRevenue,
        orderCount: totalOrders,
        productCount: totalProducts,
        userCount: totalUsers,
        monthlyRevenue,
        recentOrders,
        topProducts: topProductsAgg
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ status: "failed", message: "Error fetching dashboard statistics" });
  }
};

module.exports = { getAllOrders, updateOrderStatus, getOrderById, getDashboardStats };
