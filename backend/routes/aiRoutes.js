import express from 'express';
import { body, param } from 'express-validator';

import{
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory,
}from '../controllers/aiController.js';
import protect from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';


const router=express.Router();
const documentIdValidation = body('documentId').isMongoId().withMessage('A valid document id is required');

router.use(protect);

router.post(
    '/generate-flashcards',
    [
        documentIdValidation,
        body('count').optional().isInt({ min: 1, max: 25 }).withMessage('Count must be between 1 and 25'),
        validateRequest,
    ],
    generateFlashcards
);
router.post(
    '/generate-quiz',
    [
        documentIdValidation,
        body('numQuestions').optional().isInt({ min: 1, max: 20 }).withMessage('Number of questions must be between 1 and 20'),
        body('title').optional().trim().isLength({ max: 150 }).withMessage('Quiz title must be less than 150 characters'),
        validateRequest,
    ],
    generateQuiz
);
router.post('/generate-summary',[documentIdValidation, validateRequest],generateSummary);
router.post(
    '/chat',
    [
        documentIdValidation,
        body('question').trim().isLength({ min: 1, max: 2000 }).withMessage('Question is required and must be less than 2000 characters'),
        validateRequest,
    ],
    chat
);
router.post(
    '/explain-concept',
    [
        documentIdValidation,
        body('concept').trim().isLength({ min: 1, max: 300 }).withMessage('Concept is required and must be less than 300 characters'),
        validateRequest,
    ],
    explainConcept
);
router.get('/chat-history/:documentId',[param('documentId').isMongoId().withMessage('Invalid document id'), validateRequest],getChatHistory);

export default router;
