import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
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

  /** Unique when present; many problems may have no URL. */
  @Column({ type: 'varchar', length: 500, unique: true, nullable: true })
  leetcode_url: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: Difficulty,
    nullable: true,
  })
  difficulty: Difficulty | null;

  @Column({ type: 'json', nullable: true })
  topics: string[] | null;

  @Column({ type: 'json', nullable: true })
  companies: string[] | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Index()
  @Column({ type: 'boolean', default: false })
  is_solved: boolean;

  /** YYYY-MM-DD */
  @Column({ type: 'date', nullable: true })
  solved_date: string | null;

  @Column({ type: 'int', nullable: true })
  revision_interval_days: number | null;

  /** YYYY-MM-DD */
  @Index()
  @Column({ type: 'date', nullable: true })
  next_revision_date: string | null;

  /** YYYY-MM-DD */
  @Column({ type: 'date', nullable: true })
  last_revised_date: string | null;

  @Column({ type: 'int', default: 0 })
  revision_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
