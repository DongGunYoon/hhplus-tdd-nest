import { BadRequestException } from '@nestjs/common';
import { UserPointDomain } from './user-point.domain';

describe('UserPointDomain', () => {
  describe('포인트를 충전합니다.', () => {
    it('유효한 값들로 충전을 시도하면 정상적으로 포인트가 충전됩니다.', () => {
      // Given
      const userPoint = new UserPointDomain(1, 100, Date.now());
      const amount = 50;

      // When
      userPoint.charge(amount);

      // Then
      expect(userPoint.point).toBe(150);
    });

    it('유효하지 않은 포인트로 충전을 시도하면 에러가 발생합니다.', () => {
      // Given
      const userPoint = new UserPointDomain(1, 100, Date.now());
      const amount = -50;

      // When
      const charge = () => userPoint.charge(amount);

      // Then
      try {
        charge();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('포인트는 0보다 커야 합니다.');
      }
    });
  });

  describe('포인트를 사용합니다.', () => {
    it('유효한 값들로 사용을 시도하면 정상적으로 포인트가 차감됩니다.', () => {
      // Given
      const userPoint = new UserPointDomain(1, 100, Date.now());
      const amount = 50;

      // When
      userPoint.use(amount);

      // Then
      expect(userPoint.point).toBe(50);
    });

    it('유효하지 않은 포인트로 사용을 시도하면 에러가 발생합니다.', () => {
      // Given
      const userPoint = new UserPointDomain(1, 100, Date.now());
      const amount = -50;

      // When
      const use = () => userPoint.use(amount);

      // Then
      try {
        use();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('포인트는 0보다 커야 합니다.');
      }
    });

    it('현재 보유한 포인트보다 더 많은 포인트 사용을 시도하면 에러가 발생합니다.', () => {
      // Given
      const userPoint = new UserPointDomain(1, 100, Date.now());
      const excessiveAmount = 150;

      // When
      const use = () => userPoint.use(excessiveAmount);

      // Then
      try {
        use();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('사용 가능한 포인트가 부족합니다.');
      }
    });
  });
});
