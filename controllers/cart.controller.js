const asyncHandler = require('express-async-handler');
const Cart = require('../models/cart.model');
const User = require('../models/user.model');

// Get the cart for a user
const getCart = asyncHandler(async (req, res) => {
    try {
        // Log the user ID from the request
        // console.log('Fetching cart for user ID:', req.user._id);

        const cart = await Cart.findOne({ user: req.user._id })
            .populate('cartItems.product');

        // Log the fetched cart details
        // console.log('Fetched cart:', cart);

        if (cart) {
            res.json(cart);
        } else {
            console.log('No cart found for user ID:', req.user._id);
            res.status(404);
            throw new Error('Cart not found');
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add an item to the cart
const addToCart = asyncHandler(async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // console.log("user", req.user);

        // Find the cart or create a new one
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                cartItems: [],
            });
        }

        // Check if the item is already in the cart
        const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            // Item is already in the cart, update quantity
            cart.cartItems[itemIndex].quantity += quantity;
        } else {
            // Item is not in the cart, add new item
            cart.cartItems.push({ product: productId, quantity });
        }

        const updatedCart = await cart.save();

        
        res.status(201).json(updatedCart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// const addToCart = asyncHandler(async (req, res) => {
//     try {
//         const { productId, quantity } = req.body;

//         // Clerk user ID is obtained from Clerk middleware (e.g., req.auth.userId)
//         const clerkId = req.auth.userId;

//         if (!clerkId) {
//             console.log('Unauthorized: Clerk ID is missing');
//             return res.status(401).json({ message: 'Unauthorized: Clerk ID is missing' });
//         }

//         // Find the user in MongoDB based on clerkId
//         const user = await User.findOne({ clerkId });

//         if (!user) {
//             console.log('User not found');
//             return res.status(404).json({ message: 'User not found' });
//         }

//         console.log(`Adding ${quantity} ${productId} to cart for user ${user._id}`);

//         // Find the cart for the user or create a new one
//         let cart = await Cart.findOne({ user: user._id });
        
//         if (!cart) {
//             console.log('Creating new cart for user');
//             cart = new Cart({
//                 user: user._id,
//                 cartItems: [],
//             });
//         }

//         // Check if the item is already in the cart
//         const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

//         if (itemIndex > -1) {
//             // Item is already in the cart, update quantity
//             console.log(`Updating quantity of ${productId} in cart to ${cart.cartItems[itemIndex].quantity + quantity}`);
//             cart.cartItems[itemIndex].quantity += quantity;
//         } else {
//             // Item is not in the cart, add new item
//             console.log(`Adding ${productId} to cart with quantity ${quantity}`);
//             cart.cartItems.push({ product: productId, quantity });
//         }

//         // Save the updated cart
//         const updatedCart = await cart.save();

//         console.log('Updated cart:', updatedCart);

//         res.status(201).json(updatedCart);
//     } catch (error) {
//         console.error('Error adding to cart:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });


const removeCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== itemId);

        const updatedCart = await cart.save();
        res.json(updatedCart);
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === itemId);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                // If quantity is zero or less, remove the item
                cart.cartItems.splice(itemIndex, 1);
            } else {
                // Update quantity
                cart.cartItems[itemIndex].quantity = quantity;
            }

            const updatedCart = await cart.save();
            res.json(updatedCart);
        } else {
            res.status(404);
            throw new Error('Item not found in cart');
        }
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

// Clear the entire cart
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.cartItems = [];

        const updatedCart = await cart.save();
        res.json(updatedCart);
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

module.exports = {
    getCart,
    addToCart,
    removeCartItem,
    updateCartItem,
    clearCart,
};
