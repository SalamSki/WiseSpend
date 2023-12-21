"use client";
import clsx from "clsx";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  divClass?: string;
  errors?: string[];
  label: string;
}

export function Input({
  divClass,
  className,
  type,
  label,
  errors,
  id,
  ...rest
}: InputProps) {
  const PasswordIcon = () =>
    showPassword ? (
      <EyeSlashIcon
        onClick={handleClickShowPassword}
        className={`absolute right-0 h-6 w-6 cursor-pointer`}
      />
    ) : (
      <EyeIcon
        onClick={handleClickShowPassword}
        className={`absolute right-0 h-6 w-6 cursor-pointer`}
      />
    );
  //UI
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  return (
    <div
      className={clsx("space-y-2", divClass, { relative: type === "password" })}
    >
      <div className="flex flex-row-reverse flex-wrap-reverse justify-end">
        <input
          id={id}
          type={
            type === "password" ? (showPassword ? "text" : "password") : "text"
          }
          {...rest}
          className={clsx(
            `
          hover:border-b-primary-400 focus:border-b-primary-500 peer w-full grow border-b-2 
          bg-transparent py-1 pl-2
          pr-9 text-white placeholder-bg-3
          transition-colors focus-visible:outline-none
          `,
            className,
          )}
        />
        <span className="ml-2 text-transparent peer-invalid:text-red-500">
          *
        </span>
        <label
          htmlFor={id}
          className="peer-hover:text-primary-400 peer-focus:text-primary-500 text-left text-white transition-colors"
        >
          {label}
        </label>
        {type === "password" && <PasswordIcon />}
      </div>
      <div className="space-y-1 text-left">
        {errors &&
          errors.map((err) => (
            <p className="text-sm text-red-500" key={err}>
              {err}
            </p>
          ))}
      </div>
    </div>
  );
}
