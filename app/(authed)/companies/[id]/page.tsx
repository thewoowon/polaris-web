import { CompanyDetail } from "./_components/company-detail";

type Props = { params: Promise<{ id: string }> };

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;
  return <CompanyDetail companyId={id} />;
}
