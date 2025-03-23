import express from 'express';
import { createAlert, getUserAlerts, deleteAlert } from '../controllers/alertController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new price alert
router.post('/', createAlert);

// Get all alerts for the authenticated user
router.get('/', getUserAlerts);

// Delete an alert
router.delete('/:id', deleteAlert);

export default router;
