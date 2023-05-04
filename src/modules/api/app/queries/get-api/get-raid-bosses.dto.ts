import { ApiProperty } from '@nestjs/swagger';
import { GetRaidBosses } from '../../../interface-adapters/interfaces/get-raidbosses.interface';

export class GetRaidBossesRequest implements GetRaidBosses {
  @ApiProperty({ example: 'asterios', description: 'Project' })
  readonly project: string;

  @ApiProperty({ example: 'phoenix', description: 'Server' })
  readonly server: string;
}

export class GetRaidBossesHttpRequest
  extends GetRaidBossesRequest
  implements GetRaidBosses {}
