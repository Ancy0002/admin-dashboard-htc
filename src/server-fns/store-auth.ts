import { createServerFn } from "@tanstack/react-start";
import { secureEqual } from "@/lib/secure-compare";
import { maskEmail } from "@/lib/store-auth";

export const loginStoreUser = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => {
    if (!data.email?.trim() || !data.password) {
      throw new Error("Email and password are required.");
    }
    return { email: data.email.trim(), password: data.password };
  })
  .handler(async ({ data }) => {
    const allowedEmail = process.env.STORE_LOGIN_EMAIL;
    const allowedPassword = process.env.STORE_LOGIN_PASSWORD;

    if (!allowedEmail || !allowedPassword) {
      throw new Error("Sign in is not configured. Contact the store administrator.");
    }

    const email = data.email.toLowerCase();
    const validEmail = email === allowedEmail.toLowerCase();
    const validPassword = secureEqual(data.password, allowedPassword);

    if (!validEmail || !validPassword) {
      throw new Error("Invalid email or password.");
    }

    return {
      ok: true as const,
      maskedEmail: maskEmail(allowedEmail),
    };
  });
