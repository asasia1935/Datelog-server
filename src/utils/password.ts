import bcrypt from 'bcrypt';

// bcrypt가 비밀번호 해시를 만드는 데 필요한 반복 횟수.
// 숫자가 커질수록 안전하지만 느려짐.
// MVP에서는 10 정도가 적당.
const ROUNDS = 10;

/**
 * 평문 비밀번호를 받아서 bcrypt 해시 문자열로 변환한다.
 * DB에는 절대 평문 비밀번호를 저장하지 않고,
 * 이 해시 결과만 저장한다.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

/**
 * 로그인 시 입력받은 평문 비밀번호(plain)와
 * DB에 저장된 해시 문자열(hash)을 비교한다.
 * 일치하면 true, 아니면 false를 반환한다.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}