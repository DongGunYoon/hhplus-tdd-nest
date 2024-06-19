import { PointHistory, TransactionType } from '../../model/point.model';

export class PointHistoryResponse {
  id: number;
  userId: number;
  type: TransactionType;
  amount: number;
  timeMillis: number;

  static from(pointHistory: PointHistory): PointHistoryResponse {
    return {
      id: pointHistory.id,
      userId: pointHistory.userId,
      type: pointHistory.type,
      amount: pointHistory.amount,
      timeMillis: pointHistory.timeMillis,
    };
  }
}
