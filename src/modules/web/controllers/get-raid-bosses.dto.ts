import { ApiProperty } from '@nestjs/swagger';
import { GetRaidBosses } from '@modules/api/interface-adapters/interfaces/get-raidbosses.interface';

export class GetRaidBossesRequest implements GetRaidBosses {
  @ApiProperty({ example: 'asterios', description: 'Project' })
  readonly project: string;

  @ApiProperty({ example: 'phoenix', description: 'Server' })
  readonly server: string;

  @ApiProperty({ example: 'en, ua', description: 'Widget language' })
  readonly lang: string;
}

export class GetRaidBossesHttpRequest
  extends GetRaidBossesRequest
  implements GetRaidBosses {}
