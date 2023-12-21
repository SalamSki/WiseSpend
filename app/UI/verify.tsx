"use client";
import { CheckBadgeIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { sendVerificationMail } from "../lib/mailer";
import { OtpInput } from "@/app/UI/input-otp";
import { ClockLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

export default function VerifyPage({
  user_id,
}: {
  user_id: string | undefined;
}) {
  const SendEmailForm = () => {
    const [secAfterSent, setSecAfterSent] = useState(0);
    const [emailRes, emailDispatch] = useFormState(
      sendVerificationMail.bind(null, user_id || ""),
      { success: false, msg: "" },
    );

    //Send Email Form
    useEffect(() => {
      if (emailRes.success) setSecAfterSent(60);
      else if (!emailRes.success && emailRes.timeToWait)
        setSecAfterSent(emailRes.timeToWait);
    }, [emailRes]);

    //Count-down Timer
    useEffect(() => {
      const interval = setInterval(() => {
        if (secAfterSent > 0) setSecAfterSent(secAfterSent - 1);
        else {
          emailRes.timeToWait = undefined;
          emailRes.success = false;
        }
      }, 1000);
      return () => clearInterval(interval);
    }, [secAfterSent, emailRes]);
    return (
      <div className="flex min-h-[165px] flex-col items-center space-y-4 p-4">
        <p className="text-lg md:text-xl">Can&apos;t find it ?</p>
        <form action={() => emailDispatch()}>
          <button
            className="btn space-x-2 disabled:border-2 max-md:h-8"
            disabled={secAfterSent > 0}
            type="submit"
          >
            {secAfterSent > 0 ? (
              <>
                <ClockLoader size={25} color="white" />
                <p>{secAfterSent}</p>
              </>
            ) : (
              <>
                <p className="hidden md:block">Resend</p>
                <PaperAirplaneIcon className="h-6 w-6" />
              </>
            )}
          </button>
        </form>
        {emailRes.success ? (
          <p className="text-green-500">Email sent.</p>
        ) : (
          <p className="text-red-500">{emailRes.msg}</p>
        )}
      </div>
    );
  };
  return (
    <div className="w-full ">
      <h1 className="flex items-center justify-center space-x-4 py-8 text-center text-2xl sm:p-8 md:text-4xl">
        <CheckBadgeIcon className="h-8 w-8" />
        <p>Verify Your Account</p>
      </h1>
      <div className="mx-auto max-w-screen-sm p-2 text-center">
        <h1 className="p-4 text-xl sm:mx-8 md:text-2xl">
          Check your inbox and spam
        </h1>

        <OtpInput />

        <SendEmailForm />
      </div>
    </div>
  );
}
