import { PointHistoryDomain } from '../domain/point-history/point-history.domain';
import { UserPointDomain } from '../domain/user-point/user-point.domain';

export interface PointService {
  getPoint(userId: number): Promise<UserPointDomain>;
  charge(userId: number, amount: number): Promise<UserPointDomain>;
  use(userId: number, amount: number): Promise<UserPointDomain>;
  getPointHistories(userId: number): Promise<PointHistoryDomain[]>;
}
