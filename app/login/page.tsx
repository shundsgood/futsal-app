import { LoginForm } from "./LoginForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/";
  return <LoginForm next={safeNext} />;
}
