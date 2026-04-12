import express from 'express';
import {
  inviteTeamMember,
  getInvitations,
  acceptInvitation,
  cancelInvitation,
  resendInvitation,
} from '../controllers/teamController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/accept-invitation/:token', acceptInvitation);

router.use(protect);

router.post('/invite', inviteTeamMember);
router.get('/invitations', getInvitations);
router.delete('/invitations/:id', cancelInvitation);
router.post('/invitations/:id/resend', resendInvitation);

export default router;

