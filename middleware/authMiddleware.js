import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function protect(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        console.log('No token provided');
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
}

export default protect;