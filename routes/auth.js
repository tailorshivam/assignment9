import express from 'express';

import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get('/register', (req, res) => {
    res.render('register', { error: null, success: null });
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.render('register', { error: 'All fields are required', success: null });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        return res.render('register', { error: 'Please enter a valid email address', success: null });
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordPattern.test(password)) {
        return res.render('register', {
            error: 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
            success: null
        });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.render('register', { error: 'Email already registered', success: null });
        }

        const user = new User({ name, email, password });
        await user.save();

        return res.render('register', { success: 'Account created successfully! You can now log in.', error: null });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.render('register', { error: 'Server error', success: null });
    }
})

router.get('/login', (req, res) => {
    res.render('login', { error: null, success: null });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.render('login', { error: 'All fields are required', success: null });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid email or password', success: null });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password', success: null });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: false });

        return res.redirect('/dashboard');
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.render('login', { error: 'Login failed', success: null });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.redirect('/auth/login');
});

export default router;