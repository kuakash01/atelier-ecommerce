const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Address = require('../models/address.model');
const Size = require("../models/size.model");
const Color = require("../models/colors.model");
const pricing = require('../utils/pricing');



const checkoutPreview = async (req, res) => {
    const { id } = req.user;
    const { type, productId, variantId, buyNowQty } = req.body; // 'CART' or 'BUY_NOW'
    try {
        let orderType = (type || "").toString().trim().toUpperCase();
        if (orderType !== "CART" && orderType !== "BUY_NOW") {
            orderType = (productId && variantId) ? "BUY_NOW" : "CART";
        }

        const detailedItems = [];
        let cartSummary = {
            mrpSubTotal: 0,
            basePriceSubTotal: 0,
            taxAmount: 0,
            subtotal: 0,
            discount: 0,
            deliveryCharge: 0,
            total: 0,
            finalTotal: 0
        };

        let address = await Address.findOne({ user: id, isDefault: true });

        // Handle checkout preview based on type
        if (orderType === "CART") {
            let cart = await Cart.findOne({ user: id }).populate("items", "_id product variant quantity mrp price");


            if (!cart) {
                return res.status(404).json({ status: "failed", message: "Cart not found" });
            }

            for (const item of cart.items) {
                const product = await Product.findById(item.product);
                if (!product) continue;

                const variant = product.variants.find(v => v._id.toString() === item.variant.toString());
                if (!variant) continue;

                const colorGallery = product.colorGalleries?.find(g => g.color?.toString() === variant.color?.toString());
                const variantGallery = colorGallery?.gallery || [];
                const mainImage = variantGallery[0]?.url || product.thumbnail || product.mainImage || "";

                const variantColor = await Color.findById(variant.color);
                const variantSize = await Size.findById(variant.size);

                const variantPrice = Number(variant.price) || 0;
                const variantMrp = Number(variant.mrp) || variantPrice;
                const variantGstRate = Number(variant.gstRate) || 0;
                let variantBasePrice = Number(variant.basePrice) || 0;
                let variantGstAmount = Number(variant.gstAmount) || 0;

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
                    _id: item._id,
                    productId: product._id,
                    variantId: variant._id,

                    title: product.title,
                    mainImage,
                    price: variantPrice,
                    mrp: variantMrp,
                    basePrice: variantBasePrice,
                    gstRate: variantGstRate,
                    gstAmount: variantGstAmount,
                    stock: variant.quantity,

                    attributes: {
                        color: variantColor,
                        size: variantSize
                    },

                    quantity: item.quantity,
                };
                detailedItems.push(cartItem);

                cartSummary.mrpSubTotal += variantMrp * item.quantity;
                cartSummary.basePriceSubTotal += variantBasePrice * item.quantity;
                cartSummary.taxAmount += variantGstAmount * item.quantity;
                cartSummary.subtotal += variantMrp * item.quantity;
                cartSummary.total += variantPrice * item.quantity;
                cartSummary.discount += (variantMrp * item.quantity) - (variantPrice * item.quantity);
            }

            cartSummary.deliveryCharge = await pricing.calculateDeliveryCharge(cartSummary.total);
            cartSummary.finalTotal = cartSummary.total + cartSummary.deliveryCharge;

            cartSummary.mrpSubTotal = Number(cartSummary.mrpSubTotal.toFixed(2));
            cartSummary.basePriceSubTotal = Number(cartSummary.basePriceSubTotal.toFixed(2));
            cartSummary.taxAmount = Number(cartSummary.taxAmount.toFixed(2));
            cartSummary.subtotal = Number(cartSummary.subtotal.toFixed(2));
            cartSummary.total = Number(cartSummary.total.toFixed(2));
            cartSummary.discount = Number(cartSummary.discount.toFixed(2));
            cartSummary.deliveryCharge = Number((cartSummary.deliveryCharge || 0).toFixed(2));
            cartSummary.finalTotal = Number(cartSummary.finalTotal.toFixed(2));

        } else if (orderType === 'BUY_NOW') {
            const { quantity } = req.body;
            const qty = Number(buyNowQty) || Number(quantity) || 1;

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ status: "failed", message: "Product not found" });
            }
            const variant = product.variants.find(v => v._id.toString() === variantId);
            if (!variant) {
                return res.status(404).json({ status: "failed", message: "Variant not found" });
            }

            const colorGallery = product.colorGalleries?.find(g => g.color?.toString() === variant.color?.toString());
            const variantGallery = colorGallery?.gallery || [];
            const mainImage = variantGallery[0]?.url || product.thumbnail || product.mainImage || "";

            const variantColor = await Color.findById(variant.color);
            const variantSize = await Size.findById(variant.size);

            const variantPrice = Number(variant.price) || 0;
            const variantMrp = Number(variant.mrp) || variantPrice;
            const variantGstRate = Number(variant.gstRate) || 0;
            let variantBasePrice = Number(variant.basePrice) || 0;
            let variantGstAmount = Number(variant.gstAmount) || 0;

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

            let cartitem = {
                productId: product._id,
                variantId: variant._id,

                title: product.title,
                mainImage,
                price: variantPrice,
                mrp: variantMrp,
                basePrice: variantBasePrice,
                gstRate: variantGstRate,
                gstAmount: variantGstAmount,
                stock: variant.quantity,

                attributes: {
                    color: variantColor,
                    size: variantSize
                },

                quantity: qty,
            };
            detailedItems.push(cartitem);

            cartSummary.mrpSubTotal = Number((variantMrp * qty).toFixed(2));
            cartSummary.basePriceSubTotal = Number((variantBasePrice * qty).toFixed(2));
            cartSummary.taxAmount = Number((variantGstAmount * qty).toFixed(2));
            cartSummary.subtotal = Number((variantMrp * qty).toFixed(2));
            cartSummary.discount = Number(((variantMrp * qty) - (variantPrice * qty)).toFixed(2));
            cartSummary.total = Number((variantPrice * qty).toFixed(2));
            cartSummary.deliveryCharge = await pricing.calculateDeliveryCharge(cartSummary.total);
            cartSummary.deliveryCharge = Number((cartSummary.deliveryCharge || 0).toFixed(2));
            cartSummary.finalTotal = Number((cartSummary.total + cartSummary.deliveryCharge).toFixed(2));
        }

        detailedItems.reverse();

        res.status(200).json({
            status: "success",
            message: "Checkout details fetched successfully",
            data: {
                address,
                cartItems: detailedItems,
                cartSummary,
                type: orderType
            },

        });
    } catch (err) {
        console.error("Error in checkout preview:", err);
        return res.status(500).json({ status: "failed", message: "Server error" });
    }
}

module.exports = {
    checkoutPreview,
};