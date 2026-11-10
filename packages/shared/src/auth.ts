import { z } from "zod";

export const RoleSchema = z.enum(["super_admin", "admin", "viewer"]);
export type Role = z.infer<typeof RoleSchema>;

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin Campaign",
  viewer: "Viewer",
};

export const AdminUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.email(),
  role: RoleSchema,
  /** Viewer bisa dibatasi ke brand tertentu; kosong = semua brand. */
  allowedBrandSlugs: z.array(z.string()).default([]),
});
export type AdminUser = z.output<typeof AdminUserSchema>;

export const LoginRequestSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  /** JWT; CMS menyimpannya di cookie httpOnly dan mengirimnya sebagai Bearer. */
  token: z.string().min(1),
  user: AdminUserSchema,
});
export type LoginResponse = z.output<typeof LoginResponseSchema>;

/** Aksi yang dibatasi per role. API wajib menegakkan aturan yang sama. */
export type Permission =
  | "content:write"
  | "voucher:upload"
  | "voucher:void"
  | "participant:viewPhone"
  | "participant:export"
  | "blocklist:write"
  | "sms:write"
  | "admin:manage";

const PERMISSIONS: Record<Role, readonly Permission[]> = {
  super_admin: [
    "content:write",
    "voucher:upload",
    "voucher:void",
    "participant:viewPhone",
    "participant:export",
    "blocklist:write",
    "sms:write",
    "admin:manage",
  ],
  admin: [
    "content:write",
    "voucher:upload",
    "participant:viewPhone",
    "participant:export",
    "blocklist:write",
    "sms:write",
  ],
  viewer: [],
};

export function can(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission);
}
