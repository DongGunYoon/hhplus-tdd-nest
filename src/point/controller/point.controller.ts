import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { PointBody as PointDto } from '../dto/point.dto';
import { PointService } from '../service/point.service';
import { pointServiceSymbol } from '../service/point.service.impl';
import { UserPointResponse } from '../dto/user-point/user-point.response';
import { PointHistoryResponse } from '../dto/point-history/point-history.response';
import { PointHistoriesResponse } from '../dto/point-history/point-histories.response';

@Controller('/point')
export class PointController {
  constructor(@Inject(pointServiceSymbol) private readonly pointService: PointService) {}

  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param('id', ParseIntPipe) id: number): Promise<UserPointResponse> {
    const point = await this.pointService.getPoint(id);

    return UserPointResponse.from(point);
  }

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(@Param('id', ParseIntPipe) id: number): Promise<PointHistoryResponse[]> {
    const pointHistories = await this.pointService.getPointHistories(id);

    return PointHistoriesResponse.from(pointHistories);
  }

  /**
   * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   */
  @Patch(':id/charge')
  @UsePipes(new ValidationPipe())
  async charge(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) pointDto: PointDto,
  ): Promise<UserPointResponse> {
    const point = await this.pointService.charge(id, pointDto.amount);

    return UserPointResponse.from(point);
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  @UsePipes(new ValidationPipe())
  async use(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) pointDto: PointDto,
  ): Promise<UserPointResponse> {
    const point = await this.pointService.use(id, pointDto.amount);

    return UserPointResponse.from(point);
  }
}
