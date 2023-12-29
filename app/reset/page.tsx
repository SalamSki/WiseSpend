"use client";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Input } from "../UI/input";
import Link from "next/link";
import { useState } from "react";
import { emailSchema } from "../lib/validation-schemas";
import { sendResetMail } from "../lib/mailer";

export default function ReqestResetPage() {
  const [email_errors, setEmail_errors] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <form
      autoComplete="off"
      action={() => {
        const parsedInput = emailSchema.safeParse(email);
        if (parsedInput.success) {
          sendResetMail(email);
          setSent(true);
        } else setEmail_errors(parsedInput.error.flatten().formErrors);
      }}
      noValidate
      className="mx-auto flex h-screen flex-col lg:container md:justify-center md:overflow-hidden 2xl:max-w-screen-xl"
    >
      <div className="relative mx-auto flex max-w-screen-sm flex-col space-y-8 px-4 text-center md:py-12 md:text-lg">
        <h1 className="py-8 text-center text-2xl sm:p-8 md:text-4xl">
          Forgot your password?
        </h1>

        {sent ? (
          <div>
            <h1 className="p-4 sm:mx-8">
              An email will be sent if the account exists.
            </h1>
            <span>Refresh to retry.</span>
          </div>
        ) : (
          <>
            <Input
              autoComplete="off"
              placeholder="user@example.com"
              errors={email_errors}
              value={email}
              label="Enter email address"
              autoFocus
              type="email"
              id="email"
              divClass="min-h-[95px]"
              required
              onChange={(e) => {
                const inputText = e.target.value.trim();
                if (
                  email_errors.length > 0 &&
                  emailSchema.safeParse(inputText).success
                )
                  setEmail_errors([]);
                setEmail(inputText);
              }}
            />

            <div className="flex justify-center">
              <button className="btn space-x-2" type="submit">
                <p className="hidden md:block ">Send reset link</p>
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
          </>
        )}

        <Link className="text-primary-500 hover:text-primary-400" href="/">
          Back to login
        </Link>
      </div>
    </form>
  );
}
