import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtUser } from "../auth/types/jwt-user.type";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { UsersService } from "./users.service";

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
  @Get("me")
  async me(@Req() req: AuthenticatedRequest): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const user = await this.usersService.findPublicById(req.user.sub);

    if (!user) {
      throw new NotFoundException("Usuário autenticado não encontrado");
    }

    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async listUsers(): Promise<
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    return this.usersService.listPublicUsers();
  }
}
