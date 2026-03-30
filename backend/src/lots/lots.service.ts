import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { NoticeStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLotDto } from "./dto/create-lot.dto";

@Injectable()
export class LotsService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly lotSelect = {
    id: true,
    noticeId: true,
    code: true,
    description: true,
    referenceValue: true,
    createdAt: true,
    updatedAt: true,
    notice: {
      select: {
        id: true,
        title: true,
        status: true,
      },
    },
  };

  async create(
    noticeId: string,
    createLotDto: CreateLotDto,
  ): Promise<{
    id: string;
    noticeId: string;
    code: string;
    description: string;
    referenceValue: Prisma.Decimal;
    createdAt: Date;
    updatedAt: Date;
    notice: {
      id: string;
      title: string;
      status: NoticeStatus;
    };
  }> {
    const notice = await this.prismaService.notice.findUnique({
      where: { id: noticeId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!notice) {
      throw new NotFoundException("Edital não encontrado");
    }

    if (notice.status === NoticeStatus.CLOSED) {
      throw new BadRequestException(
        "Não é permitido criar lote em edital encerrado",
      );
    }

    try {
      return await this.prismaService.lot.create({
        data: {
          noticeId,
          code: createLotDto.code,
          description: createLotDto.description,
          referenceValue: new Prisma.Decimal(createLotDto.referenceValue),
        },
        select: this.lotSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException(
          "Já existe lote com este código para o edital informado",
        );
      }

      throw error;
    }
  }

  async detail(id: string): Promise<{
    id: string;
    noticeId: string;
    code: string;
    description: string;
    referenceValue: Prisma.Decimal;
    createdAt: Date;
    updatedAt: Date;
    notice: {
      id: string;
      title: string;
      status: NoticeStatus;
    };
  }> {
    const lot = await this.prismaService.lot.findUnique({
      where: { id },
      select: this.lotSelect,
    });

    if (!lot) {
      throw new NotFoundException("Lote não encontrado");
    }

    return lot;
  }
}
