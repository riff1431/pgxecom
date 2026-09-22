import { z } from "zod";

export const guestCheckoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(5, "Enter a valid phone number")
    .regex(/^[+0-9\s\-()]+$/, "Enter a valid international phone number"),
  email: z.email("Invalid email").optional().or(z.literal("")),
  street: z.string().min(3, "Enter your full address"),
  area: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "Enter your city"),
  zone: z.string({
    message: "Select a shipping zone",
  }),
  notes: z.string().optional(),
  paymentMethod: z.string().default("CASH_ON_DELIVERY"),
  addressId: z.string().optional(),
  saveAddress: z.boolean().default(false).optional(),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  phone: z.string().min(5, "Enter a valid phone number"),
});

export type GuestCheckoutInput = z.input<typeof guestCheckoutSchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
