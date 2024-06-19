import { Test } from '@nestjs/testing';
import { PointHistoryRepository } from './point-history.repository';
import { PointHistoryRepositoryImpl, pointHistoryRepositorySymbol } from './point-hisotry.repository.impl';
import { PointHistoryTable } from '../../../database/pointhistory.table';
import { TransactionType } from '../../model/point.model';

describe('PointHistoryRepository', () => {
  let pointHistoryRepository: PointHistoryRepository;
  let pointHistoryTable: PointHistoryTable;

  beforeEach(async () => {
    const mockPointHistoryTable = { insert: jest.fn(), selectAllByUserId: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        { provide: pointHistoryRepositorySymbol, useClass: PointHistoryRepositoryImpl },
        { provide: PointHistoryTable, useValue: mockPointHistoryTable },
      ],
    }).compile();

    pointHistoryRepository = module.get<PointHistoryRepository>(pointHistoryRepositorySymbol);
    pointHistoryTable = module.get<PointHistoryTable>(PointHistoryTable);
  });

  describe('포인트 히스토리 생성', () => {
    it('포인트 히스토리 생성 시, 정상적으로 DB 로직을 호출하는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const amount = 1000;
      const transactionType = TransactionType.CHARGE;
      const updateMillis = Date.now();

      // When
      await pointHistoryRepository.create(userId, amount, transactionType, updateMillis);

      // Then
      expect(pointHistoryTable.insert).toHaveBeenCalledTimes(1);
      expect(pointHistoryTable.insert).toHaveBeenCalledWith(userId, amount, transactionType, updateMillis);
    });
  });

  describe('포인트 히스토리 내역 조회', () => {
    it('포인트 히스토리가 내역 조회 시, 정상적으로 DB 로직을 호출하는지 확인합니다.', async () => {
      // Given
      const userId = 1;

      // When
      await pointHistoryRepository.getAllByUserId(userId);

      // Then
      expect(pointHistoryTable.selectAllByUserId).toHaveBeenCalledTimes(1);
      expect(pointHistoryTable.selectAllByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
