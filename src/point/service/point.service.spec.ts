import { PointHistoryRepository } from '../repository/point-history.repository';
import { Test } from '@nestjs/testing';
import { PointService } from './point.service';
import { UserPointRepository } from '../repository/user-point.repository';
import { PointHistory, TransactionType } from '../model/point.model';
import { PointServiceImpl, pointServiceSymbol } from './point.service.impl';
import { pointHistoryRepositorySymbol } from '../repository/point-hisotry.repository.impl';
import { userPointRepositorySymbol } from '../repository/user-point.repository.impl';

describe('PointService', () => {
  let pointService: PointService;
  let pointHistoryRepository: PointHistoryRepository;
  let userPointRepository: UserPointRepository;

  beforeEach(async () => {
    const mockPointHistoryRepository = {
      create: jest.fn(),
      getAllByUserId: jest.fn(),
    };

    const mockUserPointRepository = {
      getByUserId: jest.fn(),
      upsert: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        { provide: pointServiceSymbol, useClass: PointServiceImpl },
        { provide: pointHistoryRepositorySymbol, useValue: mockPointHistoryRepository },
        { provide: userPointRepositorySymbol, useValue: mockUserPointRepository },
      ],
    }).compile();

    pointService = module.get<PointService>(pointServiceSymbol);
    pointHistoryRepository = module.get<PointHistoryRepository>(pointHistoryRepositorySymbol);
    userPointRepository = module.get<UserPointRepository>(userPointRepositorySymbol);
  });

  describe('포인트 충전/이용 내역 조회', () => {
    it('유저의 포인트 충전/이용 내역이 존재하면 해당 내역을 반환합니다.', async () => {
      // Given
      const userId = 1;
      const pointHistories = [
        {
          id: 1,
          userId: userId,
          type: TransactionType.CHARGE,
          amount: 100,
          timeMillis: Date.now(),
        },
      ];
      jest.spyOn(pointHistoryRepository, 'getAllByUserId').mockResolvedValue(pointHistories);

      // When
      const result = await pointService.getPointHistories(userId);

      // Then
      expect(pointHistoryRepository.getAllByUserId).toHaveBeenCalledTimes(1);
      expect(pointHistoryRepository.getAllByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result).toEqual(pointHistories);
    });

    it('유저의 포인트 충전/이용 내역이 없으면 빈 배열을 반환합니다.', async () => {
      // Given
      const userId = 1;
      const pointHistories: PointHistory[] = [];
      jest.spyOn(pointHistoryRepository, 'getAllByUserId').mockResolvedValue(pointHistories);

      // When
      const result = await pointService.getPointHistories(userId);

      // Then
      expect(pointHistoryRepository.getAllByUserId).toHaveBeenCalledTimes(1);
      expect(pointHistoryRepository.getAllByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(0);
      expect(result).toEqual(pointHistories);
    });
  });

  describe('포인트 조회', () => {
    it('유저의 현재 포인트를 조회합니다.', async () => {
      // Given
      const userId = 1;
      const userPoint = { id: userId, point: 100, updateMillis: Date.now() };
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(userPoint);

      // When
      const result = await pointService.getPoint(userId);

      // Then
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userPoint);
    });
  });

  describe('포인트 충전', () => {
    it('기존 포인트가 없을 때, 유저의 포인트가 충전되는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const chargeAmount = 100;
      const prevUserPoint = { id: userId, point: 0, updateMillis: Date.now() };
      const updatedUserPoint = { id: userId, point: chargeAmount, updateMillis: Date.now() };
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);

      // When
      const result = await pointService.charge(userId, chargeAmount);

      // Then
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
      expect(userPointRepository.upsert).toHaveBeenCalledTimes(1);
      expect(userPointRepository.upsert).toHaveBeenCalledWith(userId, chargeAmount);
      expect(pointHistoryRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUserPoint);
    });

    it('기존 포인트가 있을 때, 유저의 포인트가 증가되는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const prevAmount = 1000;
      const chargeAmount = 100;
      const prevUserPoint = { id: userId, point: prevAmount, updateMillis: Date.now() };
      const updatedUserPoint = { id: userId, point: prevAmount + chargeAmount, updateMillis: Date.now() };
      const pointHistory = {
        id: 1,
        userId: userId,
        type: TransactionType.CHARGE,
        amount: chargeAmount,
        timeMillis: updatedUserPoint.updateMillis,
      };
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);
      jest.spyOn(pointHistoryRepository, 'create').mockResolvedValue(pointHistory);

      // When
      const result = await pointService.charge(userId, chargeAmount);

      // Then
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
      expect(userPointRepository.upsert).toHaveBeenCalledTimes(1);
      expect(userPointRepository.upsert).toHaveBeenCalledWith(userId, prevAmount + chargeAmount);
      expect(pointHistoryRepository.create).toHaveBeenCalledTimes(1);
      expect(pointHistoryRepository.create).toHaveBeenCalledWith(
        userId,
        chargeAmount,
        TransactionType.CHARGE,
        result.updateMillis,
      );
      expect(result).toEqual(updatedUserPoint);
    });

    it('포인트 충전 시, 유저의 포인트 충전 내역이 잘 쌓이는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const chargeAmount = 100;
      const prevUserPoint = { id: userId, point: 0, updateMillis: Date.now() };
      const updatedUserPoint = { id: userId, point: chargeAmount, updateMillis: Date.now() };
      const pointHistory = {
        id: 1,
        userId: userId,
        type: TransactionType.CHARGE,
        amount: chargeAmount,
        timeMillis: updatedUserPoint.updateMillis,
      };
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);
      jest.spyOn(pointHistoryRepository, 'create').mockResolvedValue(pointHistory);

      // When
      const result = await pointService.charge(userId, chargeAmount);

      // Then
      expect(pointHistoryRepository.create).toHaveBeenCalledTimes(1);
      expect(pointHistoryRepository.create).toHaveBeenCalledWith(
        userId,
        chargeAmount,
        TransactionType.CHARGE,
        result.updateMillis,
      );
    });
  });

  describe('포인트 사용', () => {
    it('포인트 사용 시, 유저의 포인트가 충분한다면 사용합니다.', async () => {
      // Given
      const userId = 1;
      const prevAmount = 1000;
      const useAmount = 100;
      const prevUserPoint = { id: userId, point: prevAmount, updateMillis: Date.now() };
      const updatedUserPoint = { id: userId, point: prevAmount - useAmount, updateMillis: Date.now() };
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);

      // When
      const result = await pointService.use(userId, useAmount);

      // Then
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
      expect(userPointRepository.upsert).toHaveBeenCalledTimes(1);
      expect(userPointRepository.upsert).toHaveBeenCalledWith(userId, prevAmount - useAmount);
      expect(pointHistoryRepository.create).toHaveBeenCalledTimes(1);
      expect(pointHistoryRepository.create).toHaveBeenCalledWith(
        userId,
        useAmount,
        TransactionType.USE,
        result.updateMillis,
      );
      expect(result).toEqual(updatedUserPoint);
    });

    it('포인트 사용 시, 유저의 포인트 사용 내역이 잘 쌓이는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const prevAmount = 1000;
      const useAmount = 100;
      const prevUserPoint = { id: userId, point: prevAmount, updateMillis: Date.now() };
      const updatedUserPoint = { id: userId, point: prevAmount - useAmount, updateMillis: Date.now() };
      const pointHistory = {
        id: 1,
        userId: userId,
        type: TransactionType.USE,
        amount: useAmount,
        timeMillis: updatedUserPoint.updateMillis,
      };
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);
      jest.spyOn(pointHistoryRepository, 'create').mockResolvedValue(pointHistory);

      // When
      const result = await pointService.use(userId, useAmount);

      // Then
      expect(pointHistoryRepository.create).toHaveBeenCalledTimes(1);
      expect(pointHistoryRepository.create).toHaveBeenCalledWith(
        userId,
        useAmount,
        TransactionType.USE,
        result.updateMillis,
      );
      expect(result).toEqual(updatedUserPoint);
    });

    it('포인트 사용 시, 유저의 포인트가 모자르다면 에러를 던집니다.', async () => {
      // Given
      const userId = 1;
      const prevAmount = 100;
      const useAmount = 1000;
      const prevUserPoint = { id: userId, point: prevAmount, updateMillis: Date.now() };
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);

      // When, Then
      await expect(pointService.use(userId, useAmount)).rejects.toThrow(Error);
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
