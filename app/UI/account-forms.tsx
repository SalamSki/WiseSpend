"use client";
import {
  emailSchema,
  passSchema,
  userSchema,
} from "@/app/lib/validation-schemas";
import {
  CheckIcon,
  EnvelopeIcon,
  IdentificationIcon,
  LockClosedIcon,
  PencilSquareIcon,
  TrashIcon,
  UserMinusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  changeEmail,
  changePass,
  changeUsername,
  deleteAccount,
  State,
} from "@/app/lib/action";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/app/UI/input";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";

const FormButtons = ({
  closeEdit,
}: {
  closeEdit: Dispatch<SetStateAction<0 | 1 | 2 | 3 | 4>>;
}) => {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center justify-center space-x-4">
      {pending ? (
        <BeatLoader className="mr-12" color="#b79bf8" />
      ) : (
        <>
          {/* save */}
          <button
            type="submit"
            className="btn bg-primary-500 text-dark-100 hover:text-dark-100 hover:bg-primary-400 border-none"
          >
            <CheckIcon className="h-7 w-7 stroke-2" />
          </button>
          {/* cancel */}
          <button onClick={() => closeEdit(0)} className="btn">
            <XMarkIcon className="h-7 w-7" />
          </button>
        </>
      )}
    </div>
  );
};

const inital_res = {
  success: false,
  msg: "",
};

