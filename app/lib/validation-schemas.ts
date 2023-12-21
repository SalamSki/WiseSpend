import { z } from "zod";

export const emailSchema = z.string().email();

export const userSchema = z
  .string()
  .min(3, { message: "At least 3 characters long." })
  .max(25, { message: "At most 25 characters long." })
  .regex(RegExp("^[A-Za-z0-9]{3,}$"), {
    message: "Only letters and numbers allowed",
  })
  .refine((s) => !s.includes(" "), "No Spaces.");

export const passSchema = z
  .string()
  .regex(RegExp(".*[A-Z].*"), { message: "At least one capital letter." })
  .regex(RegExp(".*[0-9].*"), { message: "At least one number." })
  .regex(RegExp(/.*[?#!@$%^&*(){}\\=_>€`~<;"|'\/:,.+\[\]-].*/), {
    message: "At lesat one speical character.",
  })
  .min(8, { message: "At least 8 characters long." })
  .refine((s) => !s.includes(" "), "No Spaces.");
