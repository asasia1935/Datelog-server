// -----------------------------------------------------------------------------
// [무엇]
//   - 모든 “보호된(로그인 필요)” API 앞단에서 실행되는 인증 미들웨어.
//   - 요청 헤더의 "Authorization: Bearer <JWT>" 를 검증하고,
//     성공 시 req.user 에 인증 컨텍스트({_id, coupleId})를 주입한다.
//
// [왜]
//   - 컨트롤러/서비스는 "누가 요청했는지" 알 필요가 있다(권한/소유권 체크).
//   - 매 요청마다 DB를 다시 긁지 않고, 토큰에 실린 최소 식별자만 사용해 빠르게 판별.
//   - 토큰 불량/만료/부재 등은 즉시 401로 끊어 API 내부 로직이 불필요하게 실행되는 걸 방지.
//
// [어떻게]
//   1) Authorization 헤더 존재 & 형식 검사: "Bearer <token>" 만 허용(대소문자 무관).
//   2) verifyToken(token) 으로 서명/만료/형식 검증 → payload 추출.
//   3) payload.userId 를 req.user._id 로, payload.coupleId 를 null 정규화 후 req.user.coupleId 로.
//   4) 실패 케이스는 401(UNAUTHORIZED / TOKEN_EXPIRED)로 통일된 JSON 에러 응답.
//
// [전제]
//   - 3)에서 타입 보강을 완료했음: src/types/express.d.ts
//       declare module 'express-serve-static-core' {
//         interface Request { user?: { _id: string; coupleId?: string | null } }
//       }
//   - JWT 유틸: verifyToken(token) → { userId: string; coupleId: string | null } 반환.
//   - 응답 에러 포맷은 프로젝트 공통 규약을 따름:
//       { "error": { "code": string, "message": string } }
//
// [사용 예]
//   import { authRequired } from '../middlewares/authRequired.js';
//   router.get('/me', authRequired, (req, res) => res.json({ me: req.user }));
//
// [보안 주의]
//   - 절대 req.body.userId 같은 클라이언트 입력을 신뢰하지 말 것.
//   - "인증된 사용자 ID"는 오직 이 미들웨어가 세팅한 req.user._id 만 사용.
// -----------------------------------------------------------------------------

import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

// (선택) 런타임 가독성을 위한 지역 타입(실제 utils/jwt.ts에 동일 타입이 있다면 import 해서 써도 됨)
type JwtPayload = { userId: string; coupleId: string | null };

/**
 * 인증 필수 미들웨어
 * - 성공: req.user 설정 후 next()
 * - 실패: 401 JSON 에러 즉시 반환
 */
export function authRequired(req: Request, res: Response, next: NextFunction) {
  // 1) Authorization 헤더를 안전하게 꺼낸다(없을 수 있으니 null 병합)
  const raw = req.header('Authorization') ?? '';
  
  // 2) "Bearer <token>" 패턴만 허용(여러 공백/대소문자 허용)
  const header = req.header('Authorization');
  if (typeof header !== 'string') {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header' },
    });
  }

  const [scheme, token] = header.trim().split(/\s+/); // 여러 공백 허용
  if (!token || !scheme || scheme.toLowerCase() !== 'bearer') {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header (expected: Bearer <token>)' },
    });
  }
  
  try {
    // 3) 토큰 유효성 검증(서명/만료/형식) 및 payload 획득
    const payload = verifyToken(token) as JwtPayload;

    // 4) payload 최소 필드 방어적 점검(유틸이 타입 보장하더라도 런타임은 항상 의심)
    if (!payload || typeof payload.userId !== 'string') {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid token payload' },
      });
    }

    // 5) 컨트롤러/서비스가 사용할 인증 컨텍스트 주입
    //    - express.d.ts 타입 보강 덕분에 TS가 req.user를 인식한다.
    //    - coupleId가 없으면 null로 정규화해 후속 로직 분기 단순화.
    req.user = {
      _id: payload.userId,
      coupleId: payload.coupleId ?? null,
    };

    // 6) 통과
    return next();
  } catch (err: any) {
    // jsonwebtoken 계열 에러명을 활용해 만료 vs 기타 구분(디버깅 편의)
    if (err?.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { code: 'TOKEN_EXPIRED', message: 'Token expired' },
      });
    }
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
    });
  }
}