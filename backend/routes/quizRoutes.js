import express from 'express';
import { body, param } from 'express-validator';
import{
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
}from '../controllers/quizController.js';
import protect from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';

const router=express.Router();
router.use(protect);

router.get('/:documentId',[param('documentId').isMongoId().withMessage('Invalid document id'), validateRequest],getQuizzes);
router.get('/quiz/:id',[param('id').isMongoId().withMessage('Invalid quiz id'), validateRequest],getQuizById);
router.post(
    '/:id/submit',
    [
        param('id').isMongoId().withMessage('Invalid quiz id'),
        body('answers').isArray().withMessage('Answers must be an array'),
        validateRequest,
    ],
    submitQuiz
);
router.get('/:id/results',[param('id').isMongoId().withMessage('Invalid quiz id'), validateRequest],getQuizResults);
router.delete('/:id',[param('id').isMongoId().withMessage('Invalid quiz id'), validateRequest],deleteQuiz);

export default router;
