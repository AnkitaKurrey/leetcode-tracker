import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Problem } from './problem.entity';

export enum RevisionStatus {
  REVISED = 'REVISED',
  SKIPPED = 'SKIPPED',
}

@Entity('revision_history')
export class RevisionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Problem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problem_id' })
  problem: Problem;

  @Index()
  @Column({ type: 'int' })
  problem_id: number;

  /** YYYY-MM-DD */
  @Column({ type: 'date' })
  revised_date: string;

  @Column({
    type: 'enum',
    enum: RevisionStatus,
  })
  status: RevisionStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;
}
