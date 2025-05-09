import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/database/db";
import * as schema from "@/database/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes for development
    },
  },
  emailAndPassword: {
    enabled: true,
  },

  baseURL: process.env.AUTH_BASE_URL || "http://localhost:3000",

  // ✅ And this:
  trustedOrigins: [
    "http://localhost:3000", // dev
    "https://ss-hw6-lyydiakims-projects.vercel.app", // production
  ],

  plugins: [
    nextCookies(), // keep this last
  ],
});
