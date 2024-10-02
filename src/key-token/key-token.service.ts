import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlackListToken } from 'src/entities/blackList.entity';
import { Repository } from 'typeorm';

@Injectable()
export class KeyTokenService {
  constructor(
    @InjectRepository(BlackListToken)
    private keyTokenRepository: Repository<BlackListToken>,
  ) {}

  async addTokenToBlacklist(token: string) {
    const blackListToken = await this.keyTokenRepository.create({ token });
    return await this.keyTokenRepository.save(blackListToken);
  }
}
