import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { googleLoginUrl } from "@/lib/api/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardBody className="space-y-5 text-center">
          <div>
            <h1 className="text-xl font-semibold">Polaris</h1>
            <p className="mt-1 text-sm text-zinc-500">VOC Control</p>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            조직 Google 계정으로 로그인하세요.
          </p>
          <a href={googleLoginUrl} className="block">
            <Button variant="primary" className="w-full justify-center">
              Google로 로그인
            </Button>
          </a>
          <p className="text-xs text-zinc-500">
            첫 로그인 사용자는 자동으로 계정이 생성되며, 최초 계정은 관리자 권한을 받습니다.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
