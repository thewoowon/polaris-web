"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Card, CardBody } from "@/components/ui/card";
import { exchangeGoogleCode } from "@/lib/api/auth";
import { storeSession } from "@/lib/auth";

export function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const code = params.get("code");
    const googleError = params.get("error");

    if (googleError) {
      setError(`Google 로그인 취소 또는 실패: ${googleError}`);
      return;
    }
    if (!code) {
      setError("인증 코드가 없습니다.");
      return;
    }

    exchangeGoogleCode(code)
      .then((res) => {
        storeSession(res.access_token, res.refresh_token, res.user);
        router.replace("/dashboard");
      })
      .catch((e: Error) => {
        setError(`로그인 처리 실패: ${e.message}`);
      });
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardBody className="space-y-3 text-center">
          <h1 className="text-lg font-semibold">로그인 중…</h1>
          {error ? (
            <>
              <p className="text-sm text-rose-600">{error}</p>
              <a href="/login" className="text-sm text-zinc-500 hover:underline">
                로그인 화면으로 돌아가기
              </a>
            </>
          ) : (
            <p className="text-sm text-zinc-500">세션을 생성하고 있습니다.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
