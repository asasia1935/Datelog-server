import mongoose from 'mongoose';
import { ENV } from './env.js';

// DB와 연결하는 함수
export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(ENV.MONGO_URL);
  console.log('O : MongoDB 연결 성공!');
}