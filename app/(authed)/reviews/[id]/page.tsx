import { notFound } from "next/navigation";

import { ReviewDetail } from "./_components/review-detail";

export default async function ReviewDetailPage(
  props: PageProps<"/reviews/[id]">,
) {
  const { id } = await props.params;
  const reviewId = Number(id);
  if (!Number.isInteger(reviewId) || reviewId <= 0) notFound();

  return <ReviewDetail id={reviewId} />;
}
