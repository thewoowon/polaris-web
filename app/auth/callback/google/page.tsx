import { Suspense } from "react";

import { CallbackInner } from "./_callback-inner";

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-500">처리 중…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
