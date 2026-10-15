import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next dev가 AGENTS.md·CLAUDE.md를 만들지 않게
  agentRules: false,
};

export default nextConfig;
