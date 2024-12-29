const asyncHandler = require('express-async-handler');
const { oauth2client } = require('../config/googleConfig');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');
const axios = require('axios');
const emailSender = require('../utils/emailSender');
const {sendOTP, generateOTP} = require('../services/otpService.js');
const generateToken = require('../utils/generateToken.js')
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_TIMEOUT = process.env.JWT_TIMEOUT;

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    console.log('Received registration request:', { name, email });

    try {
        console.log('Checking for existing user in the database...');
        const existingUser = await User.findOne({ email });
        console.log('Existing user check result:', existingUser ? 'User found' : 'No user found');

        if (existingUser) {
            console.warn('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        console.log('Generating OTP...');
        const otp = generateOTP();
        console.log('Generated OTP:', otp);

        // Send OTP to user's email
        console.log('Sending OTP to email:', email);
        try {
            await sendOTP(email, otp);
            console.log('OTP sent successfully.');
        } catch (err) {
            console.error('Error sending OTP to email:', err);
            return res.status(500).json({ message: 'Error sending OTP to email' });
        }

        // Create a temporary user with OTP
        console.log('Creating new user with temporary OTP...');
        const user = new User({
            name,
            email,
            password,  // Save hashed password (bcrypt, etc.)
            otp,       // Store OTP
            otpExpires: Date.now() + 15 * 60 * 1000, // OTP expires in 15 minutes
        });

        try {
            const savedUser = await user.save();
            console.log('User temporarily created:', savedUser);
        } catch (error) {
            console.error('Error saving temporary user:', error);
            return res.status(500).json({ message: 'Error saving temporary user', error });
        }

        // Respond with OTP sent status
        res.status(200).json({
            message: 'OTP sent to email. Please verify to complete the registration.',
            email,
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
};


const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    console.log('Received OTP verification request:', { email, otp });

    try {
        console.log('Fetching user from the database...');
        const user = await User.findOne({ email });

        if (!user) {
            console.warn('User not found:', email);
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if OTP is correct and not expired
        console.log('Verifying OTP...');
        if (user.otp !== otp) {
            console.warn('Invalid OTP entered:', otp);
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (Date.now() > user.otpExpires) {
            console.warn('OTP has expired for user:', email);
            return res.status(400).json({ message: 'OTP has expired' });
        }

        console.log('OTP is valid, finalizing registration for user:', email);

        // OTP is correct, now finalize the user registration
        user.otp = null; // Clear OTP after verification
        user.otpExpires = null; // Remove OTP expiry
        user.isVerified = true; // Set user as verified (optional)

        try {
            await user.save();
            console.log('User successfully verified and saved:', user);
        } catch (error) {
            console.error('Error saving user after OTP verification:', error);
            return res.status(500).json({ message: 'Error saving user after OTP verification', error });
        }

        // Generate token (JWT or other)
        console.log('Generating JWT token for user...');
        const token = generateToken(user._id);
        console.log('Generated JWT token:', token);

        // Set token as a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true for production with HTTPS
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiry (1 month)
        });

        res.status(200).json({
            message: 'OTP verified successfully, registration completed.',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};


// const registerUser = async (req, res) => {
//     const { name, email, password } = req.body;
//     console.log('Received registration request:', { name, email });

//     try {
//         const existingUser = await User.findOne({ email });
//         console.log('Checking for existing user:', existingUser);

//         if (existingUser) {
//             console.warn('User already exists:', email);
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // console.log('Raw password before hashing:', password);
//         // const hashedPassword = await bcrypt.hash(password, 10);
//         // console.log('Hashed password after hashing:', hashedPassword);

//         const user = await User.create({ name, email, password: password });
//         console.log('New user created:', user);

//         // Generate token
//         const token = generateToken(user._id);
//         console.log('Token generated for user:', user._id, "is", token);

//         // Set cookie
//         res.cookie('token', token, {
//             httpOnly: true,
//             secure: false, // Set to true in production
//             sameSite: 'lax',
//             maxAge: 30 * 24 * 60 * 60 * 1000,
//         });

//         res.status(201).json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//         });
//     } catch (error) {
//         console.error('Error registering user:', error);
//         res.status(500).json({ message: 'Error registering user', error });
//     }
// };



// Login user & get token
const authUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Received login request:', { email });

    try {
        // Find user by email
        const user = await User.findOne({ email });
        console.log('User found:', user ? { id: user._id, email: user.email } : 'No user found');

        if (user) {
            // Log the stored hashed password for comparison
            console.log('Stored password (hashed):', user.password); 

            const isMatch = await bcrypt.compare(password.trim(), user.password);
            console.log('Password comparison result:', isMatch);
            console.log('Password input:', password); // Log the password input

            if (isMatch) {
                const token = generateToken(user._id);
                console.log('Token generated for user:', user._id);

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false, // Set to true in production
                    sameSite: 'lax',
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                });

                console.log('Cookie set successfully');
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                });
            } else {
                console.warn('Invalid password attempt for user:', email);
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } else {
            console.warn('No user found with email:', email);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};

const authAdmin = async (req, res, next) => {
    const { email, password } = req.body;
    console.log('Received admin login request:', { email });

    try {
        // Find user by email
        const user = await User.findOne({ email });
        console.log('User found:', user ? { id: user._id, email: user.email } : 'No user found');

        if (user) {
            // Log the stored hashed password for comparison
            console.log('Stored password (hashed):', user.password);

            const isMatch = await bcrypt.compare(password.trim(), user.password);
            console.log('Password comparison result:', isMatch);
            console.log('Password input:', password); // Log the password input

            if (isMatch) {
                // Check if the user is an admin
                if (user.isAdmin) {
                    const token = generateToken(user._id);
                    console.log('Admin token generated for user:', user._id);

                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: false, // Set to true in production
                        sameSite: 'lax',
                        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    });

                    console.log('Admin cookie set successfully');
                    res.json({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        isAdmin: user.isAdmin,
                    });
                } else {
                    console.warn('User is not an admin:', email);
                    res.status(401).json({ message: 'Not authorized as an admin' });
                }
            } else {
                console.warn('Invalid password attempt for user:', email);
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } else {
            console.warn('No user found with email:', email);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Error logging in admin', error });
    }
};




const googleLogin = asyncHandler(async (req, res) => {
    try {
        const { code } = req.query;
        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens);

        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        )

        console.log(userRes.data);

        const { email, name, picture } = userRes.data;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name: name,
                email: email,
                pfp: picture
            })
        }

        const { _id } = user;
        // const token = generateToken(_id); 
        const token = jwt.sign({ _id, email }, JWT_SECRET,
            {
                expiresIn: JWT_TIMEOUT
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: 'lax', // Can also use 'Lax' depending on your needs
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return res.status(200).json({
            message: 'Success',
            token,
            user
        })

    } catch (err) {
        console.error('Error during Google login:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to authenticate with Google',
            error: err.message,
        });
    }
});

