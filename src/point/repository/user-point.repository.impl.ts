import { UserPointRepository } from './user-point.repository';
import { UserPoint } from '../model/point.model';
import { UserPointTable } from '../../database/userpoint.table';
import { Injectable } from '@nestjs/common';

export const userPointRepositorySymbol = Symbol.for('UserPointRepository');

@Injectable()
export class UserPointRepositoryImpl implements UserPointRepository {
  constructor(private readonly userPointTable: UserPointTable) {}

  getByUserId(id: number): Promise<UserPoint> {
    return this.userPointTable.selectById(id);
  }

  upsert(id: number, amount: number): Promise<UserPoint> {
    return this.userPointTable.insertOrUpdate(id, amount);
  }
}
