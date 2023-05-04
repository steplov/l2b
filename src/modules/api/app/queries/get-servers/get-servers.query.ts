import { IQuery } from '@nestjs/cqrs';
import { Project } from '@shared/config';
import { projectRequestMap } from '../../../mappers/project-map';

export class GetServersQuery implements IQuery {
  readonly project: Project;

  constructor(props: GetServersQuery) {
    this.project = projectRequestMap[props.project];
  }
}
