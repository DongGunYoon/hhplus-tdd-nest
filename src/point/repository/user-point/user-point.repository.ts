import { UserPointDomain } from '../../domain/user-point/user-point.domain';

export interface UserPointRepository {
  getByUserId(id: number): Promise<UserPointDomain>;
  upsert(userPointDomain: UserPointDomain): Promise<UserPointDomain>;
}
