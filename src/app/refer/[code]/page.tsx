import { redirect } from "next/navigation";

interface ReferPageProps {
  params: {
    code: string;
  };
}

export default function ReferPage({ params }: ReferPageProps) {
  const { code } = params;

  // Simple redirect to the signup page with the referral code as a query parameter
  if (code) {
    redirect(`/auth/signup?ref=${code}`);
  }

  // Fallback to home if no code is present
  redirect("/");
}
