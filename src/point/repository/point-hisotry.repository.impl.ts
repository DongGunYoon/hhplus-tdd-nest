import { PointHistoryRepository } from './point-history.repository';
import { TransactionType, PointHistory } from '../model/point.model';
import { PointHistoryTable } from '../../database/pointhistory.table';
import { Injectable } from '@nestjs/common';

export const pointHistoryRepositorySymbol = Symbol.for('PointHistoryRepository');

@Injectable()
export class PointHistoryRepositoryImpl implements PointHistoryRepository {
  constructor(private readonly pointHistoryTable: PointHistoryTable) {}

  create(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    updateMillis: number,
  ): Promise<PointHistory> {
    return this.pointHistoryTable.insert(userId, amount, transactionType, updateMillis);
  }

  getAllByUserId(userId: number): Promise<PointHistory[]> {
    return this.pointHistoryTable.selectAllByUserId(userId);
  }
}
