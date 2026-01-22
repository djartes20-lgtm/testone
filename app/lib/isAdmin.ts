import { ADMINS } from "@/app/lib/admin";

export function isAdmin(user: any) {
  if (!user) return false;
  return ADMINS.includes(user.uid);
}
