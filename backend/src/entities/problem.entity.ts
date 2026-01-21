import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

@Entity('problems')
export class Problem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  leetcode_url: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
  })
  difficulty: Difficulty;

  @Column({ type: 'json', nullable: true })
  topics: string[];

  @Column({ type: 'json', nullable: true })
  companies: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  is_solved: boolean;

  @Column({ type: 'date', nullable: true })
  solved_date: Date | null;

  @Column({ type: 'int', nullable: true })
  revision_interval_days: number;

  @Column({ type: 'date', nullable: true })
  next_revision_date: Date | null;

  @Column({ type: 'date', nullable: true })
  last_revised_date: Date | null;

  @Column({ type: 'int', default: 0 })
  revision_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
