"use client";
import { useEffect, useState } from "react";
import { Input } from "./input";
import { useFormState } from "react-dom";
import { createBudget } from "../lib/action";
import { budgetSchema } from "../lib/validation-schemas";
import { inital_res } from "../lib/utils";

export default function AddBudget({
  closeModal,
  classNames,
}: {
  closeModal: () => void;
  classNames: string;
}) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [response, dispatch] = useFormState(createBudget, inital_res);
  useEffect(() => {
    if (response.success) closeModal();
  }, [response, closeModal]);
  return (
    <form
      autoComplete="off"
      action={() => {
        const parsedInput = budgetSchema.safeParse(name.trim());
        if (parsedInput.success) dispatch(name.trim());
        else setErrors(parsedInput.error.flatten().formErrors);
      }}
      noValidate
      className={`flex flex-col items-center space-y-2 rounded bg-dark-200 p-10 shadow-xl md:text-lg ${classNames}`}
    >
      <Input
        autoComplete="off"
        placeholder="Budget name"
        errors={
          response.msg && !response.success ? [...errors, response.msg] : errors
        }
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
      <div className="flex w-full justify-between">
        <button type="submit" className="btn max-h-16 min-w-[173px]">
          Create Budget
        </button>
        <button type="button" onClick={closeModal} className="btn">
          Cancel
        </button>
      </div>
    </form>
  );
}
