const Cart = require('../models/cart.model');
const CartItem = require('../models/cartItem.model');
const Order = require('../models/order.model'); // Order Model
const Address = require('../models/address.model');
const crypto = require('node:crypto');
const Product = require('../models/product.model');
const mongoose = require("mongoose");
const pricing = require('../utils/pricing');
const razorpay = require('../utils/razorpay');


const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD${timestamp}${random}`;
};

const createOrder = async (req, res) => {
    try {
        const { type, productId, variantId, buyNowQty, paymentMethod } = req.body;
        const userId = req.user.id;
        let orderItems = [];
        let priceSummary = {
            basePriceSubTotal: 0,
            mrpSubTotal: 0,
            subTotal: 0,
            taxAmount: 0,
            deliveryCharge: 0,
            discount: 0,
            total: 0,
        };

        // Normalize order type: default to BUY_NOW if productId & variantId present, else CART
        let orderType = (type || "").toString().trim().toUpperCase();
        if (orderType !== "CART" && orderType !== "BUY_NOW") {
            orderType = (productId && variantId) ? "BUY_NOW" : "CART";
        }

        // Cart order
        if (orderType === "CART") {

            let cart = await Cart.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(userId) } },
                { $limit: 1 },
                {
                    $lookup: {
                        from: "cartitems",
                        let: { items: "$items" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $in: ["$_id", "$$items"] }
                                }

                            },
                            {
                                $project: {
                                    product: 1,
                                    variant: 1,
                                    quantity: 1,
                                    price: 1,
                                    mrp: 1,
                                }
                            }
                        ],

                        as: "items"
                    }
                },
                {
                    $unwind: "$items"
                },
                {
                    $lookup: {
                        from: "products",

                        let: {
                            productId: "$items.product",
                            variantId: "$items.variant"
                        },

                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$productId"] }
                                }
                            },

                            {
                                $project: {
                                    title: 1,
                                    price: 1,
                                    images: 1,
                                    category: 1,
                                    description: 1,
                                    colorGalleries: 1,

                                    variant: {
                                        $filter: {
                                            input: "$variants",
                                            as: "variant",
                                            cond: {
                                                $eq: [
                                                    "$$variant._id",
                                                    { $toObjectId: "$$variantId" }
                                                ]
                                            }
                                        },
                                    }
                                }
                            },
                            {
                                $unwind: "$variant"
                            },
                            {
                                $lookup: {
                                    from: "sizes",
                                    let: { sizeId: "$variant.size" },
                                    pipeline: [
                                        {
                                            $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$sizeId" }] } }
                                        },
                                        {
                                            $project: {
                                                sizeName: 1,
                                                sizeValue: 1
                                            }
                                        }
                                    ],
                                    as: "sizeDetails"
                                }
                            },
                            {
                                $lookup: {
                                    from: "colors",
                                    let: { colorId: "$variant.color" },
                                    pipeline: [
                                        {
                                            $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$colorId" }] } }
                                        },
                                        {
                                            $project: {
                                                colorName: 1,
                                                colorHex: 1
                                            }
                                        }
                                    ],
                                    as: "colorDetails"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$colorDetails",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $unwind: {
                                    path: "$sizeDetails",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $addFields: {
                                    gallery: {
                                        $filter: {
                                            input: "$colorGalleries",
                                            as: "gallery",
                                            cond: {
                                                $eq: [
                                                    "$$gallery.color",
                                                    "$variant.color"
                                                ]
                                            }
                                        }
                                    },
                                    "variant.size": "$sizeDetails",
                                    "variant.color": "$colorDetails"

                                }
                            },
                            {
                                $unwind: {
                                    path: "$gallery",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    colorGalleries: 0,
                                    variants: 0,
                                    sizeDetails: 0,
                                    colorDetails: 0
                                }
                            }
                        ],

                        as: "product"
                    }
                },
                {
                    $unwind: "$product"
                },
                // {
                //     $lookup: {
                //         from: "categories",
                //         let: { categoryId: "$product.category" },
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {$eq: ["$_id", "$$categoryId"]}
                //                 }
                //             },
                //             // {
                //             //     $project: {
                //             //         name: 1,
                //             //     }
                //             // }
                //         ],
                //         as: "cat"

                //     }
                // },
                // {
                //     $unwind: "$product.category"
                // },
                {
                    $addFields: {
                        "items.product": "$product",
                        "items.subTotal": { $multiply: ["$items.price", "$items.quantity"] },


                    }
                },
                {
                    $project: {
                        product: 0,
                        "items.variant": 0
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        user: { $first: "$user" },
                        items: { $push: "$items" }
                    }
                },

            ]);
            cart = cart[0];
            // return res.status(200).json({ status: "success", message: "Cart fetched successfully", data: cart });

            if (!cart?.items?.length) return res.status(400).json({ status: "failed", message: "Cart is empty", cart });

            // Snapshot products
            cart.items.forEach(item => {
                const galleryList = item.product.gallery?.gallery || [];
                const formattedGallery = galleryList.map(img => ({
                    public_id: img.public_id,
                    url: img.url
                }));

                const variantPrice = Number(item.product.variant?.price) || 0;
                const variantMrp = Number(item.product.variant?.mrp) || variantPrice;
                const variantGstRate = Number(item.product.variant?.gstRate) || 0;
                let variantBasePrice = Number(item.product.variant?.basePrice) || 0;
                let variantGstAmount = Number(item.product.variant?.gstAmount) || 0;

                if (!variantBasePrice || variantBasePrice <= 0) {
                    if (variantGstRate > 0) {
                        variantBasePrice = Number(((variantPrice * 100) / (100 + variantGstRate)).toFixed(2));
                        variantGstAmount = Number((variantPrice - variantBasePrice).toFixed(2));
                    } else {
                        variantBasePrice = variantPrice;
                        variantGstAmount = 0;
                    }
                } else if (!variantGstAmount && variantGstRate > 0) {
                    variantGstAmount = Number((variantPrice - variantBasePrice).toFixed(2));
                }

                let cartItem = {
                    product: item.product._id,
                    title: item.product.title,
                    price: variantPrice,
                    mrp: variantMrp,
                    gstRate: variantGstRate,
                    basePrice: variantBasePrice,
                    gstAmount: variantGstAmount,
                    description: item.product.description,
                    gallery: formattedGallery,
                    category: item.product.category,
                    size: item.product.variant?.sizeDetails?.sizeName || item.product.variant?.size?.sizeName || "Standard",
                    quantity: item.quantity,
                    subTotal: variantPrice * item.quantity,
                };
                orderItems.push(cartItem);
                priceSummary.basePriceSubTotal += variantBasePrice * item.quantity;
                priceSummary.mrpSubTotal += variantMrp * item.quantity;
                priceSummary.subTotal += cartItem.subTotal;
                priceSummary.taxAmount += variantGstAmount * item.quantity;
                priceSummary.discount += (variantMrp - variantPrice) * item.quantity;
            });

            // priceSummary.total = orderItems.reduce((sum, item) => sum + item.subTotal, 0);
            // return res.status(200).json({ status: "success", message: "Cart order preview fetched successfully", data: { orderItems, totalAmount } });

        } else if (orderType === "BUY_NOW") {
            // Handle buy now logic (similar to cart but for a single product)
            // Fetch product details, calculate total, and create order item
            let product = await Product.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(productId) } },
                { $limit: 1 },
                {
                    $project: {
                        title: 1,
                        price: 1,
                        mrp: 1,
                        description: 1,
                        images: 1,
                        category: 1,
                        colorGalleries: 1,
                        variant: {
                            $filter: {
                                input: "$variants",
                                as: "variant",
                                cond: {
                                    $eq: [
                                        "$$variant._id",
                                        { $toObjectId: variantId }
                                    ]
                                }
                            }
                        },
                    }
                },

                {
                    $unwind: "$variant"
                },
                {
                    $addFields: {
                        gallery: {
                            $filter: {
                                input: "$colorGalleries",
                                as: "gallery",
                                cond: {
                                    $eq: [
                                        "$$gallery.color",
                                        "$variant.color"
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: { path: "$gallery", preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        colorGalleries: 0,
                    }
                },
                {
                    $lookup: {
                        from: "sizes",
                        let: { sizeId: "$variant.size" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", { $toObjectId: "$$sizeId" }]
                                    }
                                }
                            },
                            {
                                $project: {
                                    sizeName: 1,
                                    sizeValue: 1
                                }
                            }
                        ],
                        as: "sizeDetails"
                    }
                },
                { $unwind: { path: "$sizeDetails", preserveNullAndEmptyArrays: true } },

                // {
                //     $lookup: {
                //         from: "sizes",
                //         let: { sizeId: "$variant.size" },
                //         pipeline: [
                //             {
                //                 $match: {
                //                     _id: "$$sizeId"
                //                 }
                //             },
                //             {
                //                 $project: {
                //                     sizeName: 1
                //                 }
                //             }
                //         ],
                //         as: "sizeDetails"
                //     }
                // },
            ]);

            product = product[0];

            if (!product) return res.status(404).json({ status: "failed", message: "Product not found" });
            const galleryList = product.gallery?.gallery || [];
            const formattedGallery = galleryList.map(img => ({
                public_id: img.public_id,
                url: img.url
            }));

            const qty = Number(buyNowQty) || 1;
            const variantPrice = Number(product.variant?.price) || 0;
            const variantMrp = Number(product.variant?.mrp) || variantPrice;
            const variantGstRate = Number(product.variant?.gstRate) || 0;
            let variantBasePrice = Number(product.variant?.basePrice) || 0;
            let variantGstAmount = Number(product.variant?.gstAmount) || 0;

            if (!variantBasePrice || variantBasePrice <= 0) {
                if (variantGstRate > 0) {
                    variantBasePrice = Number(((variantPrice * 100) / (100 + variantGstRate)).toFixed(2));
                    variantGstAmount = Number((variantPrice - variantBasePrice).toFixed(2));
                } else {
                    variantBasePrice = variantPrice;
                    variantGstAmount = 0;
                }
            } else if (!variantGstAmount && variantGstRate > 0) {
                variantGstAmount = Number((variantPrice - variantBasePrice).toFixed(2));
            }

            orderItems.push({
                product: product._id,
                title: product.title,
                price: variantPrice,
                mrp: variantMrp,
                gstRate: variantGstRate,
                basePrice: variantBasePrice,
                gstAmount: variantGstAmount,
                description: product.description,
                gallery: formattedGallery,
                categories: product.categories,
                size: product.sizeDetails?.sizeName || "Standard",
                quantity: qty,
                subTotal: variantPrice * qty
            });
            priceSummary.mrpSubTotal += variantMrp * qty;
            priceSummary.subTotal += variantPrice * qty;
            priceSummary.basePriceSubTotal += variantBasePrice * qty;
            priceSummary.taxAmount += variantGstAmount * qty;
            priceSummary.discount += (variantMrp - variantPrice) * qty;

            // priceSummary.total = orderItems.reduce((sum, item) => sum + item.subTotal, 0);
        } else if (orderType === "BUY_NOW") {
            // Already handled in BUY_NOW block
        }

        priceSummary.deliveryCharge = await pricing.calculateDeliveryCharge(priceSummary.subTotal);
        priceSummary.total = priceSummary.subTotal + priceSummary.deliveryCharge;

        priceSummary.basePriceSubTotal = Number(priceSummary.basePriceSubTotal.toFixed(2));
        priceSummary.taxAmount = Number(priceSummary.taxAmount.toFixed(2));
        priceSummary.subTotal = Number(priceSummary.subTotal.toFixed(2));
        priceSummary.mrpSubTotal = Number(priceSummary.mrpSubTotal.toFixed(2));
        priceSummary.discount = Number(priceSummary.discount.toFixed(2));
        priceSummary.deliveryCharge = Number((priceSummary.deliveryCharge || 0).toFixed(2));
        priceSummary.total = Number(priceSummary.total.toFixed(2));


        // Snapshot address
        const address = await Address.findOne({ user: userId, isDefault: true });
        if (!address)
            return res.status(404).json({ status: "failed", message: "Invalid address provided" });

        const formatAddress = ({ fullName, phone, alternatePhone, addressLine1, addressLine2, landmark, city, state, country, pincode }) => ({
            fullName, phone, alternatePhone, addressLine1, addressLine2, landmark, city, state, country, pincode
        });

        const orderId = generateOrderId()
        let txId = null;

        if (paymentMethod === "online") {
            const options = {
                amount: Math.round(priceSummary.total * 100), // amount in paise
                currency: "INR",
                receipt: orderId,
                payment_capture: 1
            };
            const razorpayOrder = await razorpay.orders.create(options);

            const order = await Order.create({
                user: userId,
                items: orderItems,
                orderId,
                address: formatAddress(address),
                status: "pending",
                priceSummary,
                paymentDetails: {
                    method: "online",
                    transactionId: razorpayOrder.id,
                    payableAmount: priceSummary.total,
                    status: "pending"
                }
            });

            return res.status(201).json({
                status: "success",
                message: "Verify payment to complete order",
                razorpayOrderId: razorpayOrder.id,
                key: process.env.RAZORPAY_KEY_ID,
                orderDocId: order._id,
                amount: Math.round(priceSummary.total * 100),
                currency: "INR"
            });
        }


        // Create order
        const order = await Order.create({
            user: userId,
            items: orderItems,
            orderId,
            address: formatAddress(address),
            status: "confirmed",
            priceSummary,
            paymentDetails: {
                method: "cod",
                transactionId: txId,
                payableAmount: priceSummary.total,
                status: "pending"
            }
        });

        // Clear cart only if order placed from cart
        if (orderType === "CART") {
            await CartItem.deleteMany({ user: userId });
            await Cart.updateOne({ user: userId }, { $set: { items: [] } });
        }


        res.status(201).json({
            status: "success",
            message: "Order created successfully",
            order: {
                orderDocId: order._id,
                paymentDetails: order.paymentDetails,
            }
        });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};


const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");


        const order = await Order.findOne({
            "paymentDetails.transactionId": razorpay_order_id
        });

        if (!order) return res.status(404).json({ status: "failed" });

        if (expectedSign !== razorpay_signature) {
            order.status = "cancelled";
            order.paymentDetails.status = "failed";
            order.cancelReason = "Payment signature verification failed";
            await order.save();
            return res.status(400).json({ status: "failed", message: "Invalid payment signature" });
        }
        order.status = "confirmed";
        order.paymentDetails.status = "paid";
        order.paymentDetails.paymentId = razorpay_payment_id;
        order.paymentDetails.paidAt = new Date();

        await order.save();

        await CartItem.deleteMany({ user: order.user });
        await Cart.updateOne({ user: order.user }, { $set: { items: [] } });

        res.json({ status: "success" });
    } catch (err) {
        console.error("Payment verification error:", err);
        res.status(500).json({ status: "failed" });
    }
};

// Helper: Auto-expire abandoned online orders pending for > 20 minutes
const autoExpireStaleOrders = async () => {
    try {
        const cutoff = new Date(Date.now() - 20 * 60 * 1000);
        await Order.updateMany(
            {
                status: "pending",
                "paymentDetails.method": "online",
                "paymentDetails.status": "pending",
                createdAt: { $lt: cutoff }
            },
            {
                $set: {
                    status: "cancelled",
                    "paymentDetails.status": "failed",
                    cancelReason: "Payment session expired (abandoned checkout)"
                }
            }
        );
    } catch (err) {
        console.error("Auto-expire stale orders error:", err);
    }
};

// Handle client-side payment dismissal or payment failure event
const handlePaymentFailed = async (req, res) => {
    try {
        const { orderDocId, reason } = req.body;
        const userId = req.user.id;

        if (!orderDocId) {
            return res.status(400).json({ status: "failed", message: "Order ID is required" });
        }

        const order = await Order.findOne({ _id: orderDocId, user: userId });
        if (!order) {
            return res.status(404).json({ status: "failed", message: "Order not found" });
        }

        // Only transition if the order was still pending
        if (order.status === "pending" && order.paymentDetails?.status === "pending") {
            order.status = "cancelled";
            order.paymentDetails.status = "failed";
            order.cancelReason = reason || "Payment cancelled or abandoned by user";
            await order.save();
        }

        res.status(200).json({
            status: "success",
            message: "Order marked as cancelled/failed",
            orderId: order.orderId
        });
    } catch (err) {
        console.error("Error updating failed payment order:", err);
        res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};

// Server-to-server Razorpay webhook listener for asynchronous event processing
const razorpayWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers["x-razorpay-signature"];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

        if (webhookSecret && webhookSignature) {
            const shasum = crypto.createHmac("sha256", webhookSecret);
            shasum.update(JSON.stringify(req.body));
            const digest = shasum.digest("hex");
            if (digest !== webhookSignature) {
                return res.status(400).json({ status: "failed", message: "Invalid webhook signature" });
            }
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === "payment.captured" || event === "order.paid") {
            const razorpayOrderId = payload?.order?.entity?.id || payload?.payment?.entity?.order_id;
            const razorpayPaymentId = payload?.payment?.entity?.id;

            if (razorpayOrderId) {
                const order = await Order.findOne({ "paymentDetails.transactionId": razorpayOrderId });
                if (order && order.status !== "confirmed" && order.status !== "delivered") {
                    order.status = "confirmed";
                    order.paymentDetails.status = "paid";
                    if (razorpayPaymentId) order.paymentDetails.paymentId = razorpayPaymentId;
                    order.paymentDetails.paidAt = new Date();
                    await order.save();

                    // Clear cart
                    await CartItem.deleteMany({ user: order.user });
                    await Cart.updateOne({ user: order.user }, { $set: { items: [] } });
                }
            }
        } else if (event === "payment.failed") {
            const razorpayOrderId = payload?.payment?.entity?.order_id;
            const errorDesc = payload?.payment?.entity?.error_description || "Payment failed at gateway";

            if (razorpayOrderId) {
                const order = await Order.findOne({ "paymentDetails.transactionId": razorpayOrderId });
                if (order && order.status === "pending") {
                    order.status = "cancelled";
                    order.paymentDetails.status = "failed";
                    order.cancelReason = errorDesc;
                    await order.save();
                }
            }
        }

        res.status(200).json({ status: "ok" });
    } catch (err) {
        console.error("Razorpay webhook error:", err);
        res.status(500).json({ status: "failed" });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id; // user ID is available in req.user

        // Proactively expire stale pending online orders before querying
        await autoExpireStaleOrders();

        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).select("orderId createdAt priceSummary paymentDetails status cancelReason").lean();

        res.status(200).json({ status: "success", message: "Orders fetched successfully", data: orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        // Auto-expire stale orders before retrieval
        await autoExpireStaleOrders();

        let query = { user: userId };
        if (mongoose.Types.ObjectId.isValid(orderId)) {
            query.$or = [{ _id: orderId }, { orderId: orderId }];
        } else {
            query.orderId = orderId;
        }

        const order = await Order.findOne(query);

        if (!order) {
            return res.status(404).json({
                status: "failed",
                message: "Order not found"
            });
        }

        const orderSummary = {
            subtotal: order.priceSummary?.subTotal || order.items.reduce((sum, item) => sum + (item.subTotal || item.price * item.quantity), 0),
            basePriceSubTotal: order.priceSummary?.basePriceSubTotal || 0,
            taxAmount: order.priceSummary?.taxAmount || 0,
            deliveryCharge: order.priceSummary?.deliveryCharge ?? 0,
            total: order.priceSummary?.total || order.items.reduce((sum, item) => sum + (item.subTotal || item.price * item.quantity), 0),
            discount: order.priceSummary?.discount || 0,
        };

        res.status(200).json({
            status: "success",
            message: "Order details fetched successfully",
            data: {
                order,
                orderSummary
            }
        });

    } catch (error) {
        console.error("Get order details error:", error);

        res.status(500).json({
            status: "failed",
            message: "Internal server error"
        });
    }

};


module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    verifyPayment,
    handlePaymentFailed,
    razorpayWebhook,
    autoExpireStaleOrders
};

