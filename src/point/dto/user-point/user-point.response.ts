import { UserPoint } from '../../model/point.model';

export class UserPointResponse {
  id: number;
  point: number;
  updateMillis: number;

  static from(userPoint: UserPoint): UserPointResponse {
    return {
      id: userPoint.id,
      point: userPoint.point,
      updateMillis: userPoint.updateMillis,
    };
  }
}
