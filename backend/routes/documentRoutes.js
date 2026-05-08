import express from 'express';
import { param, body } from 'express-validator';

import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    getDocumentFile,

} from '../controllers/documentController.js';

import protect from '../middleware/auth.js';
import upload from '../config/multer.js';
import validateRequest from '../middleware/validateRequest.js';


const router = express.Router();
const objectIdValidation = [
    param('id').isMongoId().withMessage('Invalid document id'),
    validateRequest,
];

// all routes are protected
router.use(protect);


router.post(
    '/upload',
    upload.single('file'),
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
    validateRequest,
    uploadDocument
);
router.get('/', getDocuments);
router.get('/:id/file', objectIdValidation, getDocumentFile);
router.get('/:id', objectIdValidation, getDocument);
router.delete('/:id', objectIdValidation, deleteDocument);

export default router;
