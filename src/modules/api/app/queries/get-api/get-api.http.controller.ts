import {
  Controller,
  Get,
  HttpStatus,
  Param,
  HttpException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { routesV1 } from '@configs/app.routes';
import { Result } from '@shared/domain/utils';
import { GetRaidBoss } from '@modules/raid-bosses/app/queries/get-raid-boss/get-raid-boss.query';
import { GetRaidBosses } from '@modules/raid-bosses/app/queries/get-raid-bosses/get-raid-bosses.query';
import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { GetServersQuery } from '../get-servers/get-servers.query';
import { GetProjectsQuery } from '../get-projects/get-projects.query';
import { projectRequestMap } from '../../../mappers/project-map';
import { serverRequestMap } from '../../../mappers/server-map';
import { raidBossRequestMap } from '../../../mappers/raid-boss.map';
import { RaidBossHttpResponse } from '../../../dtos/raid-boss-response.dto';
import { ServersHttpResponse } from '../../../dtos/servers-response.dto';
import { ProjectsHttpResponse } from '../../../dtos/projects-response.dto';
import { GetRaidBossesHttpRequest } from './get-raid-bosses.dto';
import { GetRaidBossHttpRequest } from './get-raid-boss.dto';
import { GetServersHttpRequest } from './get-servers.dto';

@Controller(routesV1.version)
export class GetApiHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(routesV1.api.root)
  @ApiOperation({ summary: 'Get projects' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ProjectsHttpResponse,
  })
  async getProjects(): Promise<ProjectsHttpResponse> {
    const query = new GetProjectsQuery();
    const result: Result<string[]> = await this.queryBus.execute(query);

    return new ProjectsHttpResponse(result.getValue());
  }

  @Get(routesV1.api.servers)
  @ApiOperation({ summary: 'Get available servers for specific project' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ServersHttpResponse,
  })
  async getServers(
    @Param() request: GetServersHttpRequest,
  ): Promise<ServersHttpResponse> {
    const query = new GetServersQuery({ project: request.project } as any);
    const result: Result<string[]> = await this.queryBus.execute(query);

    return new ServersHttpResponse(result.getValue());
  }

  @Get(routesV1.api.server)
  @ApiOperation({ summary: 'Get Raid bosses for specific server' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RaidBossHttpResponse],
  })
  async getServer(
    @Param() request: GetRaidBossesHttpRequest,
  ): Promise<RaidBossHttpResponse[]> {
    const query = new GetRaidBosses({
      project: projectRequestMap[request.project],
      server: serverRequestMap[request.server],
    });
    const result: Result<RaidBossDto[]> = await this.queryBus.execute(query);

    return result.getValue().map((event) => new RaidBossHttpResponse(event));
  }

  @Get(routesV1.api.boss)
  @ApiOperation({ summary: 'Get Raid boss for specific server' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RaidBossHttpResponse],
  })
  async getBoss(
    @Param() request: GetRaidBossHttpRequest,
  ): Promise<RaidBossHttpResponse | any> {
    const project = projectRequestMap[request.project];
    const server = serverRequestMap[request.server];
    const raidBoss = raidBossRequestMap[request.raidBoss];

    if (!project)
      throw new HttpException(
        `Invalid argument ${request.project}`,
        HttpStatus.BAD_REQUEST,
      );
    if (!server)
      throw new HttpException(
        `Invalid argument ${request.server}`,
        HttpStatus.BAD_REQUEST,
      );
    if (!raidBoss)
      throw new HttpException(
        `Invalid argument ${request.raidBoss}`,
        HttpStatus.BAD_REQUEST,
      );

    const query = new GetRaidBoss({ project, server, raidBoss });
    const result: Result<RaidBossDto, string> = await this.queryBus.execute(
      query,
    );

    if (result.isFailure) {
      throw new HttpException(result.errorValue(), HttpStatus.BAD_REQUEST);
    }

    return new RaidBossHttpResponse(result.getValue());
  }
}
