import { UnauthorizedException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { AuthService } from "../src/auth/auth.service";

describe("AuthService", () => {
  const usersService = {
    findByEmail: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const auditService = {
    logAction: jest.fn(),
  };

  const authService = new AuthService(
    usersService as never,
    jwtService as never,
    auditService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve autenticar com credenciais válidas e registrar auditoria", async () => {
    const password = "123456";
    const user = {
      id: "user-1",
      name: "Fornecedor 1",
      email: "fornecedor1@lab.local",
      passwordHash: hashSync(password, 10),
      role: UserRole.SUPPLIER,
    };

    usersService.findByEmail.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue("token-valido");
    auditService.logAction.mockResolvedValue(undefined);

    const result = await authService.login({
      email: user.email,
      password,
    });

    expect(result).toEqual({
      accessToken: "token-valido",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    expect(auditService.logAction).toHaveBeenCalledWith({
      actorUserId: user.id,
      action: "LOGIN",
      entityType: "USER",
      entityId: user.id,
      metadataJson: {
        email: user.email,
      },
    });
  });

  it("deve falhar quando o usuário não existir", async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({
        email: "naoexiste@lab.local",
        password: "123456",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("deve falhar quando a senha for inválida", async () => {
    usersService.findByEmail.mockResolvedValue({
      id: "user-1",
      name: "Fornecedor 1",
      email: "fornecedor1@lab.local",
      passwordHash: hashSync("senha-correta", 10),
      role: UserRole.SUPPLIER,
    });

    await expect(
      authService.login({
        email: "fornecedor1@lab.local",
        password: "senha-errada",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
