import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
// 이 순간 Node.js/ts-node가 app.ts 파일을 읽고 실행
import app from './app.js';

async function main() {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${ENV.PORT}`);
    });
  } catch (err) {
    console.error('X : 서버 시작 실패:', err);
    process.exit(1);
  }
}

main();