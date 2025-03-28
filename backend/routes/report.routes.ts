import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();

// Validation rules
const generateReportValidation = [
  body('scanId').isMongoId().withMessage('Valid scan ID is required'),
  body('title').notEmpty().withMessage('Report title is required'),
];

const reportIdValidation = [
  param('reportId').isMongoId().withMessage('Valid report ID is required'),
];

// Protect all routes
router.use(authMiddleware.authenticate);

// Routes
router.post('/', validate(generateReportValidation), reportController.generateReport);
router.get('/', reportController.getReports);
router.get('/:reportId', validate(reportIdValidation), reportController.getReportById);

export default router;