const AccountForms = ({
  currUser,
  currEmail,
}: {
  currUser: string;
  currEmail: string;
}) => {
  const [user_res, user_dispatch] = useFormState(changeUsername, inital_res);
  const [user_errors, setUserErrors] = useState<string[]>([]);
  const [username, setUsername] = useState("");

  const [email_res, email_dispatch] = useFormState(changeEmail, inital_res);
  const [email_errors, setEmail_errors] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  const [pass_res, pass_dispatch] = useFormState(changePass, inital_res);
  const [pass_errors, setPassErrors] = useState<string[]>([]);
  const [newPass, setNewPass] = useState("");
  const placeholder = "* * * * * * * *";

  const [toastText, setToastText] = useState<string | null>(null);
  const [open, setOpen] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    setUsername("");
    setUserErrors([]);
    setEmail("");
    setEmail_errors([]);
    setNewPass("");
    setPassErrors([]);
  }, [open]);

  useEffect(() => {
    const resetResult = (
      form_res: State,
      ressetState: Dispatch<SetStateAction<string>>,
    ) => {
      if (form_res.msg) {
        setToastText(form_res.msg);
        setTimeout(() => setToastText(null), 5000);
      }
      form_res.success = inital_res.success;
      form_res.msg = inital_res.msg;
      ressetState("");
      setOpen(0);
    };
    if (user_res.success) resetResult(user_res, setUsername);
    if (pass_res.success) resetResult(pass_res, setNewPass);
  }, [user_res, pass_res]);

  const DeleteForm = () => {
    return (
      <div className="mx-4 flex justify-between py-8 md:mx-8 md:space-x-8 md:text-lg">
        {open === 4 ? (
          <>
            <h3 className="flex items-center justify-center space-x-2 md:text-lg">
              <UserMinusIcon className="h-6 w-6" />
              <p>Are you sure?</p>
            </h3>
            <form action={deleteAccount}>
              <FormButtons closeEdit={setOpen} />
            </form>
          </>
        ) : (
          <>
            <h3 className="flex items-center justify-center space-x-2 md:text-lg">
              <UserMinusIcon className="h-6 w-6" />
              <p>Delete Account</p>
            </h3>
            <button onClick={() => setOpen(4)} className="btn max-h-[42px]">
              <TrashIcon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    );
  };

  const Toast = () => {
    return toastText ? (
      <div className="bg-dark-200 fixed bottom-5 right-5 flex items-center space-x-8 rounded-md px-4 py-2 md:text-lg">
        <div className="flex items-center space-x-1">
          <CheckBadgeIcon className="text-primary-500 h-6 w-6" />
          <p>{toastText}</p>
        </div>
        <XMarkIcon
          onClick={() => setToastText(null)}
          className="h-6 w-6 cursor-pointer text-red-500"
        />
      </div>
    ) : (
      <></>
    );
  };

  return (
    <div>
      {/* Username Section */}
      {open === 1 ? (
        <form
          autoComplete="off"
          action={() => {
            const parsedInput = userSchema.safeParse(username);
            if (parsedInput.success) user_dispatch(username);
            else setUserErrors(parsedInput.error.flatten().formErrors);
          }}
          noValidate
          className="mx-4 flex justify-between py-8 max-md:flex-col md:mx-8 md:space-x-8 md:text-lg"
        >
          <Input
            autoComplete="off"
            placeholder={currUser}
            errors={
              user_res.msg && !user_res.success
                ? [...user_errors, user_res.msg]
                : user_errors
            }
            value={username}
            label="Username"
            autoFocus={open === 1}
            id="username"
            type="text"
            required
            divClass="min-h-[95px]"
            onChange={(e) => {
              const inputText = e.target.value.trim();
              if (
                user_errors.length > 0 &&
                userSchema.safeParse(inputText).success
              )
                setUserErrors([]);
              setUsername(inputText);
            }}
          />
          <FormButtons closeEdit={setOpen} />
        </form>
      ) : (
        <div className="mx-4 flex justify-between space-x-8 py-8 md:mx-8 md:text-lg">
          <h3 className="flex flex-col items-start space-x-2  md:flex-row md:justify-between">
            <div className="flex items-center justify-center space-x-2">
              <IdentificationIcon className="h-6 w-6" />
              <p>Username:</p>
            </div>
            <p className="ml-8 break-all text-gray-400">{currUser}</p>
          </h3>
          <button onClick={() => setOpen(1)} className="btn max-h-[42px]">
            <PencilSquareIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Email Section */}
      {open === 2 ? (
        <form
          autoComplete="off"
          action={() => {
            const parsedInput = emailSchema.safeParse(email);
            if (parsedInput.success) email_dispatch(email);
            else setEmail_errors(parsedInput.error.flatten().formErrors);
          }}
          noValidate
          className="mx-4 flex justify-between py-8 max-md:flex-col md:mx-8 md:space-x-8 md:text-lg"
        >
          <Input
            autoComplete="off"
            placeholder={currEmail}
            errors={
              email_res.msg && !email_res.success
                ? [...email_errors, email_res.msg]
                : email_errors
            }
            value={email}
            label="Email"
            autoFocus={open === 2}
            id="email"
            type="email"
            required
            divClass="min-h-[95px]"
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
          <FormButtons closeEdit={setOpen} />
        </form>
      ) : (
        <div className="mx-4 flex justify-between space-x-8 py-8 md:mx-8 md:text-lg">
          <h3 className="flex flex-col items-start space-x-2  md:flex-row md:justify-between">
            <div className="flex items-center justify-center space-x-2">
              <EnvelopeIcon className="h-6 w-6" />
              <p>Email:</p>
            </div>
            <p className="ml-8 break-all text-gray-400">{currEmail}</p>
          </h3>
          <button onClick={() => setOpen(2)} className="btn max-h-[42px]">
            <PencilSquareIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Password Section */}
      {open === 3 ? (
        <form
          autoComplete="off"
          action={(formData: FormData) => {
            const parsedInput = passSchema.safeParse(newPass);
            if (parsedInput.success) pass_dispatch(formData);
            else setPassErrors(parsedInput.error.flatten().formErrors);
          }}
          noValidate
          className="mx-4 flex justify-between py-8 max-md:flex-col md:mx-8 md:space-x-8 md:text-lg"
        >
          <div className="space-y-4">
            <Input
              autoComplete="off"
              placeholder={placeholder}
              label="Current Password"
              type="password"
              id="currPass"
              name="currPass"
              autoFocus={open === 3}
              divClass="min-h-[95px]"
              required
            />
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
              errors={[pass_res.msg]}
              label="Confirm new password"
              type="password"
              divClass="min-h-[95px]"
              id="confirmPass"
              name="confirmPass"
              required
            />
          </div>
          <FormButtons closeEdit={setOpen} />
        </form>
      ) : (
        <div className="mx-4 flex justify-between py-8 md:mx-8 md:space-x-8 md:text-lg">
          <h3 className="flex items-center justify-center space-x-2">
            <LockClosedIcon className="h-6 w-6" />
            <p>Change password</p>
          </h3>
          <button onClick={() => setOpen(3)} className="btn max-h-[42px]">
            <PencilSquareIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* DeleteAccount Section */}
      <DeleteForm />

      <Toast />
    </div>
  );
};
export default AccountForms;
