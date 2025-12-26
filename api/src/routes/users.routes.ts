import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateTenant } from '../middleware/tenant.js';
import { getProfile, updateProfile } from '../controllers/users.controller.js';

const router = Router();

// All user routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
