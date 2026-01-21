import { Controller, Get } from '@nestjs/common';
import { RevisionsService } from './revisions.service';

@Controller('revisions')
export class RevisionsController {
  constructor(private readonly revisionsService: RevisionsService) {}

  @Get('due')
  async getDueProblems() {
    return this.revisionsService.getDueProblems();
  }

  @Get('overdue')
  async getOverdueProblems() {
    return this.revisionsService.getOverdueProblems();
  }

  @Get('dashboard')
  async getDashboard() {
    return this.revisionsService.getDashboardSummary();
  }
}
