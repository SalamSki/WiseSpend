"use client";
import { useFormState } from "react-dom";
import { Input } from "./input";
import { useState } from "react";
import { resetPass } from "../lib/authenticate";
import { passSchema } from "../lib/validation-schemas";

const ResetPasswordForm = ({ user_id }: { user_id: string }) => {
  const [pass_res, pass_dispatch] = useFormState(
    resetPass.bind(null, user_id),
    "",
  );
  const [pass_errors, setPassErrors] = useState<string[]>([]);
  const [newPass, setNewPass] = useState("");
  const placeholder = "* * * * * * * *";
  return (
    <form
      autoComplete="off"
      action={(formData: FormData) => {
        const parsedInput = passSchema.safeParse(newPass);
        if (parsedInput.success) pass_dispatch(formData);
        else setPassErrors(parsedInput.error.flatten().formErrors);
      }}
      noValidate
      className="mx-4 flex flex-col justify-between space-y-8 py-8 md:mx-8 md:text-lg"
    >
      <h1 className="md:text-4x py-8 text-center text-2xl sm:p-8">
        Create your new password
      </h1>
      <Input
        autoComplete="off"
        placeholder={placeholder}
        errors={pass_errors}
        value={newPass}
        divClass="min-h-[95px]"
        label="New Password"
        type="password"
        id="newPass"
        name="newPass"
        required
        onChange={(e) => {
          const inputText = e.target.value.trim();
          if (pass_errors.length > 0) {
            const parsedInput = passSchema.safeParse(inputText);
            if (parsedInput.success) setPassErrors([]);
            else setPassErrors(parsedInput.error?.flatten().formErrors);
          }
          setNewPass(inputText);
        }}
      />
      <Input
        autoComplete="off"
        placeholder={placeholder}
        label="Confirm new password"
        type="password"
        divClass="min-h-[95px]"
        id="confirmPass"
        name="confirmPass"
        required
      />
      {pass_res ? <p className="text-red-500">{pass_res}</p> : ""}
      <button className="btn">change password</button>
    </form>
  );
};
export default ResetPasswordForm;
