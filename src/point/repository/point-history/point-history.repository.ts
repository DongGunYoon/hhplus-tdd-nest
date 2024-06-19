import { PointHistory, TransactionType } from 'src/point/model/point.model';

export interface PointHistoryRepository {
  create(userId: number, amount: number, transactionType: TransactionType, updateMillis: number): Promise<PointHistory>;
  getAllByUserId(userId: number): Promise<PointHistory[]>;
}
