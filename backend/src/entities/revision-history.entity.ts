import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
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

  @ManyToOne(() => Problem, (problem) => problem.id)
  @JoinColumn({ name: 'problem_id' })
  problem: Problem;

  @Column({ type: 'int' })
  problem_id: number;

  @Column({ type: 'date' })
  revised_date: Date;

  @Column({
    type: 'enum',
    enum: RevisionStatus,
  })
  status: RevisionStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
