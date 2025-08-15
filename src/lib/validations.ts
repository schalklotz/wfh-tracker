import { z } from "zod"

const BaseWfhEntrySchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  reasonId: z.string().optional(),
  freeTextReason: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  hours: z.number().optional(),
  notes: z.string().optional(),
})

export const CreateWfhEntrySchema = BaseWfhEntrySchema.refine((data) => data.reasonId || data.freeTextReason, {
  message: "Either a reason or free text reason is required",
  path: ["reasonId"]
})

export const UpdateWfhEntrySchema = BaseWfhEntrySchema.extend({
  id: z.string()
}).refine((data) => data.reasonId || data.freeTextReason, {
  message: "Either a reason or free text reason is required",
  path: ["reasonId"]
})

export const CreateStaffSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  active: z.boolean().default(true),
  role: z.enum(["USER", "ADMIN"]).default("USER")
})

export const UpdateStaffSchema = CreateStaffSchema.extend({
  id: z.string()
})

export const CreateReasonSchema = z.object({
  name: z.string().min(1, "Reason name is required"),
  isActive: z.boolean().default(true)
})

export const UpdateReasonSchema = CreateReasonSchema.extend({
  id: z.string()
})

export type CreateWfhEntry = z.infer<typeof CreateWfhEntrySchema>
export type UpdateWfhEntry = z.infer<typeof UpdateWfhEntrySchema>
export type CreateStaff = z.infer<typeof CreateStaffSchema>
export type UpdateStaff = z.infer<typeof UpdateStaffSchema>
export type CreateReason = z.infer<typeof CreateReasonSchema>
export type UpdateReason = z.infer<typeof UpdateReasonSchema>