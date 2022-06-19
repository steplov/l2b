import { ApiProperty } from '@nestjs/swagger';
import { GetRaidBosses } from '../../../interface-adapters/interfaces/get-raidbosses.interface';
import { raidBossRequestMap } from '../../../mappers/raid-boss.map';

export class GetRaidBossRequest implements GetRaidBosses {
  @ApiProperty({ example: 'asterios', description: 'Project' })
  readonly project: string;

  @ApiProperty({ example: 'phoenix', description: 'Server' })
  readonly server: string;

  @ApiProperty({
    example: 'kernon',
    description: `Raid boss. Values: ${Object.keys(raidBossRequestMap).join(
      ', ',
    )}`,
  })
  readonly raidBoss: string;
}

export class GetRaidBossHttpRequest
  extends GetRaidBossRequest
  implements GetRaidBosses {}
