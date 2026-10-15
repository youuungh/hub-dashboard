import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/no-unresolved": "off",
      "import/named": "off",
      // 에러 로깅(console.error/warn)은 허용 — 디버그용 console.log만 금지
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react-hooks/exhaustive-deps": "warn",
      // react-hooks v6 컴파일러 계열 룰 2종 비활성 사유:
      // set-state-in-effect — fetch-on-mount 패턴(async 함수 호출 포함)을 전면 플래그. 서버상태 라이브러리(React Query) 도입 시 재평가
      // immutability — shadcn 원본 코드(SidebarMenuSkeleton의 useMemo 내 Math.random)까지 플래그
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      // purity — shadcn 원본(SidebarMenuSkeleton의 useMemo 내 Math.random)까지 플래그
      "react-hooks/purity": "off",
      // incompatible-library — TanStack Table v8에 대한 React Compiler 진단(정보성). v9 마이그레이션 시 재평가
      "react-hooks/incompatible-library": "off",
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
