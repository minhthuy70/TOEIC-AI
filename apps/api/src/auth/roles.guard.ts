import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";

import {
  UserRole,
} from "@prisma/client";

import {
  ROLES_KEY,
} from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    // Không yêu cầu role
    // => chỉ cần JwtAuthGuard
    if (!requiredRoles) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        "Không xác định được người dùng",
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        "Bạn không có quyền thực hiện thao tác này",
      );
    }

    return true;
  }
}