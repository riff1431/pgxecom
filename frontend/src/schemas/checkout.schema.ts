import { z } from "zod";

export const guestCheckoutSchema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters"),
  phone: z
    .string()
    .min(6, "Enter a valid international phone number")
    .regex(/^[+0-9\s\-()]+$/, "Enter a valid international phone number with country code (e.g. +1 555 123 4567)"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  country: z.string().min(2, "Country is required").default("United States"),
  street: z.string().min(3, "Street address is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  area: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City / Municipality is required"),
  state: z.string().min(1, "State / Province / Region is required"),
  postalCode: z.string().min(2, "Postal / ZIP code is required"),
  zone: z.string({
    message: "Select a shipping method",
  }),
  notes: z.string().optional(),
  paymentMethod: z.string().default("WALLET"),
  addressId: z.string().optional(),
  saveAddress: z.boolean().default(false).optional(),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  phone: z.string().min(5, "Enter a valid phone number"),
});

export type GuestCheckoutInput = z.input<typeof guestCheckoutSchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
