import { UserPoint } from 'src/point/model/point.model';

export interface UserPointRepository {
  getByUserId(id: number): Promise<UserPoint>;
  upsert(id: number, amount: number): Promise<UserPoint>;
}
