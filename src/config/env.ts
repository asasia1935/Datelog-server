// 해당 파일이 불리는 순간 .env가 메모리에 적재
import 'dotenv/config';

// 부트 시점에 env에 빠진 값이 있는지 검증 -> 런타임이 아닌 시작 즉시 알 수 있음
const required = (key: string, fallback?: string) => {
  const v = process.env[key] ?? fallback;
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
};

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 3000),
  MONGO_URL: required('MONGO_URL'),
  JWT_SECRET: required('JWT_SECRET'),
};