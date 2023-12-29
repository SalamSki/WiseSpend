"use client";
import { useFormState } from "react-dom";
import { Input } from "./UI/input";
import Link from "next/link";
import { authenticate } from "./lib/authenticate";

export default function LoginPage() {
  //Form
  const [error_code, dispatch] = useFormState(authenticate, undefined);
  return (
    <form
      action={dispatch}
      autoComplete="off"
      noValidate
      className="mx-auto flex h-screen flex-col lg:container md:justify-center md:overflow-hidden 2xl:max-w-screen-xl"
    >
      <div className="relative mx-auto flex w-full max-w-[500px] flex-col space-y-8 px-4 text-center md:py-12 md:text-lg">
        <h1 className="py-8 text-center text-2xl sm:p-8 md:text-4xl">Login</h1>

        <div className="space-y-8">
          <Input
            autoComplete="off"
            placeholder="user@example.com"
            label="Email or Username"
            name="identifier"
            id="identifier"
            required
          />
          <Input
            autoComplete="off"
            placeholder="* * * * * * * *"
            label="Password"
            type="password"
            id="password"
            name="pass"
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          {error_code ? <p className="text-red-500">{error_code}</p> : ""}
          <button className="btn" type="submit">
            log in
          </button>
        </div>

        <div className="flex justify-center space-x-12">
          <Link
            className="text-primary-500 hover:text-primary-400"
            href="/reset"
          >
            Reset Password
          </Link>

          <Link
            className="text-primary-500 hover:text-primary-400"
            href="/signup"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
}
