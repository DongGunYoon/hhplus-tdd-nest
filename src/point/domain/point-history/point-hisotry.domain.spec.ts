import { BadRequestException } from '@nestjs/common';
import { PointHistoryDomain } from './point-history.domain';
import { TransactionType } from '../../model/point.model';

describe('PointHistoryDomain', () => {
  describe('포인트 내역을 생성합니다.', () => {
    it('유효한 값들이 parameter로 들어오면 정상적으로 생성합니다.', () => {
      // Given
      const userId = 1;
      const amount = 100;
      const transactionType = TransactionType.CHARGE;
      const timeMillis = Date.now();

      // When
      const pointHistory = PointHistoryDomain.create(userId, amount, transactionType, timeMillis);

      // Then
      expect(pointHistory).toBeInstanceOf(PointHistoryDomain);
      expect(pointHistory.userId).toBe(userId);
      expect(pointHistory.amount).toBe(amount);
      expect(pointHistory.type).toBe(transactionType);
      expect(pointHistory.timeMillis).toBe(timeMillis);
    });

    it('유효하지 않은 id로 생성을 시도하면 에러가 발생합니다.', () => {
      // Given
      const invalidUserId = -1;
      const amount = 100;
      const transactionType = TransactionType.CHARGE;
      const timeMillis = Date.now();

      // When
      const create = () => PointHistoryDomain.create(invalidUserId, amount, transactionType, timeMillis);

      // Then
      try {
        create();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('올바르지 않은 ID 값 입니다.');
      }
    });

    it('유효하지 않은 amount로 생성을 시도하면 에러가 발생합니다.', () => {
      // Given
      const invalidUserId = 1;
      const amount = -100;
      const transactionType = TransactionType.CHARGE;
      const timeMillis = Date.now();

      // When
      const create = () => PointHistoryDomain.create(invalidUserId, amount, transactionType, timeMillis);

      // Then
      try {
        create();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('포인트는 0보다 커야 합니다.');
      }
    });

    it('유효하지 않은 시간 정보로 생성을 시도하면 에러가 발생합니다.', () => {
      // Given
      const invalidUserId = 1;
      const amount = 100;
      const transactionType = TransactionType.CHARGE;
      const timeMillis = -Date.now();

      // When
      const create = () => PointHistoryDomain.create(invalidUserId, amount, transactionType, timeMillis);

      // Then
      try {
        create();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('올바르지 않은 시간 정보입니다.');
      }
    });
  });
});
