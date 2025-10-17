import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TAuthenticatedUser } from '../auth/strategies/jwt-auth.strategy';

describe('UserController', () => {
  let controller: UserController;

  const fakeUserDTO = {
        name: 'charlesdobronxs',
        email: 'dobronxs@gmail.com',
        password: 'poblemadadivisao',
        createdAt: new Date('2026-10-01T10:00:00Z'),
        updatedAt: new Date('2026-10-01T12:00:00Z'),
  }

  const mockService = {
    findWithoutPassword: jest.fn().mockResolvedValue(fakeUserDTO),

    create: jest.fn().mockResolvedValue(fakeUserDTO),

    getMeById: jest.fn().mockResolvedValue(fakeUserDTO),

    delete: jest.fn().mockResolvedValue(fakeUserDTO),

    update: jest.fn().mockResolvedValue({
      name: 'CristianoRonaldo',
      email: 'CR7@gmail.com',
      password: 'SIUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU', 
    }),
    };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);

  });

  it('should be able to get a user by id', async () => {
    const fakeUser: TAuthenticatedUser = {
      sub: 'user123',
      role: 'USER',
    }
    const result = await controller.getMeById(fakeUser);
    expect(mockService.findWithoutPassword).toHaveBeenCalledWith(fakeUser.sub);
    expect(result).toEqual(fakeUserDTO);
  })

  it('should be able to update a user', async () => {
    const fakeUser: TAuthenticatedUser = {
      sub: 'user123',
      role: 'USER',
    }

    const dto = {
      name: 'CristianoRonaldo',
      email: 'CR7@gmail.com',
      password: 'SIUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU', 
    }

    const result = await controller.updateMe(fakeUser, dto);
    expect(mockService.update).toHaveBeenCalledWith(fakeUser.sub, dto);
    expect(result).toEqual(dto);
  })
})