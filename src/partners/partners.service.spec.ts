/* eslint-disable @typescript-eslint/unbound-method */
// partners.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

describe('PartnersService', () => {
  let service: PartnersService;
  let prisma: PrismaService;

  const mockPrisma = {
    partners: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PartnersService>(PartnersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a partner if total participation <= 100', async () => {
      mockPrisma.partners.aggregate.mockResolvedValue({ _sum: { participationPercentage: 50 } });
      const dto: CreatePartnerDto = { firstName: 'John', lastName: 'Doe', participationPercentage: 30 };
      mockPrisma.partners.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);

      expect(result).toEqual({ id: '1', ...dto });
      expect(prisma.partners.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('should throw BadRequestException if total participation > 100', async () => {
      mockPrisma.partners.aggregate.mockResolvedValue({ _sum: { participationPercentage: 80 } });
      const dto: CreatePartnerDto = { firstName: 'Jane', lastName: 'Smith', participationPercentage: 30 };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all partners', async () => {
      const partners = [{ id: '1', firstName: 'John', lastName: 'Doe', participationPercentage: 50 }];
      mockPrisma.partners.findMany.mockResolvedValue(partners);

      const result = await service.findAll();
      expect(result).toEqual(partners);
      expect(prisma.partners.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          participationPercentage: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update a partner if total participation <= 100', async () => {
      mockPrisma.partners.aggregate.mockResolvedValue({ _sum: { participationPercentage: 50 } });
      const dto: UpdatePartnerDto = { firstName: 'John', lastName: 'Updated', participationPercentage: 30 };
      mockPrisma.partners.update.mockResolvedValue({ id: '1', ...dto });

      const result = await service.update('1', dto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(prisma.partners.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
    });

    it('should throw BadRequestException if total participation > 100 on update', async () => {
      mockPrisma.partners.aggregate.mockResolvedValue({ _sum: { participationPercentage: 80 } });
      const dto: UpdatePartnerDto = { participationPercentage: 30 };

      await expect(service.update('1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a partner', async () => {
      mockPrisma.partners.delete.mockResolvedValue(undefined);

      await service.remove('1');
      expect(prisma.partners.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
