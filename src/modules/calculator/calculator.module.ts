import { Module } from '@nestjs/common';
import { CalculatorController } from './app/calculator.controller';
import { CalculatorService } from './services/calculator.service';

@Module({
  controllers: [CalculatorController],
  providers: [CalculatorService],
  exports: [CalculatorService],
})
export class CalculatorModule {}
