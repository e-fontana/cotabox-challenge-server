import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPartnerDto: CreatePartnerDto) {
    const totalParticipation = await this.prisma.partners.aggregate({
      _sum: {
        participationPercentage: true,
      },
    });

    const newTotal =
      (totalParticipation._sum.participationPercentage || 0) +
      createPartnerDto.participationPercentage;

    if (newTotal > 100) {
      throw new BadRequestException('Total participation exceeds 100%');
    }

    const createdPartner = await this.prisma.partners.create({
      data: {
        firstName: createPartnerDto.firstName,
        lastName: createPartnerDto.lastName,
        participationPercentage: createPartnerDto.participationPercentage,
      },
    });

    return createdPartner;
  }

  async findAll() {
    const partners = await this.prisma.partners.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        participationPercentage: true,
      },
    });

    return partners;
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto) {
    if (updatePartnerDto.participationPercentage !== undefined) {
      const totalParticipation = await this.prisma.partners.aggregate({
        where: {
          NOT: { id },
        },
        _sum: {
          participationPercentage: true,
        },
      });

      const newTotal =
        (totalParticipation._sum.participationPercentage || 0) +
        updatePartnerDto.participationPercentage;

      if (newTotal > 100) {
        throw new BadRequestException('Total participation exceeds 100%');
      }
    }

    const updatedPartner = await this.prisma.partners.update({
      where: { id },
      data: {
        firstName: updatePartnerDto.firstName,
        lastName: updatePartnerDto.lastName,
        participationPercentage: updatePartnerDto.participationPercentage,
      },
    });

    return updatedPartner;
  }

  async remove(id: string) {
    await this.prisma.partners.delete({
      where: { id },
    });
  }
}
