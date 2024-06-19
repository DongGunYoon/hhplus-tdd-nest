import { BadRequestException } from '@nestjs/common';
import { TransactionType } from '../../model/point.model';

export class PointHistoryDomain {
  constructor(
    public id: number,
    public userId: number,
    public amount: number,
    public type: TransactionType,
    public timeMillis: number,
  ) {}

  createHistory(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    timeMillis: number,
  ): PointHistoryDomain {
    if (userId <= 0) {
      throw new BadRequestException('올바르지 않은 ID 값 입니다.');
    }

    if (amount <= 0) {
      throw new BadRequestException('포인트는 0보다 커야 합니다.');
    }

    if (timeMillis <= 0) {
      throw new BadRequestException('올바르지 않은 시간 정보입니다.');
    }

    return new PointHistoryDomain(null, userId, amount, transactionType, timeMillis);
  }
}
