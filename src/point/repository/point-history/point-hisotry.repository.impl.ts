import { PointHistoryRepository } from './point-history.repository';
import { PointHistoryTable } from '../../../database/pointhistory.table';
import { Injectable } from '@nestjs/common';
import { PointHistoryDomain } from '../../domain/point-history/point-history.domain';
import { PointHistoryMapper } from '../../mapper/point-history/point-history.mapper';

export const pointHistoryRepositorySymbol = Symbol.for('PointHistoryRepository');

@Injectable()
export class PointHistoryRepositoryImpl implements PointHistoryRepository {
  constructor(private readonly pointHistoryTable: PointHistoryTable) {}

  async create(pointHistoryDomain: PointHistoryDomain): Promise<PointHistoryDomain> {
    const pointHistory = await this.pointHistoryTable.insert(
      pointHistoryDomain.userId,
      pointHistoryDomain.amount,
      pointHistoryDomain.type,
      pointHistoryDomain.timeMillis,
    );

    return PointHistoryMapper.toDomain(pointHistory);
  }

  async getAllByUserId(userId: number): Promise<PointHistoryDomain[]> {
    const pointHistories = await this.pointHistoryTable.selectAllByUserId(userId);

    return pointHistories.map(pointHistory => PointHistoryMapper.toDomain(pointHistory));
  }
}
