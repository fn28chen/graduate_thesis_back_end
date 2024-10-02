import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyToken } from 'src/entities/keyToken.entity';
import { KeyTokenDto } from './dto/key-token.dto';
import { Repository } from 'typeorm';

@Injectable()
export class KeyTokenService {
  constructor(
    @InjectRepository(KeyToken)
    private keyTokenRepository: Repository<KeyToken>,
  ) {}

  async getAllKeyTokens() {
    const keyTokens = this.keyTokenRepository.find();
    return keyTokens;
  }

  async findOne(id: number) {
    const keyToken = await this.keyTokenRepository.findOne({
      where: {
        id: id,
      },
    });
    if (keyToken) {
      return keyToken;
    }
    throw new NotFoundException('Could not find the keyToken');
  }

  async findOneByUserId(userId: number) {
    const keyToken = await this.keyTokenRepository.findOne({
      where: {
        userId: userId,
      },
    });
    if (keyToken) {
      return keyToken;
    }
    throw new NotFoundException(
      `Could not find the keyToken with this ${userId}`,
    );
  }

  async create(createKeyTokenDto: KeyTokenDto) {
    const keyToken = await this.keyTokenRepository.create(createKeyTokenDto);
    return await this.keyTokenRepository.save(keyToken);
  }

  async deleteById(id: number) {
    const keyToken = await this.keyTokenRepository.findOne({
      where: {
        id: id,
      },
    });
    if (keyToken) {
      return await this.keyTokenRepository.delete({ id: id });
    }
    throw new NotFoundException('Could not find the keyToken');
  }

  async deleteByUserId(userId: number) {
    const keyToken = await this.keyTokenRepository.findOne({
      where: {
        userId: userId,
      },
    });
    if (keyToken) {
      return await this.keyTokenRepository.delete({ userId: userId });
    }
    throw new NotFoundException(
      `Could not find the keyToken with this ${userId}`,
    );
  }
}
