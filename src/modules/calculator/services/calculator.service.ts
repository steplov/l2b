import { Injectable } from '@nestjs/common';
import { calculator } from '@shared/config';

export interface CalcConfig {
  price: Record<string, number>;
}

@Injectable()
export class CalculatorService {
  price = new Map<number, number>();

  constructor() {
    this.parsePrice(calculator);
  }

  parsePrice(config: CalcConfig) {
    Object.entries(config.price).forEach(([key, value]) => {
      const range = key.split('-');
      const from = parseInt(range[0], 10);
      const to = parseInt(range[1], 10) || from;

      if (typeof from !== 'number' || typeof to !== 'number') {
        throw new Error(`Wrong level range = ${range}`);
      }

      if (from === to) {
        this.price.set(from, Math.ceil(value));
      } else {
        for (let i = from; i < to; i++) {
          const price = Math.ceil(value / (to - from));
          this.price.set(i, price);
        }
      }
    });
  }

  checkRange(from: number, to: number) {
    return this.price.has(from) && this.price.has(to - 1);
  }

  calculate(from: number, to: number) {
    if (to < from) {
      return 0;
    }

    let totalPrice = 0;

    for (let level = from; level < to; level++) {
      if (this.price.has(level)) {
        totalPrice = totalPrice + this.price.get(level)!;
      }
    }

    return totalPrice;
  }
}
