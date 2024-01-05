"use client";
import { useState } from "react";
import { Input } from "./input";
import { useFormState } from "react-dom";
import { createBudget } from "../lib/action";
import { budgetSchema } from "../lib/validation-schemas";

export default function AddBudget() {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [response, dispatch] = useFormState(createBudget, undefined);
  return (
    <form
      autoComplete="off"
      action={() => {
        const parsedInput = budgetSchema.safeParse(name.trim());
        if (parsedInput.success) dispatch(name.trim());
        else setErrors(parsedInput.error.flatten().formErrors);
      }}
      noValidate
      className="mx-4 flex items-center justify-between py-10 max-md:flex-col max-md:space-y-2 md:mx-8 md:space-x-8 md:text-lg"
    >
      <Input
        autoComplete="off"
        placeholder="Budget name"
        errors={response ? [...errors, response] : errors}
        value={name}
        label="Name"
        id="budget"
        type="text"
        required
        divClass="min-h-[95px]"
        onChange={(e) => {
          const inputText = e.target.value;
          if (
            errors.length > 0 &&
            budgetSchema.safeParse(inputText.trim()).success
          )
            setErrors([]);
          setName(inputText);
        }}
      />
      <button
        type="submit"
        className="btn max-h-16 min-w-[173px] border-none bg-primary-500 text-dark-100 hover:bg-primary-400 hover:text-dark-100"
      >
        Create Budget
      </button>
    </form>
  );
}
