import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { PointHistory, UserPoint } from '../model/point.model';
import { PointBody as PointDto } from '../interface/point.dto';
import { PointService } from '../service/point.service';
import { pointServiceSymbol } from '../service/point.service.impl';

@Controller('/point')
export class PointController {
  constructor(@Inject(pointServiceSymbol) private readonly pointService: PointService) {}

  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param('id', ParseIntPipe) id): Promise<UserPoint> {
    return this.pointService.getPoint(id);
  }

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(@Param('id', ParseIntPipe) id): Promise<PointHistory[]> {
    return this.pointService.getPointHistories(id);
  }

  /**
   * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   */
  @Patch(':id/charge')
  @UsePipes(new ValidationPipe())
  async charge(@Param('id', ParseIntPipe) id, @Body(ValidationPipe) pointDto: PointDto): Promise<UserPoint> {
    const amount = pointDto.amount;

    return this.pointService.charge(id, amount);
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  @UsePipes(new ValidationPipe())
  async use(@Param('id', ParseIntPipe) id, @Body(ValidationPipe) pointDto: PointDto): Promise<UserPoint> {
    const amount = pointDto.amount;

    return this.pointService.use(id, amount);
  }
}
