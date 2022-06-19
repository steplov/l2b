import { ApiProperty } from '@nestjs/swagger';

export class ProjectsResponse {
  @ApiProperty({
    example: '[asterios, test]',
    description: 'Available projects',
  })
  projects: string[];

  constructor(projects: string[]) {
    this.projects = projects;
  }
}

export class ProjectsHttpResponse extends ProjectsResponse {}
