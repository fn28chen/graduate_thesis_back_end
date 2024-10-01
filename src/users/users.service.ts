import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return await this.usersRepository.update({ id: userId }, { hashedRefreshToken });
  }

  async getAllUsers() {
    const users = this.usersRepository.find();
    return users;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      return user;
    }
    throw new NotFoundException('Could not find the user');
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async deleteById(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      return null;
    }

    await this.usersRepository.remove(user);
    return user;
  }
}
