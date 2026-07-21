import { createHash } from "node:crypto";
import { useSession, type SessionConfig } from "@tanstack/react-start/server";

type AdminSessionData = {
  role: "admin";
  email: string;
};

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

/** Sealed sessions require a long secret; derive a stable 64-char key. */
export function getAdminSessionPassword() {
  const raw =
    readEnv("ADMIN_SESSION_SECRET") ||
    readEnv("STORE_LOGIN_PASSWORD") ||
    "htc-admin-dev-session-secret";
  return createHash("sha256").update(raw).digest("hex");
}

export function getAdminSessionConfig(): SessionConfig {
  return {
    name: "htc-admin",
    password: getAdminSessionPassword(),
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getAdminSessionManager() {
  return useSession<AdminSessionData>(getAdminSessionConfig());
}

export async function requireAdminSessionData() {
  const session = await getAdminSessionManager();
  if (session.data.role !== "admin" || !session.data.email) {
    throw new Error("UNAUTHORIZED");
  }
  return {
    email: session.data.email,
  };
}
