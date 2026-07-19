import { createServerFn } from "@tanstack/react-start";
import { maskEmail } from "@/lib/store-auth";

export const loginStoreUser = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const allowedEmail = process.env.STORE_LOGIN_EMAIL;
    const allowedPassword = process.env.STORE_LOGIN_PASSWORD;

    if (!allowedEmail || !allowedPassword) {
      throw new Error("Sign in is not configured. Contact the store administrator.");
    }

    const email = data.email.trim().toLowerCase();
    const password = data.password;

    if (email !== allowedEmail.toLowerCase() || password !== allowedPassword) {
      throw new Error("Invalid email or password.");
    }

    return {
      ok: true as const,
      maskedEmail: maskEmail(allowedEmail),
    };
  });
