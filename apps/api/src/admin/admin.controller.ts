import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {

  @Get("test")
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CONTENT_ADMIN,
  )
  test() {
    return {
      success: true,
      message: "Bạn có quyền truy cập Admin",
    };
  }
}