import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import {
  getDashboardStats, adminListUsers, adminUpdateUserStatus,
  adminListOwners, adminGetOwner,
  adminListProperties, adminGetProperty, adminApproveProperty, adminRejectProperty, adminUpdatePropertyStatus,
  adminListPayments, adminListEnquiries, adminListPlans,
} from '../controllers/admin.controller';
import { createPlan, updatePlan, deletePlan } from '../controllers/plan.controller';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users
router.get('/users', adminListUsers);
router.put('/users/:id/status', adminUpdateUserStatus);

// Owners
router.get('/owners', adminListOwners);
router.get('/owners/:id', adminGetOwner);

// Properties
router.get('/properties', adminListProperties);
router.get('/properties/:id', adminGetProperty);
router.put('/properties/:id/approve', adminApproveProperty);
router.put('/properties/:id/reject', adminRejectProperty);
router.put('/properties/:id/status', adminUpdatePropertyStatus);

// Payments
router.get('/payments', adminListPayments);

// Plans (admin CRUD)
router.get('/plans', adminListPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// Enquiries
router.get('/enquiries', adminListEnquiries);

export default router;
