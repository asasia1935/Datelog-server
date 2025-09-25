import jwt from 'jsonwebtoken';

// 환경변수에서 JWT 시크릿 키 가져오기
// .env 파일이나 Render 환경변수에 설정해야 함
const { JWT_SECRET = 'dev-secret-change-me' } = process.env;

// 토큰에 담길 정보 타입 정의
export interface JwtPayload {
  userId: string;           // 사용자 ID (필수)
  coupleId?: string | null; // 커플 ID (없을 수도 있음)
}

/**
 * 토큰 발급
 * @param payload userId, coupleId
 * @returns JWT 문자열
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); 
  // expiresIn: 7일짜리 토큰
}

/**
 * 토큰 검증
 * @param token Authorization 헤더로 받은 JWT 문자열
 * @returns JwtPayload (userId, coupleId)
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}