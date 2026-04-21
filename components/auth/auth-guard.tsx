"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok" | "redirect">("checking");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setStatus("redirect");
      router.replace("/login");
    } else {
      setStatus("ok");
    }
  }, [router]);

  if (status !== "ok") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        {status === "checking" ? "세션 확인 중…" : "로그인 페이지로 이동 중…"}
      </div>
    );
  }

  return <>{children}</>;
}
