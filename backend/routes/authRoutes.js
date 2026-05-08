import express from 'express';
import {body} from 'express-validator';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';


const router=express.Router();


const registerValidation=[
    body('username').trim().isLength({min:3, max:40}).withMessage('Username must be between 3 and 40 characters long'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({min:8, max:128}).withMessage('Password must be between 8 and 128 characters long')
];


const loginValidation=[
    body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
];

const profileValidation = [
    body('username').optional().trim().isLength({ min: 3, max: 40 }).withMessage('Username must be between 3 and 40 characters long'),
    body('email').optional().trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('profileImage').optional({ values: 'falsy' }).isURL().withMessage('Profile image must be a valid URL'),
];

const passwordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8, max: 128 }).withMessage('New password must be between 8 and 128 characters long'),
];

// public routes
router.post('/register',registerValidation,validateRequest,register);
router.post('/login',loginValidation,validateRequest,login);


// protected routers
router.get('/profile',protect,getProfile);
router.put('/profile',protect,profileValidation,validateRequest,updateProfile);
router.post('/change-password',protect,passwordValidation,validateRequest,changePassword);

export default router;
