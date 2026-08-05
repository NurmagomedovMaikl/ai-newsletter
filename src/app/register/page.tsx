import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage() {
  const user = await getSession();
  if (user) redirect("/dashboard");
  return <AuthForm mode="register" />;
}
