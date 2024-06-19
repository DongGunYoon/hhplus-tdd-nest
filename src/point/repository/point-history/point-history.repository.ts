import { PointHistoryDomain } from '../../domain/point-history/point-history.domain';

export interface PointHistoryRepository {
  create(pointHistoryDomain: PointHistoryDomain): Promise<PointHistoryDomain>;
  getAllByUserId(userId: number): Promise<PointHistoryDomain[]>;
}