const adminGoogleLogin = asyncHandler(async (req, res) => {
    try {
        const { code } = req.query;
        console.log('Received Google auth code:', code);  // Debugging: log the auth code

        // Get the tokens from Google OAuth response
        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens);
        console.log('Google OAuth tokens retrieved:', googleRes.tokens);  // Debugging: log the tokens

        // Get user info from Google
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );

        console.log('Google user info retrieved:', userRes.data);  // Debugging: log the user info from Google

        const { email, name, picture } = userRes.data;

        // Find the user in the database by email
        let user = await User.findOne({ email });
        console.log('Found user by email:', user ? { id: user._id, email: user.email } : 'No user found');  // Debugging: log the user search result
        
        if (!user) {
            // If user doesn't exist, create a new one (optional, based on your use case)
            console.log('Creating new user:', email);
            user = await User.create({
                name: name,
                email: email,
                pfp: picture,
                isAdmin: false,  // Ensure new users are not admins by default
            });
            console.log('New user created:', { id: user._id, email: user.email });
        }

        // Check if the user is an admin
        if (!user.isAdmin) {
            console.warn('User is not an admin:', email);  // Debugging: log if user is not an admin
            return res.status(401).json({
                success: false,
                message: 'Not authorized as an admin',
            });
        }

        const { _id } = user;

        // Generate a JWT token for the admin user
        const token = jwt.sign({ _id, email }, JWT_SECRET, {
            expiresIn: JWT_TIMEOUT,
        });

        console.log('JWT token generated for admin user:', token);  // Debugging: log the generated token

        // Set the JWT token in a secure cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,  // Set to true in production with HTTPS
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        console.log('JWT token set in cookie');  // Debugging: log cookie setup

        // Respond with success
        return res.status(200).json({
            message: 'Admin Google login successful',
            token,
            user,
        });

    } catch (err) {
        // Log the error and return a failure response
        console.error('Error during admin Google login:', err);  // Debugging: log the full error
        return res.status(500).json({
            success: false,
            message: 'Failed to authenticate with Google',
            error: err.message,
        });
    }
});


module.exports = {
    registerUser,
    authUser,
    authAdmin,
    googleLogin,
    adminGoogleLogin,
    sendOTP,
    verifyOTP,
};