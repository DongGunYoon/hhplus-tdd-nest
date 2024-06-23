import { Module } from '@nestjs/common';
import { PointController } from './controller/point.controller';
import { DatabaseModule } from '../database/database.module';
import { PointServiceImpl, pointServiceSymbol } from './service/point.service.impl';
import {
  PointHistoryRepositoryImpl,
  pointHistoryRepositorySymbol,
} from './repository/point-history/point-hisotry.repository.impl';
import { UserPointRepositoryImpl, userPointRepositorySymbol } from './repository/user-point/user-point.repository.impl';

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
  providers: [
    {
      provide: pointServiceSymbol,
      useClass: PointServiceImpl,
    },
    {
      provide: pointHistoryRepositorySymbol,
      useClass: PointHistoryRepositoryImpl,
    },
    {
      provide: userPointRepositorySymbol,
      useClass: UserPointRepositoryImpl,
    },
  ],
})
export class PointModule {}
