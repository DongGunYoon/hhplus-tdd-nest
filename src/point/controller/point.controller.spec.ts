import { Test } from '@nestjs/testing';
import { PointController } from './point.controller';
import { PointService } from '../service/point.service';
import { TransactionType } from '../model/point.model';
import { pointServiceSymbol } from '../service/point.service.impl';
import { UserPointDomain } from '../domain/user-point/user-point.domain';
import { PointHistoryDomain } from '../domain/point-history/point-history.domain';

describe('PointController', () => {
  let pointController: PointController;
  let pointService: PointService;

  beforeEach(async () => {
    const mockPointService = {
      getPoint: jest.fn(),
      charge: jest.fn(),
      use: jest.fn(),
      getPointHistories: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [PointController],
      providers: [{ provide: pointServiceSymbol, useValue: mockPointService }],
    }).compile();

    pointController = module.get<PointController>(PointController);
    pointService = module.get<PointService>(pointServiceSymbol);
  });

  describe('포인트 조회', () => {
    it('유저의 포인트를 조회합니다.', async () => {
      // Given
      const userId = 1;
      const userPoint = new UserPointDomain(userId, 100, Date.now());
      jest.spyOn(pointService, 'getPoint').mockResolvedValue(userPoint);

      // When
      const result = await pointController.point(userId);

      // Then
      expect(pointService.getPoint).toHaveBeenCalledTimes(1);
      expect(pointService.getPoint).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userPoint);
    });
  });

  describe('포인트 충전/이용 내역 조회', () => {
    it('유저의 포인트 충전/이용 내역을 조회합니다.', async () => {
      // Given
      const userId = 1;
      const pointHistories = [new PointHistoryDomain(1, userId, 100, TransactionType.CHARGE, Date.now())];
      jest.spyOn(pointService, 'getPointHistories').mockResolvedValue(pointHistories);

      // When
      const result = await pointController.history(userId);

      // Then
      expect(pointService.getPointHistories).toHaveBeenCalledTimes(1);
      expect(pointService.getPointHistories).toHaveBeenCalledWith(userId);
      expect(result).toEqual(pointHistories);
    });
  });

  describe('포인트 충전', () => {
    it('유저의 포인트를 충전합니다.', async () => {
      // Given
      const userId = 1;
      const chargeAmount = 100;
      const updatedUserPoint = new UserPointDomain(userId, chargeAmount, Date.now());
      jest.spyOn(pointService, 'charge').mockResolvedValue(updatedUserPoint);

      // When
      const result = await pointController.charge(userId, {
        amount: chargeAmount,
      });

      // Then
      expect(pointService.charge).toHaveBeenCalledTimes(1);
      expect(pointService.charge).toHaveBeenCalledWith(userId, chargeAmount);
      expect(result).toEqual(updatedUserPoint);
    });
  });

  describe('포인트 사용', () => {
    it('유저의 포인트를 사용합니다.', async () => {
      // Given
      const userId = 1;
      const prevAmount = 1000;
      const useAmount = 100;
      const updatedUserPoint = new UserPointDomain(userId, prevAmount - useAmount, Date.now());
      jest.spyOn(pointService, 'use').mockResolvedValue(updatedUserPoint);

      // When
      const result = await pointController.use(userId, { amount: useAmount });

      // Then
      expect(pointService.use).toHaveBeenCalledTimes(1);
      expect(pointService.use).toHaveBeenCalledWith(userId, useAmount);
      expect(result).toEqual(updatedUserPoint);
    });
  });
});
