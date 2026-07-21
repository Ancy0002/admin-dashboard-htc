import { createServerFn } from "@tanstack/react-start";
import { secureEqual } from "@/lib/secure-compare";
import { maskEmail } from "@/lib/store-auth";
import {
  getAdminSessionManager,
  requireAdminSessionData,
} from "@/lib/admin-session";

function readEnv(name: string) {
  // Dynamic key access avoids Vite inlining undefined at build time on Vercel.
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export const loginStoreUser = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => {
    if (!data.email?.trim() || !data.password) {
      throw new Error("Email and password are required.");
    }
    return { email: data.email.trim(), password: data.password };
  })
  .handler(async ({ data }) => {
    const allowedEmail = readEnv("STORE_LOGIN_EMAIL").toLowerCase();
    const allowedPassword = readEnv("STORE_LOGIN_PASSWORD");

    if (!allowedEmail || !allowedPassword) {
      throw new Error(
        "Sign in is not configured on the server. Add STORE_LOGIN_EMAIL and STORE_LOGIN_PASSWORD in Vercel Environment Variables, then redeploy.",
      );
    }

    const email = data.email.trim().toLowerCase();
    const password = data.password;
    const validEmail = secureEqual(email, allowedEmail);
    const validPassword = secureEqual(password, allowedPassword);

    if (!validEmail || !validPassword) {
      throw new Error("Invalid email or password.");
    }

    const session = await getAdminSessionManager();
    await session.update({
      role: "admin",
      email: allowedEmail,
    });

    return {
      ok: true as const,
      maskedEmail: maskEmail(allowedEmail),
    };
  });

export const getAdminAuth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { email } = await requireAdminSessionData();
    return {
      authenticated: true as const,
      email,
      maskedEmail: maskEmail(email),
    };
  } catch {
    return { authenticated: false as const };
  }
});

export const requireAdminAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { email } = await requireAdminSessionData();
  return {
    email,
    maskedEmail: maskEmail(email),
  };
});

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSessionManager();
  await session.clear();
  return { ok: true as const };
});
