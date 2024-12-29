const asyncHandler = require('express-async-handler');
const Payment = require('../models/payment.model');
const crypto = require('crypto');
const {razorpayInstance} = require('../config/razorpayConfig');

// Process a new payment
const processRazorpay = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  // Log the incoming request body
  console.log("Received request to create Razorpay order:", req.body);

  const amountInRupees = Math.round(amount);
  // Create a new order in Razorpay
  const options = {
    amount: amountInRupees * 100, // Amount in paise
    currency: "INR",
    receipt: "receipt#1",
    payment_capture: 1, 
  };

  console.log("Order options:", options); // Log the options being sent to Razorpay

  try {
    const order = await razorpayInstance.orders.create(options);
    console.log("Order created successfully:", order); // Log the order details
    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error); // Log the error
    res.status(500).json({ message: "Error creating order" });
  }
});


const verify = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, amount, transactionId, signature } = req.body;
  console.log(req.body);

  // Debugging: Log incoming request data
  console.log('Received payment verification request:', {
    orderId,
    paymentMethod,
    amount,
    transactionId,
    signature,
    userId: req.user._id
  });

  if (paymentMethod === 'razorpay') {
    const isValidSignature = validateSignature(orderId, transactionId, signature);

    if (!isValidSignature) {
      console.error('Invalid payment signature');
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
  }

  try {
    // Logic to save payment details
    const paymentData = {
      user: req.user._id,
      paymentMethod,
      amount,
      status: 'Completed', // Add this field
      paidAt: Date.now(),
    };

    // Include paymentId and signature only for Razorpay payments
    if (paymentMethod === 'razorpay') {
      paymentData.razorpayOrderId = orderId; // Save Razorpay order ID
      paymentData.paymentId = transactionId; // Razorpay payment ID
      paymentData.signature = signature; // Razorpay signature
    }

    const payment = new Payment(paymentData);

    // Debugging: Log payment object before saving
    console.log('Payment object to be saved:', payment);

    await payment.save();

    // Debugging: Log successful save
    console.log('Payment saved successfully:', payment);

    res.status(201).json(payment);
  } catch (error) {
    // Debugging: Log error details
    console.error('Error saving payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Function to validate the signature
const validateSignature = (orderId, transactionId, signature) => {
  const crypto = require('crypto');
  const key = process.env.RAZORPAY_SECRET;

  const generatedSignature = crypto
    .createHmac('sha256', key)
    .update(`${orderId}|${transactionId}`)
    .digest('hex');

  return generatedSignature === signature;
};



const handleRazorpayWebhook = async (req, res) => {
  const secret = 'YOUR_RAZORPAY_WEBHOOK_SECRET'; 
  const receivedSignature = req.headers['x-razorpay-signature'];

  // Debugging: Log received signature and request body
  console.log('Received webhook event:', req.body);
  console.log('Received signature:', receivedSignature);

  // Generate expected signature
  const expectedSignature = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  // Verify the signature
  if (receivedSignature !== expectedSignature) {
    console.error('Invalid signature received');
    return res.status(400).send('Invalid signature');
  }

  // Handle the webhook event
  const event = req.body.event;
  console.log('Processing event:', event);
  
  try {
    switch (event) {
      case 'payment.authorized':
        // Handle payment authorization
        console.log('Payment authorized:', req.body.payload);
        await processPaymentAuthorized(req.body.payload);
        break;

      case 'payment.failed':
        // Handle payment failure
        console.log('Payment failed:', req.body.payload);
        await processPaymentFailed(req.body.payload);
        break;

      // Add other event cases as needed
      default:
        console.log('Unhandled event:', event);
    }

    // Respond to acknowledge receipt
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Function to process payment authorization
const processPaymentAuthorized = async (payload) => {
  const { payment } = payload;
  // Logic to save or update payment details in your database
  console.log('Processing authorized payment:', payment);
  
  // Example: Save payment details
  const paymentData = {
    user: payment.user,
    order: payment.order_id,
    paymentMethod: 'razorpay',
    amount: payment.amount,
    paymentId: payment.id,
    status: 'authorized',
    paidAt: new Date(),
  };

  const newPayment = new Payment(paymentData);
  await newPayment.save();
  console.log('Payment saved successfully:', newPayment);
};

// Function to process payment failure
const processPaymentFailed = async (payload) => {
  const { payment } = payload;
  // Logic to handle payment failure (e.g., updating order status)
  console.log('Handling failed payment:', payment);
  
  // Example: Update payment details
  const paymentData = {
    paymentId: payment.id,
    status: 'failed',
    failedAt: new Date(),
  };

  // Update your database accordingly (e.g., find the payment record and update it)
  await Payment.updateOne({ paymentId: payment.id }, paymentData);
  console.log('Payment failure logged successfully:', paymentData);
};


// Get payment status by Order ID
const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ order: req.params.orderId }).populate('user', 'name email');

  if (payment) {
    res.json({
      status: payment.status,
      paidAt: payment.paidAt,
      amount: payment.amount,
    });
  } else {
    res.status(404);
    throw new Error('Payment not found');
  }
});

module.exports = {
  processRazorpay,
  getPaymentStatus,
  verify,
  handleRazorpayWebhook
};
