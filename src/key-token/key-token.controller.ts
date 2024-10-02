import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { KeyTokenService } from './key-token.service';
import { KeyToken } from 'src/entities/keyToken.entity';
import { KeyTokenDto } from './dto/key-token.dto';
import { DeleteResult } from 'typeorm';

@Controller('key-token')
export class KeyTokenController {
  constructor(private readonly keyTokenService: KeyTokenService) {}

  @Get()
  async getAllKeyTokens(): Promise<KeyToken[]> {
    const keyTokens = await this.keyTokenService.getAllKeyTokens();
    return keyTokens;
  }

  @Get(':id')
  async getKeyTokenById(id: string): Promise<KeyToken> {
    const keyToken = await this.keyTokenService.findOne(Number(id));
    return keyToken;
  }

  @Post()
  create(@Body() createKeyTokenDto: KeyTokenDto) {
    return this.keyTokenService.create(createKeyTokenDto);
  }

  @Delete(':id')
  async deleteByUserId(id: number): Promise<DeleteResult> {
    const result = await this.keyTokenService.deleteById(id);
    return result;
  }
}
