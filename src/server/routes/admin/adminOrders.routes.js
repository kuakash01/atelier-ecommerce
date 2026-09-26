const express = require("express");
const router = express.Router();

const verifyToken = require("../../middlewares/verifyToken")
const roleCheck = require("../../middlewares/roleCheck")
const { getAllOrders, updateOrderStatus, getOrderById, getDashboardStats } = require("../../conrollers/admin/adminOrder.controller")

router.get("/dashboard/stats", verifyToken, roleCheck("admin"), getDashboardStats)
router.get("/", verifyToken, roleCheck("admin"), getAllOrders)
router.get("/:id", verifyToken, roleCheck("admin"), getOrderById)
router.patch("/:orderId/status", verifyToken, roleCheck("admin"), updateOrderStatus)

module.exports = router;