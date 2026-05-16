import { AppDetail } from "./_components/app-detail";

type Props = { params: Promise<{ id: string }> };

export default async function AppDetailPage({ params }: Props) {
  const { id } = await params;
  return <AppDetail appId={id} />;
}
