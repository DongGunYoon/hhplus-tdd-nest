import { PointHistoryResponse } from './point-history.response';
import { PointHistoryDomain } from '../../domain/point-history/point-history.domain';

export class PointHistoriesResponse {
  static from(pointHistories: PointHistoryDomain[]): PointHistoryResponse[] {
    return pointHistories.map(pointHistory => PointHistoryResponse.from(pointHistory));
  }
}
