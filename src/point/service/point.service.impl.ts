import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Mutex, MutexInterface } from 'async-mutex';
import { UserPointRepository } from '../repository/user-point/user-point.repository';
import { PointHistoryRepository } from '../repository/point-history/point-history.repository';
import { PointHistory, TransactionType, UserPoint } from '../model/point.model';
import { PointService } from './point.service';
import { userPointRepositorySymbol } from '../repository/user-point/user-point.repository.impl';
import { pointHistoryRepositorySymbol } from '../repository/point-history/point-hisotry.repository.impl';

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

  async getPoint(userId: number): Promise<UserPoint> {
    this.isValidId(userId);

    return await this.userPointRepository.getByUserId(userId);
  }

  async charge(userId: number, amount: number): Promise<UserPoint> {
    this.isValidId(userId);

    const release = await this.acquireLock(userId);
    let updatedUserPoint: UserPoint;

    try {
      const prevUserPoint = await this.userPointRepository.getByUserId(userId);
      updatedUserPoint = await this.userPointRepository.upsert(userId, amount + prevUserPoint.point);
    } finally {
      release();
    }

    await this.pointHistoryRepository.create(userId, amount, TransactionType.CHARGE, updatedUserPoint.updateMillis);

    return updatedUserPoint;
  }

  async use(userId: number, amount: number): Promise<UserPoint> {
    this.isValidId(userId);

    const release = await this.acquireLock(userId);
    let updatedUserPoint: UserPoint;

    try {
      const prevUserPoint = await this.userPointRepository.getByUserId(userId);

      if (prevUserPoint.point < amount) {
        throw new BadRequestException('사용 가능한 포인트가 부족합니다.');
      }

      updatedUserPoint = await this.userPointRepository.upsert(userId, prevUserPoint.point - amount);
    } finally {
      release();
    }

    await this.pointHistoryRepository.create(userId, amount, TransactionType.USE, updatedUserPoint.updateMillis);

    return updatedUserPoint;
  }

  async getPointHistories(userId: number): Promise<PointHistory[]> {
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
