import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { PointModule } from '../src/point/point.module';
import { PointHistory, UserPoint } from '../src/point/model/point.model';
import { PointService } from '../src/point/service/point.service';
import { pointServiceSymbol } from '../src/point/service/point.service.impl';

describe('PointController (e2e)', () => {
  let app: INestApplication;
  let pointService: PointService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [PointModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    pointService = module.get<PointService>(pointServiceSymbol);
  });

  describe('특정 유저 포인트 조회 - GET /point/:id', () => {
    it('입력된 아이디와 일치하는 회원의 포인트를 조회한다. (200)', async () => {
      // Given
      const userId = 1;

      // When
      const result = await request(app.getHttpServer())
        .get(`/point/${userId}`)
        .expect(200)
        .then(res => res.body);

      // Then
      const response: UserPoint = result;

      expect(response.id).toBe(userId);
      expect(response.point).toBeGreaterThanOrEqual(0);
    });

    it('입력된 아이디가 정수가 아니라면 Bad Request 에러가 발생한다. (400)', async () => {
      // Given
      const userId = 'text';

      // When
      const result = await request(app.getHttpServer())
        .get(`/point/${userId}`)
        .expect(400)
        .then(res => res.body);

      // Then
      const response: { error: string; statusCode: number } = result;

      expect(response.error).toBe('Bad Request');
      expect(response.statusCode).toBe(400);
    });
  });

  describe('특정 유저 포인트 충전/이용 내역 조회 - GET /point/:id/histories', () => {
    it('회원의 포인트 충전/이용 내역이 없다면 빈 배열을 반환합니다. (200)', async () => {
      // Given
      const userId = 1;

      // When
      const result = await request(app.getHttpServer())
        .get(`/point/${userId}/histories`)
        .expect(200)
        .then(res => res.body);

      // Then
      const response: PointHistory[] = result;

      expect(response.length).toBe(0);
    });

    it('회원의 포인트 충전/이용 내역이 있다면 해당 목록을 반환합니다. (200)', async () => {
      // Given
      const userId = 1;
      await pointService.charge(1, 100);
      await pointService.use(1, 100);

      // When
      const result = await request(app.getHttpServer())
        .get(`/point/${userId}/histories`)
        .expect(200)
        .then(res => res.body);

      // Then
      const response: PointHistory[] = result;

      expect(response.length).toBe(2);
    });
  });

  describe('특정 유저 포인트 충전 - PATCH /point/:id/charge', () => {
    it('회원의 포인트가 없었다면 0원에서 증가합니다. (200)', async () => {
      // Given
      const userId = 1;
      const chargeAmount = 100;

      // When
      const result = await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send({ amount: chargeAmount })
        .expect(200)
        .then(res => res.body);

      // Then
      const response: UserPoint = result;

      expect(response.id).toBe(userId);
      expect(response.point).toBe(chargeAmount);
    });

    it('회원의 포인트 있었다면 해당 포인트에서 증가합니다. (200)', async () => {
      // Given
      const userId = 1;
      const prevAmount = 1000;
      const chargeAmount = 100;
      await pointService.charge(userId, prevAmount);

      // When
      const result = await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send({ amount: chargeAmount })
        .expect(200)
        .then(res => res.body);

      // Then
      const response: UserPoint = result;

      expect(response.id).toBe(userId);
      expect(response.point).toBe(prevAmount + chargeAmount);
    });
  });

  describe('특정 유저 포인트 사용 - PATCH /point/:id/use', () => {
    it('회원의 포인트가 충분하다면 사용한 포인트만큼 차감합니다. (200)', async () => {
      // Given
      const userId = 1;
      const prevAmount = 1000;
      const useAmount = 100;
      await pointService.charge(userId, prevAmount);

      // When
      const result = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send({ amount: useAmount })
        .expect(200)
        .then(res => res.body);

      // Then
      const response: UserPoint = result;

      expect(response.id).toBe(userId);
      expect(response.point).toBe(prevAmount - useAmount);
    });

    it('회원의 포인트 모자르면 에러가 발생합니다. (400)', async () => {
      // Given
      const userId = 1;
      const useAmount = 100;

      // When
      const result = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send({ amount: useAmount })
        .expect(400)
        .then(res => res.body);

      // Then
      const response: { message: string; statusCode: number } = result;
      expect(response.statusCode).toBe(400);
      expect(response.message).toBe('사용 가능한 포인트가 부족합니다.');
    });
  });
});
