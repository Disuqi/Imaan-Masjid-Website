// Flat config: `next lint` was removed in Next.js 16, and
// eslint-config-next@16 ships flat-config arrays and requires ESLint 9+.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
    {
        // public/ holds vendored assets (the pdf.js worker), not source.
        ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts", "tsconfig.tsbuildinfo"],
    },
    ...coreWebVitals,
    ...typescript,
];

export default config;
