import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardBody className="space-y-4 text-center">
          <div>
            <h1 className="text-xl font-semibold">Polaris</h1>
            <p className="mt-1 text-sm text-zinc-500">VOC Control</p>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            로그인 플로우는 RBAC 작업과 함께 붙입니다. 현재는 대시보드로 바로 이동할 수 있습니다.
          </p>
          <Link href="/dashboard">
            <Button variant="primary" className="w-full justify-center">
              대시보드로 이동
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
