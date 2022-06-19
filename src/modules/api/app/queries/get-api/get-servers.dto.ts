import { ApiProperty } from '@nestjs/swagger';
import { GetServers } from '../../../interface-adapters/interfaces/get-servers.interface';

export class GetServersRequest implements GetServers {
  @ApiProperty({ example: 'asterios', description: 'Project' })
  readonly project: string;
}

export class GetServersHttpRequest
  extends GetServersRequest
  implements GetServers {}
