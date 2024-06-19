import { PointHistoryRepository } from '../repository/point-history/point-history.repository';
import { Test } from '@nestjs/testing';
import { PointService } from './point.service';
import { UserPointRepository } from '../repository/user-point/user-point.repository';
import { TransactionType } from '../model/point.model';
import { PointServiceImpl, pointServiceSymbol } from './point.service.impl';
import { pointHistoryRepositorySymbol } from '../repository/point-history/point-hisotry.repository.impl';
import { userPointRepositorySymbol } from '../repository/user-point/user-point.repository.impl';
import { UserPointDomain } from '../domain/user-point/user-point.domain';
import { PointHistoryDomain } from '../domain/point-history/point-history.domain';

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

  describe('포인트 조회', () => {
    it('유저의 현재 포인트를 조회합니다.', async () => {
      // Given
      const userId = 1;
      const userPoint = new UserPointDomain(userId, 100, Date.now());
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(userPoint);

      // When
      const result = await pointService.getPoint(userId);

      // Then
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userPoint);
    });

    it('유저의 아이디가 유효하지 않으면 에러가 발생합니다.', async () => {
      // Given
      const userId = -1;

      // When
      const work = () => pointService.getPoint(userId);

      // Then
      expect(work()).rejects.toThrow('올바르지 않은 ID 값 입니다.');
    });
  });

  describe('포인트 충전', () => {
    it('기존 포인트가 없을 때, 유저의 포인트가 충전되는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const chargeAmount = 100;
      const prevUserPoint = new UserPointDomain(userId, 0, Date.now());
      const updatedUserPoint = new UserPointDomain(userId, chargeAmount, Date.now());
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);

      // When
      const result = await pointService.charge(userId, chargeAmount);

      // Then
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
      expect(userPointRepository.upsert).toHaveBeenCalledTimes(1);
      expect(userPointRepository.upsert).toHaveBeenCalledWith(updatedUserPoint);
      expect(pointHistoryRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUserPoint);
    });

    it('기존 포인트가 있을 때, 유저의 포인트가 증가되는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const prevAmount = 1000;
      const chargeAmount = 100;
      const prevUserPoint = new UserPointDomain(userId, prevAmount, Date.now());
      const updatedUserPoint = new UserPointDomain(userId, prevAmount + chargeAmount, Date.now());
      const pointHistory = PointHistoryDomain.create(
        userId,
        chargeAmount,
        TransactionType.CHARGE,
        updatedUserPoint.updateMillis,
      );
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);
      jest.spyOn(pointHistoryRepository, 'create').mockResolvedValue(pointHistory);

      // When
      const result = await pointService.charge(userId, chargeAmount);

      // Then
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
      expect(userPointRepository.upsert).toHaveBeenCalledTimes(1);
      expect(userPointRepository.upsert).toHaveBeenCalledWith(updatedUserPoint);
      expect(pointHistoryRepository.create).toHaveBeenCalledTimes(1);
      expect(pointHistoryRepository.create).toHaveBeenCalledWith(pointHistory);
      expect(result).toEqual(updatedUserPoint);
    });

    it('포인트 충전 시, 유저의 포인트 충전 내역이 잘 쌓이는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const chargeAmount = 100;
      const prevUserPoint = new UserPointDomain(userId, 0, Date.now());
      const updatedUserPoint = new UserPointDomain(userId, chargeAmount, Date.now());
      const pointHistory = PointHistoryDomain.create(
        userId,
        chargeAmount,
        TransactionType.CHARGE,
        updatedUserPoint.updateMillis,
      );
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);
      jest.spyOn(pointHistoryRepository, 'create').mockResolvedValue(pointHistory);

      // When
      await pointService.charge(userId, chargeAmount);

      // Then
      expect(pointHistoryRepository.create).toHaveBeenCalledTimes(1);
      expect(pointHistoryRepository.create).toHaveBeenCalledWith(pointHistory);
    });
  });

  describe('포인트 사용', () => {
    it('포인트 사용 시, 유저의 포인트가 충분한다면 사용합니다.', async () => {
      // Given
      const userId = 1;
      const prevAmount = 1000;
      const useAmount = 100;
      const prevUserPoint = new UserPointDomain(userId, prevAmount, Date.now());
      const updatedUserPoint = new UserPointDomain(userId, prevAmount - useAmount, Date.now());
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);

      // When
      const result = await pointService.use(userId, useAmount);

      // Then
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
      expect(userPointRepository.upsert).toHaveBeenCalledTimes(1);
      expect(userPointRepository.upsert).toHaveBeenCalledWith(updatedUserPoint);
      expect(result).toEqual(updatedUserPoint);
    });

    it('포인트 사용 시, 유저의 포인트 사용 내역이 잘 쌓이는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const prevAmount = 1000;
      const useAmount = 100;
      const prevUserPoint = new UserPointDomain(userId, prevAmount, Date.now());
      const updatedUserPoint = new UserPointDomain(userId, prevAmount - useAmount, Date.now());
      const pointHistory = PointHistoryDomain.create(
        userId,
        useAmount,
        TransactionType.USE,
        updatedUserPoint.updateMillis,
      );
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);
      jest.spyOn(userPointRepository, 'upsert').mockResolvedValue(updatedUserPoint);
      jest.spyOn(pointHistoryRepository, 'create').mockResolvedValue(pointHistory);

      // When
      const result = await pointService.use(userId, useAmount);

      // Then
      expect(pointHistoryRepository.create).toHaveBeenCalledTimes(1);
      expect(pointHistoryRepository.create).toHaveBeenCalledWith(pointHistory);
      expect(result).toEqual(updatedUserPoint);
    });

    it('포인트 사용 시, 유저의 포인트가 모자르다면 에러를 던집니다.', async () => {
      // Given
      const userId = 1;
      const prevAmount = 100;
      const useAmount = 1000;
      const prevUserPoint = new UserPointDomain(userId, prevAmount, Date.now());
      jest.spyOn(userPointRepository, 'getByUserId').mockResolvedValue(prevUserPoint);

      // When
      const work = () => pointService.use(userId, useAmount);

      // Then
      await expect(work).rejects.toThrow(Error);
      expect(userPointRepository.getByUserId).toHaveBeenCalledTimes(1);
      expect(userPointRepository.getByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('포인트 충전/이용 내역 조회', () => {
    it('유저의 포인트 충전/이용 내역이 존재하면 해당 내역을 반환합니다.', async () => {
      // Given
      const userId = 1;
      const pointHistories = [new PointHistoryDomain(1, userId, 100, TransactionType.CHARGE, Date.now())];
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
      const pointHistories: PointHistoryDomain[] = [];
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
});
