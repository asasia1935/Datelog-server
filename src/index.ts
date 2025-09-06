// 요청, 응답, 다음 미들웨어 타입 import
import express, { Request, Response, NextFunction  } from "express";
// CORS 허용을 위한 미들웨어 (프론트엔드 도메인에서 호출 허용)
import cors from "cors";
// 몽고 디비 연결용
import mongoose from 'mongoose';

const app = express();

// 몽고 디비 URI 설정
const MONGODB_URI = 'mongodb+srv://sungmin1935_db_user:hOvQMfQ8c6WaIItO@cluster0.vkr4guk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

/* ----------------------- 공통 미들웨어 설정 ----------------------- */
// CORS 허용(기본: 모든 오리진 허용; 나중에 origin 화이트리스트로 좁혀도 됨)
app.use(cors());
// JSON 바디를 자동으로 파싱해서 req.body에 넣어줌
app.use(express.json());

// 환경변수 PORT가 있으면 그걸 쓰고, 없으면 3000번 사용
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;


/* ----------------------- 라우트(엔드포인트) ----------------------- */
// 루트: 브라우저에서 바로 확인 가능한 헬로월드
app.get("/", (req: Request, res: Response) => {
  res.send("Hello DateLog!");
});

// 몽고 디비 연결용
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('O : MongoDB 연결 성공!');
  // 서버 실행 (테스트)
  app.listen(3000, () => {
    console.log('서버 실행중: http://localhost:3000');
  });
})
.catch((err) => {
  console.error('X : MongoDB 연결 실패:', err);
});

// 헬스 체크: 서버 상태 확인용(모니터링/로드밸런서에서 자주 씀)
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// 핑/퐁: 간단한 API 통신 확인용
app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "pong" });
});

/* ----------------------- 404 핸들러 ----------------------- */
// 위 라우트에 해당되지 않는 모든 요청은 404 처리
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

/* ----------------------- 전역 에러 핸들러 ----------------------- */
// 라우트/미들웨어에서 던진 에러를 한 곳에서 처리
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // 에러 메시지 추출
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error(err); // 서버 콘솔에 에러 로그 출력
  res.status(500).json({ error: "Internal Server Error", message });
});

/* ----------------------- 서버 시작 ----------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});