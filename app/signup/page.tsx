"use client";
import { emailSchema, passSchema, userSchema } from "../lib/validation-schemas";
import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { Input } from "../UI/input";
import { createUser } from "../lib/authenticate";

type Errors = {
  username?: string[] | undefined;
  email?: string[] | undefined;
  pass?: string[] | undefined;
};

export default function SignUpPage() {
  const SingUpForm = () => {
    //Input
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    //Form
    const [error_code, dispatch] = useFormState(createUser, undefined);
    const [errors, setErrors] = useState<Errors>({});
    const handleSubmit = () => {
      const parsedFields = z
        .object({
          username: userSchema,
          email: emailSchema,
          pass: passSchema,
        })
        .safeParse({ username, email, pass });
      if (parsedFields.success) dispatch({ username, email, pass });
      else setErrors(parsedFields.error.flatten().fieldErrors);
    };
    return (
      <form
        autoComplete="off"
        action={handleSubmit}
        noValidate
        className="mx-auto flex h-screen flex-col lg:container md:justify-center md:overflow-hidden 2xl:max-w-screen-xl"
      >
        <div className="relative mx-auto flex w-full max-w-[500px] flex-col space-y-8 px-4 text-center md:py-12 md:text-lg">
          <h1 className="py-8 text-center text-2xl sm:p-8 md:text-4xl">
            Signup
          </h1>

          <div className="space-y-8">
            <Input
              autoComplete="off"
              placeholder="BestUser42"
              errors={errors.username}
              value={username}
              label="Username"
              name="username"
              id="username"
              type="text"
              required
              onChange={(e) => {
                const inputText = e.target.value.trim();
                if (errors.username && userSchema.safeParse(inputText).success)
                  errors.username = undefined;
                setUsername(inputText);
              }}
            />

            <Input
              autoComplete="off"
              placeholder="user@example.com"
              value={email}
              label="Email"
              name="email"
              type="email"
              id="email"
              required
              errors={errors.email}
              onChange={(e) => {
                const inputText = e.target.value.trim();
                if (errors.email && emailSchema.safeParse(inputText).success)
                  errors.email = undefined;
                setEmail(inputText);
              }}
            />

            <Input
              autoComplete="off"
              label="Password"
              placeholder="* * * * * * * *"
              type="password"
              id="password"
              value={pass}
              name="pass"
              required
              errors={errors.pass}
              onChange={(e) => {
                const inputText = e.target.value.trim();
                if (errors.pass) {
                  const parsedInput = passSchema.safeParse(inputText);
                  if (parsedInput.success) errors.pass = undefined;
                  else errors.pass = parsedInput.error?.flatten().formErrors;
                }
                setPass(inputText);
              }}
            />
          </div>

          <div className="flex flex-col space-y-2">
            {error_code && <p className="text-red-500">{error_code}</p>}
            <button className="btn" type="submit">
              SIGN UP
            </button>
          </div>
          <div className="flex space-x-4">
            <p>Already have an account?</p>
            <Link
              className="text-primary-500 hover:text-primary-400"
              href="/"
            >
              Log In
            </Link>
          </div>
        </div>
      </form>
    );
  };
  return <SingUpForm />;
}
