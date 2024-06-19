import { PointHistory } from 'src/point/model/point.model';
import { PointHistoryResponse } from './point-history.response';

export class PointHistoriesResponse {
  static from(pointHistories: PointHistory[]): PointHistoryResponse[] {
    return pointHistories.map(pointHistory => PointHistoryResponse.from(pointHistory));
  }
}
