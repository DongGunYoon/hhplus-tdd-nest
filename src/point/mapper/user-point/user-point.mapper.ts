import { UserPointDomain } from '../../domain/user-point/user-point.domain';
import { UserPoint } from '../../model/point.model';

export class UserPointMapper {
  static toDomain(entity: UserPoint): UserPointDomain {
    return new UserPointDomain(entity.id, entity.point, entity.updateMillis);
  }

  static toEntity(domain: UserPointDomain): UserPoint {
    return {
      id: domain.id,
      point: domain.point,
      updateMillis: domain.updateMillis,
    };
  }
}
