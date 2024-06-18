import { PointHistory, UserPoint } from '../model/point.model';

export interface PointService {
  getPoint(userId: number): Promise<UserPoint>;
  charge(userId: number, amount: number): Promise<UserPoint>;
  use(userId: number, amount: number): Promise<UserPoint>;
  getPointHistories(userId: number): Promise<PointHistory[]>;
}
