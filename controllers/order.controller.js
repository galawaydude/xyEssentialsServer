const asyncHandler = require('express-async-handler');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');
const Order = require('../models/order.model');
const path = require('path');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/resend');

// Get all orders for a user
const getUserOrders = asyncHandler(async (req, res) => {
  console.log('Fetching orders for user:', req.user._id);
  const orders = await Order.find({ user: req.user._id })
    .populate('orderItems.productId')
    .populate('shippingAddress');
  console.log('Orders found:', orders);
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('orderItems.productId')
    .populate('shippingAddress');
  res.json(orders);
});

// Create a new order
const placeOrder = asyncHandler(async (req, res) => {
  console.log('Request Body:', req.body); // Log the request body
  console.log('User Info:', req.user); // Log user information

  try {
    const orderData = {
      ...req.body,
      user: req.user._id,
    };

    console.log('Order Data:', orderData);

    const order = new Order(orderData);

    const createdOrder = await order.save();

    // Update user with the new order ID
    req.user.orders.push(createdOrder._id);
    await req.user.save();

    console.log('Created Order:', createdOrder); // Log the created order
    res.status(201).json(createdOrder); // Respond with the created order
  } catch (error) {
    console.error('Error creating order:', error); // Log any errors that occur
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

const createOrder = asyncHandler(async (req, res) => {
    const order = await Order.create(req.body);
    await sendOrderConfirmation(req.user, order);
    res.status(201).json(order);
});

const generateBill = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the order details from MongoDB
    console.log(`Fetching order with ID: ${id}`);
    const order = await Order.findById(id)
    .populate('orderItems.product') // Populate product details
    .populate('shippingAddress') // Populate address details
    .populate('user') // Populate user with specific fields (name and phone)
    .lean();
    console.log('Fetched Order:', order);


    // Check if order exists
    if (!order) {
      console.log(`Order not found for ID: ${id}`);
      return res.status(404).send("Order not found");
    }

    // Render the HTML using EJS
    console.log('Rendering HTML for the invoice...');
    const html = await ejs.renderFile(
      path.join(__dirname, '../views/invoiceTemplate.ejs'),
      { order }
    );

    console.log('Rendered HTML:', html.substring(0, 200)); // Log the first 200 characters of the HTML for brevity

    // Generate PDF using Puppeteer
    console.log('Launching Puppeteer to generate PDF...');
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    console.log('Setting page content...');
    await page.setContent(html);
    
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        bottom: '20px',
        left: '10px',
        right: '10px',
      },
    });

    console.log('PDF Buffer Size:', pdfBuffer.length);
    
    await browser.close();

    // Check if pdfBuffer is valid
    if (pdfBuffer.length === 0) {
      console.log('Error: PDF buffer is empty. Unable to generate PDF.');
      return res.status(500).send("Error generating PDF");
    }

    // Set the response headers for downloading the PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Order_${order._id}_Bill.pdf"`
    });

    // Send the PDF as a response
    console.log('Sending PDF to client...');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Error generating bill:", error);
    res.status(500).send("Error generating bill");
  }
};




// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')
    .populate('orderItems.productId')
    .populate('shippingAddress');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// Update waybill number 
const updateWaybillNumber = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.waybillNumber = req.body.waybillNumber || order.waybillNumber;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// Update order status (Admin Only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.orderStatus = req.body.orderStatus || order.orderStatus;
    order.deliveredAt = req.body.orderStatus === 'Delivered' ? Date.now() : order.deliveredAt;

    const updatedOrder = await order.save();
    await sendOrderStatusUpdate(req.user, updatedOrder);
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// Cancel an order (Admin Only)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isCancelled = true;
    order.cancelledAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  getUserOrders,
  getAllOrders,
  placeOrder,
  generateBill,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  updateWaybillNumber,
  createOrder
};
