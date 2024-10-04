import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

// Fix to blacklist-token
@Entity('black-list-token')
export class BlackListToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Unique(['token'])
  token: string;
}
