import { UserPointDomain } from '../../domain/user-point/user-point.domain';

export class UserPointResponse {
  id: number;
  point: number;
  updateMillis: number;

  static from(userPoint: UserPointDomain): UserPointResponse {
    return {
      id: userPoint.id,
      point: userPoint.point,
      updateMillis: userPoint.updateMillis,
    };
  }
}
