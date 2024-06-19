import { BadRequestException } from '@nestjs/common';

export class UserPointDomain {
  constructor(
    public id: number,
    public point: number,
    public updateMillis: number,
  ) {}

  charge(amount: number): void {
    this.validateAmount(amount);

    this.point += amount;
  }

  use(amount: number): void {
    this.validateAmount(amount);

    if (amount > this.point) {
      throw new BadRequestException('사용 가능한 포인트가 부족합니다.');
    }

    this.point -= amount;
  }

  validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('포인트는 0보다 커야 합니다.');
    }
  }
}
