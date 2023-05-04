import { ApiProperty } from '@nestjs/swagger';

export class ServersResponse {
  @ApiProperty({
    example: '[asterios, phoenix]',
    description: 'Available servers for current project',
  })
  servers: string[];

  constructor(servers: string[]) {
    this.servers = servers;
  }
}

export class ServersHttpResponse extends ServersResponse {}
