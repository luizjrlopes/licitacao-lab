import { NoticeStatus, Prisma, UserRole } from "@prisma/client";
import { BidsService } from "../src/bids/bids.service";

describe("BidsService", () => {
  const prismaService = {
    lot: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const redisService = {
    del: jest.fn(),
  };

  const auditService = {
    logAction: jest.fn(),
  };

  const bidsService = new BidsService(
    prismaService as never,
    redisService as never,
    auditService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve substituir proposta ativa em transação serializable e limpar cache de ranking", async () => {
    const lotId = "550e8400-e29b-41d4-a716-446655440000";
    const supplierId = "660e8400-e29b-41d4-a716-446655440000";

    prismaService.lot.findUnique.mockResolvedValue({
      id: lotId,
      notice: {
        id: "770e8400-e29b-41d4-a716-446655440000",
        status: NoticeStatus.OPEN,
      },
    });

    const tx = {
      $executeRaw: jest.fn().mockResolvedValue(undefined),
      bid: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({
          id: "880e8400-e29b-41d4-a716-446655440000",
          lotId,
          supplierId,
          amount: new Prisma.Decimal(95.25),
          isActive: true,
          createdAt: new Date("2026-03-30T00:00:00.000Z"),
          updatedAt: new Date("2026-03-30T00:00:00.000Z"),
        }),
      },
    };

    prismaService.$transaction.mockImplementation(
      async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    );

    auditService.logAction.mockResolvedValue(undefined);
    redisService.del.mockResolvedValue(undefined);

    const actor = {
      sub: supplierId,
      email: "fornecedor1@lab.local",
      role: UserRole.SUPPLIER,
      name: "Fornecedor 1",
    };

    const result = await bidsService.create(lotId, actor, {
      amount: 95.25,
    });

    expect(prismaService.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);

    expect(tx.bid.updateMany).toHaveBeenCalledWith({
      where: {
        lotId,
        supplierId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    expect(tx.bid.create).toHaveBeenCalledWith({
      data: {
        lotId,
        supplierId,
        amount: new Prisma.Decimal(95.25),
        isActive: true,
      },
      select: {
        id: true,
        lotId: true,
        supplierId: true,
        amount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      {
        actorUserId: supplierId,
        action: "BID_REPLACE",
        entityType: "BID",
        entityId: "880e8400-e29b-41d4-a716-446655440000",
        metadataJson: {
          lotId,
          supplierId,
          amount: 95.25,
          replacedPrevious: true,
        },
      },
      tx,
    );

    expect(redisService.del).toHaveBeenCalledWith(`ranking:lot:${lotId}`);

    expect(result).toEqual({
      id: "880e8400-e29b-41d4-a716-446655440000",
      lotId,
      supplierId,
      amount: new Prisma.Decimal(95.25),
      isActive: true,
      createdAt: new Date("2026-03-30T00:00:00.000Z"),
      updatedAt: new Date("2026-03-30T00:00:00.000Z"),
    });
  });
});
