import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { BidsController } from "../src/bids/bids.controller";
import { JwtAuthGuard } from "../src/auth/jwt-auth.guard";
import { ROLES_KEY } from "../src/common/decorators/roles.decorator";
import { RolesGuard } from "../src/common/guards/roles.guard";
import { UsersController } from "../src/users/users.controller";

describe("Proteção de rotas e autorização por perfil", () => {
  it("deve marcar rotas sensíveis com JwtAuthGuard", () => {
    const usersGuards: Array<new (...args: never[]) => unknown> =
      Reflect.getMetadata(GUARDS_METADATA, UsersController.prototype.me);

    expect(usersGuards).toContain(JwtAuthGuard);

    const bidsGuards: Array<new (...args: never[]) => unknown> =
      Reflect.getMetadata(GUARDS_METADATA, BidsController);

    expect(bidsGuards).toContain(JwtAuthGuard);
  });

  it("deve marcar rotas com roles esperadas", () => {
    const meRoles: UserRole[] = Reflect.getMetadata(
      ROLES_KEY,
      UsersController.prototype.me,
    );
    const listRoles: UserRole[] = Reflect.getMetadata(
      ROLES_KEY,
      UsersController.prototype.listUsers,
    );
    const bidRoles: UserRole[] = Reflect.getMetadata(
      ROLES_KEY,
      BidsController.prototype.create,
    );

    expect(meRoles).toEqual([UserRole.ADMIN, UserRole.SUPPLIER]);
    expect(listRoles).toEqual([UserRole.ADMIN]);
    expect(bidRoles).toEqual([UserRole.SUPPLIER]);
  });

  it("RolesGuard deve bloquear quando não houver usuário autenticado", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]),
    };

    const guard = new RolesGuard(reflector as unknown as Reflector);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as never;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("RolesGuard deve bloquear perfil não autorizado", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]),
    };

    const guard = new RolesGuard(reflector as unknown as Reflector);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            sub: "user-1",
            email: "fornecedor1@lab.local",
            role: UserRole.SUPPLIER,
            name: "Fornecedor 1",
          },
        }),
      }),
    } as never;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("RolesGuard deve permitir perfil autorizado", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.SUPPLIER]),
    };

    const guard = new RolesGuard(reflector as unknown as Reflector);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            sub: "user-1",
            email: "fornecedor1@lab.local",
            role: UserRole.SUPPLIER,
            name: "Fornecedor 1",
          },
        }),
      }),
    } as never;

    expect(guard.canActivate(context)).toBe(true);
  });
});
