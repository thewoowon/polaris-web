import { notFound } from "next/navigation";

import { KbDetail } from "./_components/kb-detail";

export default async function KbDetailPage(
  props: PageProps<"/kb/[id]">,
) {
  const { id } = await props.params;
  const docId = Number(id);
  if (!Number.isInteger(docId) || docId <= 0) notFound();
  return <KbDetail id={docId} />;
}
