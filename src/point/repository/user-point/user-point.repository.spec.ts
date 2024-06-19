import { Test } from '@nestjs/testing';
import { UserPointRepository } from './user-point.repository';
import { UserPointTable } from '../../../database/userpoint.table';
import { UserPointRepositoryImpl, userPointRepositorySymbol } from './user-point.repository.impl';

describe('UserPointRepository', () => {
  let userPointRepository: UserPointRepository;
  let userPointTable: UserPointTable;

  beforeEach(async () => {
    const mockUserPointTable = { selectById: jest.fn(), insertOrUpdate: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        { provide: userPointRepositorySymbol, useClass: UserPointRepositoryImpl },
        { provide: UserPointTable, useValue: mockUserPointTable },
      ],
    }).compile();

    userPointRepository = module.get<UserPointRepository>(userPointRepositorySymbol);
    userPointTable = module.get<UserPointTable>(UserPointTable);
  });

  describe('유저 포인트 조회', () => {
    it('유저 포인트 조회 시, 정상적으로 DB 로직을 호출하는지 확인합니다.', async () => {
      // Given
      const userId = 1;

      // When
      await userPointRepository.getByUserId(userId);

      // Then
      expect(userPointTable.selectById).toHaveBeenCalledTimes(1);
      expect(userPointTable.selectById).toHaveBeenCalledWith(userId);
    });

    it('유효하지 않은 유저 아이디로 조회 시, 에러가 발생하는지 확인합니다.', async () => {
      // Given
      const userId = -1;
      jest.spyOn(userPointTable, 'selectById').mockRejectedValue(new Error('올바르지 않은 ID 값 입니다.'));

      // When
      const work = () => userPointRepository.getByUserId(userId);

      // Then
      expect(work).rejects.toThrow('올바르지 않은 ID 값 입니다.');
    });
  });

  describe('유저 포인트 추가/업데이트', () => {
    it('유저 포인트 추가/업데이트 시, 정상적으로 DB 로직을 호출하는지 확인합니다.', async () => {
      // Given
      const userId = 1;
      const amount = 1000;

      // When
      await userPointRepository.upsert(userId, amount);

      // Then
      expect(userPointTable.insertOrUpdate).toHaveBeenCalledTimes(1);
      expect(userPointTable.insertOrUpdate).toHaveBeenCalledWith(userId, amount);
    });

    it('유효하지 않은 유저 아이디로 추가/업데이트 시, 에러가 발생하는지 확인합니다.', async () => {
      // Given
      const userId = -1;
      const amount = 1000;
      jest.spyOn(userPointTable, 'insertOrUpdate').mockRejectedValue(new Error('올바르지 않은 ID 값 입니다.'));

      // When
      const work = () => userPointRepository.upsert(userId, amount);

      // Then
      expect(work).rejects.toThrow('올바르지 않은 ID 값 입니다.');
    });
  });
});
