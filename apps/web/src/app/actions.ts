"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_TOKEN_COOKIE,
  buildApiUrl,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth";

export async function logoutAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken && refreshToken) {
    await fetch(buildApiUrl("/auth/logout"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    }).catch(() => null);
  }

  clearAuthCookies(cookieStore);
  redirect("/login");
}
