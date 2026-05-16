import { CompaniesTable } from "./_components/companies-table";

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          분석 대상 기업을 등록하고 관리합니다.
        </p>
      </header>
      <CompaniesTable />
    </div>
  );
}
