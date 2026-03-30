import { PrismaClient, UserRole, NoticeStatus, Prisma } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = hashSync("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lab.local" },
    update: {
      name: "Administrador",
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      name: "Administrador",
      email: "admin@lab.local",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const fornecedor1 = await prisma.user.upsert({
    where: { email: "fornecedor1@lab.local" },
    update: {
      name: "Fornecedor 1",
      passwordHash,
      role: UserRole.SUPPLIER,
    },
    create: {
      name: "Fornecedor 1",
      email: "fornecedor1@lab.local",
      passwordHash,
      role: UserRole.SUPPLIER,
    },
  });

  const fornecedor2 = await prisma.user.upsert({
    where: { email: "fornecedor2@lab.local" },
    update: {
      name: "Fornecedor 2",
      passwordHash,
      role: UserRole.SUPPLIER,
    },
    create: {
      name: "Fornecedor 2",
      email: "fornecedor2@lab.local",
      passwordHash,
      role: UserRole.SUPPLIER,
    },
  });

  const noticeDraft = await prisma.notice.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {
      title: "Edital de estudo (rascunho)",
      description: "Edital ainda em preparação para testes locais.",
      status: NoticeStatus.DRAFT,
      publishedAt: null,
      closedAt: null,
    },
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Edital de estudo (rascunho)",
      description: "Edital ainda em preparação para testes locais.",
      status: NoticeStatus.DRAFT,
    },
  });

  const noticeOpen = await prisma.notice.upsert({
    where: { id: "22222222-2222-2222-2222-222222222222" },
    update: {
      title: "Edital aberto para disputa",
      description: "Edital aberto para simulação do fluxo de propostas.",
      status: NoticeStatus.OPEN,
      publishedAt: new Date(),
      closedAt: null,
    },
    create: {
      id: "22222222-2222-2222-2222-222222222222",
      title: "Edital aberto para disputa",
      description: "Edital aberto para simulação do fluxo de propostas.",
      status: NoticeStatus.OPEN,
      publishedAt: new Date(),
    },
  });

  const lot1 = await prisma.lot.upsert({
    where: {
      noticeId_code: {
        noticeId: noticeOpen.id,
        code: "Lote-01",
      },
    },
    update: {
      description: "Aquisição de notebooks para laboratório.",
      referenceValue: new Prisma.Decimal("150000.00"),
    },
    create: {
      noticeId: noticeOpen.id,
      code: "Lote-01",
      description: "Aquisição de notebooks para laboratório.",
      referenceValue: new Prisma.Decimal("150000.00"),
    },
  });

  const lot2 = await prisma.lot.upsert({
    where: {
      noticeId_code: {
        noticeId: noticeOpen.id,
        code: "Lote-02",
      },
    },
    update: {
      description: "Serviços de manutenção preventiva.",
      referenceValue: new Prisma.Decimal("50000.00"),
    },
    create: {
      noticeId: noticeOpen.id,
      code: "Lote-02",
      description: "Serviços de manutenção preventiva.",
      referenceValue: new Prisma.Decimal("50000.00"),
    },
  });

  await prisma.bid.deleteMany({
    where: {
      lotId: {
        in: [lot1.id, lot2.id],
      },
      supplierId: {
        in: [fornecedor1.id, fornecedor2.id],
      },
    },
  });

  await prisma.bid.createMany({
    data: [
      {
        lotId: lot1.id,
        supplierId: fornecedor1.id,
        amount: new Prisma.Decimal("140000.00"),
        isActive: true,
      },
      {
        lotId: lot1.id,
        supplierId: fornecedor2.id,
        amount: new Prisma.Decimal("138500.00"),
        isActive: true,
      },
      {
        lotId: lot2.id,
        supplierId: fornecedor1.id,
        amount: new Prisma.Decimal("47000.00"),
        isActive: true,
      },
      {
        lotId: lot2.id,
        supplierId: fornecedor2.id,
        amount: new Prisma.Decimal("46500.00"),
        isActive: true,
      },
    ],
  });

  console.log("Seed concluído com sucesso.");
  console.log({
    users: [admin.email, fornecedor1.email, fornecedor2.email],
    notices: [noticeDraft.id, noticeOpen.id],
    lots: [lot1.code, lot2.code],
  });
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
