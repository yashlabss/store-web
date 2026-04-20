import { notFound } from "next/navigation";
import PublicStorePage from "../../components/store/PublicStorePage";

const RESERVED = new Set([
  "api",
  "_next",
  "favicon.ico",
  "dashboard",
  "auth",
  "login",
  "signup",
  "store",
]);

type Props = { params: Promise<{ username: string }> };

export default async function UserStorePage({ params }: Props) {
  const { username } = await params;
  const lower = decodeURIComponent(username).toLowerCase();
  if (!username || RESERVED.has(lower)) {
    notFound();
  }
  return <PublicStorePage username={username} />;
}
