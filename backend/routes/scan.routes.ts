import { Router } from 'express';
import { scanController } from '../controllers/scan.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';
import { ScanType } from '../models/scan.model';

const router = Router();

// Validation rules
const createScanValidation = [
  body('name').notEmpty().withMessage('Scan name is required'),
  body('type')
    .isIn(Object.values(ScanType))
    .withMessage('Valid scan type is required'),
  body('target').notEmpty().withMessage('Scan target is required'),
];

const scanIdValidation = [
  param('scanId').isMongoId().withMessage('Valid scan ID is required'),
];

// Protect all routes
router.use(authMiddleware.authenticate);

// Routes
router.post('/', validate(createScanValidation), scanController.createScan);
router.get('/', scanController.getScans);
router.get('/:scanId', validate(scanIdValidation), scanController.getScanById);
router.post('/:scanId/start', validate(scanIdValidation), scanController.startScan);

export default router;