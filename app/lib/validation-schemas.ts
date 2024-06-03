import { z } from "zod";
import { endDate, startDate } from "./utils";

export const emailSchema = z.string().email();

export const dateSchema = z
  .date()
  .min(startDate, {
    message: "Purchases made only after January 1, 2000, are permitted.",
  })
  .max(endDate);

export const amountSchema = z
  .number({ invalid_type_error: "Please enter a number." })
  .positive()
  .lte(1000000);

export const userSchema = z
  .string()
  .min(3, { message: "At least 3 characters long." })
  .max(25, { message: "At most 25 characters long." })
  .regex(RegExp(/[\p{L}\p{N} ]+/u), {
    message: "Only letters and numbers allowed",
  })
  .refine((s) => !s.includes(" "), "No Spaces.");

export const budgetSchema = z
  .string()
  .min(1, { message: "At least one character long." })
  .max(20, { message: "At most 20 characters long." });

export const passSchema = z
  .string()
  .regex(RegExp(".*[A-Z].*"), { message: "At least one capital letter." })
  .regex(RegExp(".*[0-9].*"), { message: "At least one number." })
  .regex(RegExp(/.*[?#!@$%^&*(){}\\=_>€`~<;"|'\/:,.+\[\]-].*/), {
    message: "At lesat one speical character.",
  })
  .min(8, { message: "At least 8 characters long." })
  .refine((s) => !s.includes(" "), "No Spaces.");
