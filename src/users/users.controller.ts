import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import User from 'src/users/users.entity';
import { UsersService } from './users.service';
import { UserDTO } from 'src/users/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    const users = await this.usersService.getAllUsers();
    return users;
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.getUserById(Number(id));
    return user;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createUser(@Body() createUserDto: UserDTO): Promise<User> {
    const newUser = await this.usersService.createUser(createUserDto);
    return newUser;
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<User> {
    const user = this.usersService.deleteById(Number(id));
    return user;
  }
}
