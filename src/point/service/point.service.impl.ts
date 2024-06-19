import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Mutex, MutexInterface } from 'async-mutex';
import { UserPointRepository } from '../repository/user-point/user-point.repository';
import { PointHistoryRepository } from '../repository/point-history/point-history.repository';
import { TransactionType } from '../model/point.model';
import { PointService } from './point.service';
import { userPointRepositorySymbol } from '../repository/user-point/user-point.repository.impl';
import { pointHistoryRepositorySymbol } from '../repository/point-history/point-hisotry.repository.impl';
import { UserPointDomain } from '../domain/user-point/user-point.domain';
import { PointHistoryDomain } from '../domain/point-history/point-history.domain';

export const pointServiceSymbol = Symbol.for('PointService');

@Injectable()
export class PointServiceImpl implements PointService {
  private userLocks: Map<number, Mutex> = new Map();

  constructor(
    @Inject(userPointRepositorySymbol)
    private readonly userPointRepository: UserPointRepository,
    @Inject(pointHistoryRepositorySymbol)
    private readonly pointHistoryRepository: PointHistoryRepository,
  ) {}

  async getPoint(userId: number): Promise<UserPointDomain> {
    this.isValidId(userId);

    return await this.userPointRepository.getByUserId(userId);
  }

  async charge(userId: number, amount: number): Promise<UserPointDomain> {
    this.isValidId(userId);

    const release = await this.acquireLock(userId);
    let updatedUserPoint: UserPointDomain;

    try {
      const prevUserPoint = await this.userPointRepository.getByUserId(userId);

      prevUserPoint.charge(amount);

      updatedUserPoint = await this.userPointRepository.upsert(prevUserPoint);
    } finally {
      release();
    }

    const pointHistory = PointHistoryDomain.create(
      userId,
      amount,
      TransactionType.CHARGE,
      updatedUserPoint.updateMillis,
    );

    await this.pointHistoryRepository.create(pointHistory);

    return updatedUserPoint;
  }

  async use(userId: number, amount: number): Promise<UserPointDomain> {
    this.isValidId(userId);

    const release = await this.acquireLock(userId);
    let updatedUserPoint: UserPointDomain;

    try {
      const prevUserPoint = await this.userPointRepository.getByUserId(userId);

      prevUserPoint.use(amount);

      updatedUserPoint = await this.userPointRepository.upsert(prevUserPoint);
    } finally {
      release();
    }

    const pointHistory = PointHistoryDomain.create(userId, amount, TransactionType.USE, updatedUserPoint.updateMillis);

    await this.pointHistoryRepository.create(pointHistory);

    return updatedUserPoint;
  }

  async getPointHistories(userId: number): Promise<PointHistoryDomain[]> {
    this.isValidId(userId);

    return this.pointHistoryRepository.getAllByUserId(userId);
  }

  private isValidId(userId: number): void {
    if (userId <= 0) {
      throw new BadRequestException('올바르지 않은 ID 값 입니다.');
    }
  }

  private async acquireLock(userId: number): Promise<MutexInterface.Releaser> {
    if (!this.userLocks.has(userId)) {
      this.userLocks.set(userId, new Mutex());
    }

    return await this.userLocks.get(userId).acquire();
  }
}
