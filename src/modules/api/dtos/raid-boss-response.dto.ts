import { ApiProperty } from '@nestjs/swagger';
import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { ResponseBase } from '../interface-adapters/base-classes/response.base';

export class RaidBossResponse extends ResponseBase {
  @ApiProperty({
    example: '2022-03-08T03:29:02.000Z',
    description: 'Date when raid boss was killed',
  })
  date: string;

  @ApiProperty({
    example: 'asterios',
    description: 'Lineage 2 server name',
  })
  server: string;

  @ApiProperty({
    example: 'Kernon',
    description: 'Raid boss name',
  })
  raidBoss: string;

  @ApiProperty({
    example: '2022-03-08T03:29:02.000Z',
    description: 'Respawn start',
  })
  min: string;

  @ApiProperty({
    example: '2022-03-08T03:29:02.000Z',
    description: 'Respawn end',
  })
  max: string;

  @ApiProperty({
    example: '03:29:02',
    description: 'Hours to respawn',
  })
  startsIn: string;

  @ApiProperty({
    example: '03:29:02',
    description: 'Respawn left',
  })
  left: string;

  @ApiProperty({
    example: '03:29:02',
    description: 'Respawn duration',
  })
  duration: string;

  constructor(raidBoss: RaidBossDto) {
    super(raidBoss);

    this.date = raidBoss.killDate.toISOString();
    this.server = raidBoss.server;
    this.raidBoss = raidBoss.raidBoss;
    this.min = raidBoss.min.toISOString();
    this.max = raidBoss.max.toISOString();
    this.startsIn = raidBoss.startsIn;
    this.left = raidBoss.respawnLeft;
    this.duration = raidBoss.respawnDuration;
  }
}

export class RaidBossHttpResponse extends RaidBossResponse {}
