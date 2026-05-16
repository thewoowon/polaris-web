import { ReportDetailView } from "./_components/report-detail-view";

type Props = { params: Promise<{ id: string }> };

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params;
  return <ReportDetailView reportId={id} />;
}
