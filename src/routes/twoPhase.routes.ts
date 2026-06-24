import { Router } from 'express';
import { twoPhaseController } from '../controllers/twoPhase.controller';

const router = Router();

// 2PC Endpoints
router.post('/can-commit', (req, res) => twoPhaseController.canCommit(req, res));
router.post('/do-commit', (req, res) => twoPhaseController.doCommit(req, res));
router.post('/do-abort', (req, res) => twoPhaseController.doAbort(req, res));
router.get('/decision/:txId', (req, res) => twoPhaseController.getDecision(req, res));

export default router;
