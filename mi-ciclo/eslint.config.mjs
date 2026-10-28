import cwv from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";

const config = [
  ...cwv,
  ...ts,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "out/**"] },
];

export default config;
