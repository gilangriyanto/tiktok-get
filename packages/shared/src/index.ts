import { z } from "zod";

export const ClaimRequestSchema = z.object({
  productId: z.string(),
  fullName: z.string().min(2),
  phone: z.string().regex(/^(\+62|62|0)8\d{7,12}$/),
  email: z.email().optional(),
  city: z.string().min(2),
  retailer: z.enum(["INDOMARET", "ALFAMART"]).optional(),
  turnstileToken: z.string(),
});

export type ClaimRequest = z.infer<typeof ClaimRequestSchema>;
