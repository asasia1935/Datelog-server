// src/types/express.d.ts
//
// 이 파일은 "타입 선언(Declaration)" 전용 파일이다.
// 즉, 런타임에는 아무 영향이 없고, 오직 TypeScript 컴파일러가 타입을 이해할 때만 쓰인다.
// 여기서 하는 일은 "Express Request 타입에 user 속성을 추가"하는 것.
//
// 왜 필요한가?
// - 우리 미들웨어(authRequired)에서 req.user를 주입하고 쓰고 있음.
// - 그런데 기본 Express 타입 정의(@types/express)에는 user 속성이 없다.
// - 따라서 TS는 "Property 'user' does not exist on type 'Request'" 에러를 낸다.
// → 이 문제를 해결하기 위해 Request 타입을 확장(augment)하는 것이다.

import 'express'; 
// 위 코드는 express 모듈의 타입 정의를 불러온다.
// 실제 값은 가져오지 않고, 타입 시스템에만 영향을 준다.
// 이 파일을 "모듈 컨텍스트"로 만들어주기 위한 용도라고 생각해도 된다.

declare module 'express-serve-static-core' {
  // 이 모듈은 사실상 Express의 핵심 타입들이 정의된 곳이다.
  // Request, Response 같은 타입들이 여기 들어있다.
  // @types/express가 내부적으로 이 모듈을 가져다가 사용한다.

  interface Request {
    // 이제 Request 타입에 user 속성을 추가한다.
    // "?" 는 옵셔널(optional) → 즉, 있을 수도 없을 수도 있다.
    // (보호 라우트에서는 authRequired가 넣어주지만,
    //  공개 라우트에서는 req.user가 없을 수 있으니까)

    user?: {
      _id: string;                 // MongoDB User 문서의 ID (문자열)
      coupleId?: string | null;    // 커플 ID (없으면 null)
    };
  }
}

// 요약:
// - 이 파일 덕분에 TS는 req.user를 타입 오류 없이 인식한다.
// - 실제 런타임 동작은 authRequired 미들웨어가 담당한다.
// - 즉, 이 파일은 "개발 편의 + 타입 안전"을 위한 선언일 뿐이다.