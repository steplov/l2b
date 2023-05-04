import { ApiProperty } from '@nestjs/swagger';

export class CalculatorApiQueryDto {
  @ApiProperty({ example: 40, description: 'From level' })
  readonly from: number;

  @ApiProperty({ example: 76, description: 'To level' })
  readonly to: number;
}
