import { UserRole } from "@prisma/client";

export class UpdateUserRoleDto {
  role: UserRole;
}