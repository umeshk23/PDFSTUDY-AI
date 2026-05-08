import dotenv from "dotenv"
dotenv.config()

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import errorHandler from  './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const app = express();

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

const buildAllowedOrigins = () => {
    const configuredOrigins = [
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
        process.env.APP_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null,
        process.env.NODE_ENV === 'production' ? 'https://pdfstudy-ai.vercel.app' : 'http://localhost:5173',
    ];

    return [...new Set(
        configuredOrigins
            .filter(Boolean)
            .flatMap((value) => value.split(','))
            .map((origin) => normalizeOrigin(origin))
            .filter(Boolean)
    )];
};

const normalizeEnv = () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d';
    process.env.PORT = process.env.PORT || '8000';
};

const validateEnv = () => {
    const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'GEMINI_API_KEY'];
    if (process.env.NODE_ENV === 'production') {
        required.push('CLIENT_URL');
    }

    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    if (process.env.MONGO_URI && !/^mongodb(?:\+srv)?:\/\//.test(process.env.MONGO_URI)) {
        console.error('Invalid MONGO_URI format: expected mongodb:// or mongodb+srv://');
        process.exit(1);
    }
};

normalizeEnv();
validateEnv();

connectDB();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    xFrameOptions: false,
}));

const allowedOrigins = buildAllowedOrigins();

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        const normalizedRequestOrigin = normalizeOrigin(origin);
        if (allowedOrigins.includes(normalizedRequestOrigin)) {
            return callback(null, true);
        }

        return callback(new Error(`Not allowed by CORS: ${normalizedRequestOrigin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const baseLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
        statusCode: 429,
    },
});
const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
        statusCode: 429,
    },
});
const aiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many AI requests, please slow down and try again later.',
        statusCode: 429,
    },
});

app.use(baseLimiter);

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

//Routes
app.use('/api/auth',authLimiter,authRoutes)
app.use('/api/documents',documentRoutes)
app.use('/api/flashcards',flashcardRoutes)
app.use('/api/ai',aiLimiter,aiRoutes)
app.use('/api/quizzes',quizRoutes)
app.use('/api/progress',progressRoutes)

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        statusCode: 404,
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
