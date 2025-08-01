import express from 'express';
import User from './models/User.js';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import protect from './middleware/authMiddleware.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', 'views'); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/auth', authRoutes);

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
connectDB();

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.get('/dashboard', protect, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.render('dashboard', { user });
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));