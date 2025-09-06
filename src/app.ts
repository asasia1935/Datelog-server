import express from 'express';
import cors from 'cors'; // CORS 허용을 위한 미들웨어 (프론트엔드 도메인에서 호출 허용)
import morgan from 'morgan'; // express 전용 HTTP 요청 로거 미들웨어
import healthRoutes from './routes/health.routes';
import { errorHandler } from './middlewares/errorHandler';
2
const app = express();

/* ----------------------- 공통 미들웨어 ----------------------- */
// CORS 허용(기본: 모든 오리진 허용; 나중에 origin 화이트리스트로 좁혀도 됨)
app.use(cors());
// JSON 바디를 자동으로 파싱해서 req.body에 넣어줌
app.use(express.json());
// dev에 로거
app.use(morgan('dev'));

/* ----------------------- 라우트 ----------------------- */
app.get('/', (_req, res) => {
  res.send('Hello DateLog!');
});
app.use('/health', healthRoutes);

/* ----------------------- 404 핸들러 ----------------------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

/* ----------------------- 전역 에러 핸들러 ----------------------- */
app.use(errorHandler);

export default app;