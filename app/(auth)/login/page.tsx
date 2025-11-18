import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectedFromRaw = searchParams?.redirectedFrom;
  const redirectedFrom = Array.isArray(redirectedFromRaw)
    ? redirectedFromRaw[0]
    : redirectedFromRaw;

  return <LoginForm redirectedFrom={redirectedFrom} />;
}
