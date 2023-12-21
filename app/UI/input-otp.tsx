import { useFormState } from "react-dom";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { validateUser } from "../lib/authenticate";

export function OtpInput() {
  const [otp, setOtp] = useState("");
  const [verifyError, verifyDispatch] = useFormState(
    validateUser.bind(null, otp),
    undefined,
  );
  useEffect(() => {
    if (otp.length === 5) verifyDispatch();
  }, [otp, verifyDispatch]);
  const validateAndUpdateOtp = (input: string) => {
    if (/^[A-Z0-9]{0,5}$/.test(input)) setOtp(input);
    if (verifyError?.msg) verifyError.msg = "";
  };
  return (
    <div className="min-h-[115px] space-y-2 p-4 text-lg">
      <input
        pattern="[A-Z0-9]{0,5}"
        className={clsx(
          `
        focus:border-b-primary-500 hover:border-b-primary-400 w-[250px]
        border-b-2 bg-transparent 
        pb-2  text-center
        text-3xl uppercase
        transition-colors focus-visible:outline-none
        `,
        )}
        id="optinput"
        placeholder="XXXXX"
        autoComplete="off"
        maxLength={5}
        value={otp}
        autoFocus
        onPaste={(e) => {
          e.preventDefault();
          const clipboardData = e.clipboardData || window.Clipboard;
          validateAndUpdateOtp(clipboardData.getData("Text").toUpperCase());
        }}
        onChange={(event) =>
          validateAndUpdateOtp(event.target.value.toUpperCase())
        }
      />
      {verifyError?.msg && (
        <p className="text-center text-red-500">{verifyError?.msg}</p>
      )}
    </div>
  );
}
