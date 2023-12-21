import ResetPasswordForm from "@/app/UI/reset-pass-form";
import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";

export default async function ResetPage({
  params,
}: {
  params: { resetToken: string };
}) {
  const user = await prisma.user.findUnique({
    where: { resetToken: params.resetToken },
    select: {
      id: true,
      resetDate: true,
    },
  });
  if (!user || !user.resetDate) notFound();

  const expired = new Date().getTime() - user.resetDate.getTime() > 86400000;
  return (
    <div className="flex h-screen items-center justify-center">
      {expired ? (
        <h1 className="py-8 text-center text-2xl sm:p-8 md:text-4xl">
          Link broken, please request a new one.
        </h1>
      ) : (
        <ResetPasswordForm user_id={user.id} />
      )}
    </div>
  );
}
