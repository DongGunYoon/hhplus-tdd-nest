import { PointHistoryDomain } from '../../domain/point-history/point-history.domain';
import { PointHistory } from '../../model/point.model';

export class PointHistoryMapper {
  static toDomain(entity: PointHistory): PointHistoryDomain {
    return new PointHistoryDomain(entity.id, entity.userId, entity.amount, entity.type, entity.timeMillis);
  }

  static toEntity(domain: PointHistoryDomain): PointHistory {
    return {
      id: domain.id,
      userId: domain.userId,
      amount: domain.amount,
      type: domain.type,
      timeMillis: domain.timeMillis,
    };
  }
}
