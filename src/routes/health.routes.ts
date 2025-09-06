import { Router } from 'express';

const router = Router();

// 헬스 체크
router.get('/', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), time: new Date().toISOString() });
});

// 핑/퐁
router.get('/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

export default router;