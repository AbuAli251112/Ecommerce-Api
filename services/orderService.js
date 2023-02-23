const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const ApiError = require('../utils/apiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const factory = require('./handlersFactory');

exports.checkoutSession = asyncHandler(async (req, res, next) => {
	const taxPrice = 0;
	const shippingPrice = 0;
	const cart = await Cart.findById(req.params.cartId);
	if (!cart) {
    	return next(new ApiError(`There is no such cart with id ${req.params.cartId}`, 404));
  	}
  	const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;
  	const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  	const session = await stripe.checkout.sessions.create({
		line_items: [{
			price_data: {
				currency: 'egp',
				unit_amount: totalOrderPrice * 100,
				product_data: {
					name: req.user.name,
				},
			},
			quantity: 1,
		}],
		mode: 'payment',
		success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
		cancel_url: `${req.protocol}://${req.get("host")}/cart`,
		customer_email: req.user.email,
  		client_reference_id: req.params.cartId,
  		metadata: req.body.shippingAddress
	});
  	res.status(200).json({ status: 'success', session });
});

exports.createCashOrder = asyncHandler(async (req, res, next) => {
	const taxPrice = 0;
  	const shippingPrice = 0;
  	const cart = await Cart.findById(req.params.cartId);
  	if (!cart) {
    	return next(new ApiError(`There is no such cart with id ${req.params.cartId}`, 404));
  	}
  	const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;
  	const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  	const order = await Order.create({
  		user: req.user._id,
  		cartItems: cart.cartItems,
  		shippingAddress: req.body.shippingAddress,
  		totalOrderPrice
  	});
  	if (order) {
  		const bulkOption = cart.cartItems.map((item) => ({
  			updateOne: {
  				filter: { _id: item.product },
  				update: { $inc: { quantity: -item.quantity, sold: +item.quantity }}
  			}
  		}));
  		console.log(bulkOption);
  		await Product.bulkWrite(bulkOption, {});
  		await Cart.findByIdAndDelete(req.params.cartId);
  	}
  	res.status(201).json({ status: 'success', data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
	if (req.user.role === 'user') {
		req.filterObj = { user: req.user._id };
	}
	next();
});

exports.findAllOrders = factory.getAll(Order);

exports.findSpecificOrder = factory.getOne(Order);

exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if (!order) {
    	return next(new ApiError(`There is no such a order with this id:${req.params.id}`, 404));
  	}
  	order.isPaid = true;
  	order.paidAt = Date.now();
  	const updatedOrder = await order.save();
  	res.status(200).json({ status: 'success', data: updatedOrder });
});

exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
  	if (!order) {
		return next(new ApiError(`There is no such a order with this id:${req.params.id}`, 404));
  	}
  	order.isDelivered = true;
  	order.deliveredAt = Date.now();
  	const updatedOrder = await order.save();
  	res.status(200).json({ status: 'success', data: updatedOrder });
});

const createCardOrder = (async (session) => {
	const cartId = session.client_reference_id;
	const shippingAddress = session.metadata;
	const oderPrice = session.amount_total / 100;
	const cart = await Cart.findById(cartId);
  	const user = await User.findOne({ email: session.customer_email });
  	const order = await Order.create({
	    user: user._id,
	    cartItems: cart.cartItems,
	    shippingAddress,
	    totalOrderPrice: oderPrice,
	    isPaid: true,
	    paidAt: Date.now(),
	    paymentMethodType: 'card',
  	});
  	if (order) {
  		const bulkOption = cart.cartItems.map((item) => ({
      		updateOne: {
        		filter: { _id: item.product },
        		update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      		},
		}));
		await Product.bulkWrite(bulkOption, {})
		await Cart.findByIdAndDelete(cartId);
  	}
});

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
	const sig = req.headers['stripe-signature'];
	let event;
	try {
		event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
	} catch (err) {
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}
	if (event.type === 'checkout.session.completed') {
		createCardOrder(event.data.object)
	}
	res.status(200).json({ received: true })
});