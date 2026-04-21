import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/nav/sidebar";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 px-6 py-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
