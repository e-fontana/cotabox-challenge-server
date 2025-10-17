import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prismaServiceMock: {
    user: {
      create: jest.Mock;
      findById: jest.Mock;
      findWithoutPassword: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  beforeEach(async () => {
    prismaServiceMock = {
      user: {
        create: jest.fn(),
        findById: jest.fn(),
        findWithoutPassword: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be able to create a user', async () => {
    const fakeUser = {
      name: 'paulinho',
      email: 'paulinhodomine@gmail.com',
      password: 'oxipaulinhooxi',
    };

    prismaServiceMock.user.create.mockResolvedValue(fakeUser);

    const dto = {
      name: fakeUser.name,
      username: fakeUser.email,
      password: fakeUser.password,
    };

    const result = await service.create(dto);
    expect(result).toEqual(fakeUser);
    expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
      data: {
        ...dto,
      },
    });
  });

  it('should be able to throw error if user already exists', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 'user123',
      name: 'pedro',
      email: 'pedrinhodofortnite',
      password: 'bigchillingtrembala',
    });

    const dto = {
      name: 'pedro',
      username: 'pedrinhodofortnite',
      password: 'bigchillingtrembala',
    };

    await expect(service.create(dto)).rejects.toThrow('User already exists');
  });

  it('should be able to find an user by id', async () => {
    const fakeUser = {
      id: 'user123',
      name: 'paulinho',
      email: 'paulinhodomine@gmail.com',
      password: 'oxipaulinhooxi',
    };

    prismaServiceMock.user.findUnique.mockResolvedValue(fakeUser);
    const result = await service.findById(fakeUser.id);
    expect(result).toEqual(fakeUser);
    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: fakeUser.id,
      },
    });
  });

  it('should be able to find an user without password', async () => {
    const fakeUser = {
      id: 'user123',
      name: 'paulinho',
      role: 'USER',
      email: 'paulinhodomine@gmail.com',
      password: 'oxipaulinhooxi',
      createdAt: '2025-07-24T12:38:07.352Z',
      updatedAt: '2025-07-24T13:39:49.143Z',
    };

    const fakeUserWithoutPassword = {
      id: 'user123',
      name: 'paulinho',
      email: 'paulinhodomine@gmail.com',
      password: 'oxipaulinhooxi',
      role: 'USER',
      createdAt: '2025-07-24T12:38:07.352Z',
      updatedAt: '2025-07-24T13:39:49.143Z',
    };

    prismaServiceMock.user.findUnique.mockResolvedValue(
      fakeUserWithoutPassword,
    );
    const result = await service.findWithoutPassword(fakeUser.id);
    expect(result).toEqual(fakeUserWithoutPassword);
    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: fakeUser.id,
      },
      omit: {
        password: true,
      },
    });
  });

  it('should be able to update a user', async () => {
    const fakeUser = {
      id: 'user456',
      name: 'itzPedrin150',
      email: 'itzPedrin150@gmail.com',
      password: 'ruladoestoporadoamassado11',
    };

    prismaServiceMock.user.findUnique.mockResolvedValue(fakeUser);

    const newName = {
      name: 'PumpedByAnubis',
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...fakeUserWithoutPassword } = fakeUser;

    prismaServiceMock.user.update.mockResolvedValue({
      ...fakeUserWithoutPassword,
      ...newName,
    });
    const result = await service.update(fakeUser.id, newName);
    expect(result).toEqual({ ...fakeUserWithoutPassword, ...newName });
    expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
      where: {
        id: fakeUser.id,
      },
      data: newName,
      omit: {
        password: true,
      }
    });
  });

  it('should be able to delete a user', async () => {
    const fakeUser = {
      id: 'user789',
      name: 'LewandowskiM10',
      email: 'LewandowskiM10@gmail.com',
      password: 'reidaequipetumulto2019',
    };

    prismaServiceMock.user.findUnique.mockResolvedValue(fakeUser);
    prismaServiceMock.user.delete.mockResolvedValue(fakeUser);
    const result = await service.delete(fakeUser.id);
    expect(result).toEqual(fakeUser);
    expect(prismaServiceMock.user.delete).toHaveBeenCalledWith({
      where: {
        id: fakeUser.id,
      },
    });
  });
});
