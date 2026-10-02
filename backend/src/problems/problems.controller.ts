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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { SetRevisionDto } from './dto/set-revision.dto';
import { ReviseDto } from './dto/revise.dto';
import { QueryProblemsDto } from './dto/query-problems.dto';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post()
  create(@Body() createProblemDto: CreateProblemDto) {
    return this.problemsService.create(createProblemDto);
  }

  @Get()
  findAll(@Query() query: QueryProblemsDto) {
    return this.problemsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.problemsService.findOne(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.problemsService.getHistory(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProblemDto: UpdateProblemDto,
  ) {
    return this.problemsService.update(id, updateProblemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
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
  markAsRevised(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviseDto: ReviseDto,
  ) {
    return this.problemsService.markAsRevised(id, reviseDto.result ?? 'ok');
  }
}
