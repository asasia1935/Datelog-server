// 데이트로그의 사용자 모델(Mongoose).
// - 이메일 로그인 기반
// - 비밀번호는 평문 저장 금지 → 반드시 bcrypt 해시(서비스 레이어에서 처리)
// - 커플 기능: 두 사용자가 같은 coupleId(ObjectId)를 공유
//
// 주의:
// 1) unique: true는 "유효성 검사"가 아니라 "인덱스" 생성임.
//    실제 중복 체크는 서비스 레이어에서 findOne으로 별도 확인 권장.
// 2) ESM+NodeNext 환경에서 핫리로드 시 모델 중복 선언 방지 위해
//    `models.User || model('User', ...)` 패턴 사용.

import { Schema, model, models, type Model } from 'mongoose';

// 1) 런타임/컴파일 타임에서 사용할 타입 정의
export interface IUser {
  email: string; // 로그인 ID. DB에선 소문자/trim 처리함
  passwordHash: string; // bcrypt로 해시된 문자열만 저장 (평문 금지)
  displayName: string; // 앱에 보여줄 닉네임/표시 이름
  coupleId?: Schema.Types.ObjectId | null; // 커플 연결 ID (없을 수 있으므로 null 허용)
  // ref: 'Couple' 은 나중에 Couple 컬렉션을 도입해도 호환됨

  // timestamps 옵션으로 자동 추가됨
  createdAt?: Date;
  updatedAt?: Date;
}

// 2) 스키마 정의
const userSchema = new Schema<IUser>(
  {
    email: {
        type: String,
        required: true,
        unique: true,       // 고유 인덱스 생성 → 중복 방지(DB 레벨)
        index: true,        // 조회 최적화
        trim: true,         // 앞뒤 공백 제거
        lowercase: true,  // 항상 소문자로 저장 (이메일 비교 일관성)
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'], // 기본적인 이메일 형태 검증
    },
    passwordHash: {
      type: String,
      required: true,
      // 보안을 위해 선택적으로 아래 옵션을 쓸 수도 있음:
      // select: false,
      // 이렇게 하면 기본 find() 시 passwordHash가 빠짐.
      // 다만 로그인 검증에서 .select('+passwordHash')를 써야 하므로
      // MVP 단계에선 일단 기본 선택으로 두고 서비스에서 안전 반환 처리 권장.
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 40, // UI 정책에 맞춰 적당히 제한
    },
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: 'Couple',  // 아직 모델이 없어도 참조 이름만 지정 가능
      default: null,
    },
  },
  { // createdAt, updatedAt 자동 관리
    timestamps: true,

    // JSON 직렬화 시 보안/표현을 다듬기 위한 옵션은 아래 transform에서 처리
    toJSON: { virtuals: true, versionKey: false, transform: safeTransform },
    toObject: { virtuals: true, versionKey: false, transform: safeTransform },
  }
);

// 3) toJSON/toObject 변환 시 민감정보 숨기고, _id → id로 매핑
function safeTransform(_doc: any, ret: any) {
  // Mongo 내부 키 숨김
  ret.id = ret._id?.toString();
  delete ret._id;
  delete ret.__v;

  // 비밀번호 해시 노출 방지 (실수로 컨트롤러에서 통째로 반환해도 안전)
  if ('passwordHash' in ret) delete ret.passwordHash;

  return ret;
}

// 4) 사전 훅: 이메일을 항상 소문자/trim으로 유지 (이중 안전망)
//    (위 필드 옵션으로도 처리되지만, 서비스에서 set() 등으로 우회될 수도 있어 한번 더 보강)
userSchema.pre('save', function (next) {
  if (this.isModified('email') && typeof this.email === 'string') {
    this.email = this.email.trim().toLowerCase();
  }
  next();
});

export const User: Model<IUser> = models.User || model<IUser>('User', userSchema);