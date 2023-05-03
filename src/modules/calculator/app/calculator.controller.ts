import { Controller, Get, Post, Body, Render } from '@nestjs/common';
import { routesV1 } from '@configs/app.routes';
import { CalculatorService } from '../services/calculator.service';
import { CalculatorApiQueryDto } from './calculator.dto';

@Controller()
export class CalculatorController {
  constructor(private calculator: CalculatorService) {}

  @Get(routesV1.web.calculator)
  @Render('calculator')
  public index() {
    return {};
  }

  @Post(routesV1.api.calculator)
  public async api(@Body() query: CalculatorApiQueryDto): Promise<any> {
    const { from, to } = query;

    const validRange = this.calculator.checkRange(from, to);

    if (!validRange) {
      return {
        error: 'Levels are out of range',
      };
    }

    const price = this.calculator.calculate(from, to);

    return {
      price,
    };
  }
}
