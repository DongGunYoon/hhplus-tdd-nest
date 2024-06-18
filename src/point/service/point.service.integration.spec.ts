import { PointService } from './point.service';
import { PointServiceImpl, pointServiceSymbol } from './point.service.impl';
import { Test } from '@nestjs/testing';
import { TransactionType } from '../model/point.model';
import { UserPointRepositoryImpl, userPointRepositorySymbol } from '../repository/user-point.repository.impl';
import { PointHistoryRepositoryImpl, pointHistoryRepositorySymbol } from '../repository/point-hisotry.repository.impl';
import { DatabaseModule } from '../../database/database.module';

describe('PointService', () => {
  let pointService: PointService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        { provide: pointServiceSymbol, useClass: PointServiceImpl },
        { provide: pointHistoryRepositorySymbol, useClass: PointHistoryRepositoryImpl },
        { provide: userPointRepositorySymbol, useClass: UserPointRepositoryImpl },
      ],
    }).compile();

    pointService = module.get<PointService>(pointServiceSymbol);
  });

  describe('포인트 충전/이용 내역 조회', () => {
    it('유저의 포인트 충전/이용 내역이 있다면, 순서에 맞게 해당 내역을 반환합니다.', async () => {
      // Given
      const userId = 1;
      await pointService.charge(userId, 1000);
      await pointService.use(userId, 300);
      await pointService.use(userId, 400);
      await pointService.charge(userId, 100);

      // When
      const pointHistories = await pointService.getPointHistories(userId);

      // Then
      expect(pointHistories[0].amount).toBe(1000);
      expect(pointHistories[0].type).toBe(TransactionType.CHARGE);
      expect(pointHistories[1].amount).toBe(300);
      expect(pointHistories[1].type).toBe(TransactionType.USE);
      expect(pointHistories[2].amount).toBe(400);
      expect(pointHistories[2].type).toBe(TransactionType.USE);
      expect(pointHistories[3].amount).toBe(100);
      expect(pointHistories[3].type).toBe(TransactionType.CHARGE);
    });

    it('유저의 포인트 충전/이용 내역이 없다면 빈 내역을 반환합니다.', async () => {
      // Given
      const userId = 1;

      // When
      const pointHistories = await pointService.getPointHistories(userId);

      // Then
      expect(pointHistories).toHaveLength(0);
    });
  });

  describe('포인트 조회', () => {
    it('유저가 포인트 충전 이력이 없다면 0 포인트를 반환합니다.', async () => {
      // Given
      const userId = 1;

      // When
      const userPoint = await pointService.getPoint(userId);

      // Then
      expect(userPoint.id).toBe(userId);
      expect(userPoint.point).toBe(0);
    });

    it('유저의 포인트 충전/사용 내역이 있으면 최종 포인트를 반환합니다.', async () => {
      // Given
      const userId = 1;
      await pointService.charge(userId, 1000);
      await pointService.charge(userId, 300);
      await pointService.use(userId, 1300);

      // When
      const userPoint = await pointService.getPoint(userId);

      // Then
      expect(userPoint.id).toBe(userId);
      expect(userPoint.point).toBe(1000 + 300 - 1300);
    });
  });

  describe('포인트 충전', () => {
    it('유저가 첫 충전 시, 포인트가 잘 충전되는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const chargeAmount = 1000;

      // When
      const userPoint = await pointService.charge(userId, chargeAmount);

      // Then
      expect(userPoint.id).toBe(userId);
      expect(userPoint.point).toBe(chargeAmount);
    });

    it('유저가 여러 번 충전 시, 잘 충전되는지 확인합니다.', async () => {
      // Given
      const userId = 1;

      // When
      await pointService.charge(userId, 1000);
      await pointService.charge(userId, 100);
      const userPoint = await pointService.charge(userId, 50);

      // Then
      expect(userPoint.id).toBe(userId);
      expect(userPoint.point).toBe(1150);
    });

    it('여러 유저가 충전 시, 각자의 포인트로 잘 충전되는지 확인합니다.', async () => {
      // Given
      const firstUserUse = { userId: 1, amount: 1000 };
      const secondUserUse = { userId: 2, amount: 2000 };
      const thirdUserUse = { userId: 3, amount: 3000 };

      // When
      const firstUserPoint = await pointService.charge(firstUserUse.userId, firstUserUse.amount);
      const secondUserPoint = await pointService.charge(secondUserUse.userId, secondUserUse.amount);
      const thirdUserPoint = await pointService.charge(thirdUserUse.userId, thirdUserUse.amount);

      // Then
      expect(firstUserPoint.id).toBe(firstUserUse.userId);
      expect(firstUserPoint.point).toBe(firstUserUse.amount);
      expect(secondUserPoint.id).toBe(secondUserUse.userId);
      expect(secondUserPoint.point).toBe(secondUserUse.amount);
      expect(thirdUserPoint.id).toBe(thirdUserUse.userId);
      expect(thirdUserPoint.point).toBe(thirdUserUse.amount);
    });
  });

  describe('포인트 사용', () => {
    it('유저가 포인트 사용 시, 포인트가 잘 감소되는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      await pointService.charge(userId, 1000);

      // When
      const userPoint = await pointService.use(userId, 400);

      // Then
      expect(userPoint.id).toBe(userId);
      expect(userPoint.point).toBe(600);
    });

    it('유저가 여러 번 사용 시, 포인트가 잘 감소되는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      await pointService.charge(userId, 1000);

      // When
      await pointService.use(userId, 100);
      await pointService.use(userId, 200);
      const userPoint = await pointService.use(userId, 300);

      // Then
      expect(userPoint.id).toBe(userId);
      expect(userPoint.point).toBe(400);
    });

    it('여러 유저가 사용 시, 각자의 포인트가 잘 감소되는지 확인합니다.', async () => {
      // Given
      const firstUserUse = { userId: 1, amount: 100 };
      const secondUserUse = { userId: 2, amount: 200 };
      const thirdUserUse = { userId: 3, amount: 300 };
      await pointService.charge(1, 1000);
      await pointService.charge(2, 1000);
      await pointService.charge(3, 1000);

      // When
      const firstUserPoint = await pointService.use(firstUserUse.userId, firstUserUse.amount);
      const secondUserPoint = await pointService.use(secondUserUse.userId, secondUserUse.amount);
      const thirdUserPoint = await pointService.use(thirdUserUse.userId, thirdUserUse.amount);

      // Then
      expect(firstUserPoint.id).toBe(firstUserUse.userId);
      expect(firstUserPoint.point).toBe(900);
      expect(secondUserPoint.id).toBe(secondUserUse.userId);
      expect(secondUserPoint.point).toBe(800);
      expect(thirdUserPoint.id).toBe(thirdUserUse.userId);
      expect(thirdUserPoint.point).toBe(700);
    });

    it('사용하려는 포인트가 모자르다면 에러가 발생합니다.', async () => {
      // Given
      const userId = 1;
      await pointService.charge(userId, 500);

      // When
      try {
        await pointService.use(userId, 1000);
      } catch (e) {
        //Then
        expect(e.status).toBe(400);
        expect(e.message).toBe('사용 가능한 포인트가 부족합니다.');
      }
    });
  });
});
