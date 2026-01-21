import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { SetRevisionDto } from './dto/set-revision.dto';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post()
  create(@Body() createProblemDto: CreateProblemDto) {
    return this.problemsService.create(createProblemDto);
  }

  @Get()
  findAll(
    @Query('difficulty') difficulty?: string,
    @Query('status') status?: string,
    @Query('is_solved') is_solved?: string,
  ) {
    const filters: any = {};
    if (difficulty) filters.difficulty = difficulty;
    if (status) filters.status = status;
    if (is_solved !== undefined) {
      filters.is_solved = is_solved === 'true';
    }
    return this.problemsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.problemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProblemDto: UpdateProblemDto,
  ) {
    return this.problemsService.update(id, updateProblemDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.problemsService.remove(id);
  }

  @Post(':id/solve')
  markAsSolved(@Param('id', ParseIntPipe) id: number) {
    return this.problemsService.markAsSolved(id);
  }

  @Post(':id/revision')
  setRevisionSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() setRevisionDto: SetRevisionDto,
  ) {
    return this.problemsService.setRevisionSchedule(
      id,
      setRevisionDto.interval_days,
    );
  }

  @Post(':id/revise')
  markAsRevised(@Param('id', ParseIntPipe) id: number) {
    return this.problemsService.markAsRevised(id);
  }
}
