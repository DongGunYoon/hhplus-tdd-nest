import { UserPointRepository } from './user-point.repository';
import { UserPointTable } from '../../../database/userpoint.table';
import { Injectable } from '@nestjs/common';
import { UserPointDomain } from '../../domain/user-point/user-point.domain';
import { UserPointMapper } from '../../mapper/user-point/user-point.mapper';

export const userPointRepositorySymbol = Symbol.for('UserPointRepository');

@Injectable()
export class UserPointRepositoryImpl implements UserPointRepository {
  constructor(private readonly userPointTable: UserPointTable) {}

  async getByUserId(id: number): Promise<UserPointDomain> {
    const userPoint = await this.userPointTable.selectById(id);

    return UserPointMapper.toDomain(userPoint);
  }

  async upsert(userPointDomain: UserPointDomain): Promise<UserPointDomain> {
    const userPoint = await this.userPointTable.insertOrUpdate(userPointDomain.id, userPointDomain.point);

    return UserPointMapper.toDomain(userPoint);
  }
}
