import { notFound } from "next/navigation";
import PublicLandingPage from "../../../../components/store/PublicLandingPage";

type Props = { params: Promise<{ username: string; slug: string }> };

export default async function PublicLandingRoute({ params }: Props) {
  const { username, slug } = await params;
  if (!username || !slug) notFound();
  return <PublicLandingPage username={username} slug={slug} />;
}
