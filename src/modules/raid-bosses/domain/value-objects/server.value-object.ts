import { ValueObject } from '@shared/domain/base-classes/value-object.base';
import { Guard } from '@shared/domain/guard';
import {
  ArgumentInvalidException,
  ArgumentNotProvidedException,
} from '@shared/exceptions';
import { Project, ServerTuple, servers } from '@shared/config';

export interface ServerProps {
  project: Project;
  server: ServerTuple;
}

export class Server extends ValueObject<ServerProps> {
  get project(): string {
    return this.props.project;
  }

  get server(): string {
    return this.props.server;
  }

  protected validate(props: ServerProps): void {
    const nullCheck = Guard.againstNullOrUndefinedBulk([
      { argument: props.project, argumentName: 'props.project' },
      { argument: props.server, argumentName: 'props.server' },
    ]);

    if (!nullCheck.succeeded) {
      throw new ArgumentNotProvidedException(nullCheck.message);
    }

    const serverBelongsToProject = Guard.isOneOf(
      props.server,
      Object.values(servers[props.project]),
      `Project ${props.project} doesn't have ${props.server} server`,
    );

    if (!serverBelongsToProject.succeeded) {
      throw new ArgumentInvalidException(serverBelongsToProject.message);
    }
  }
}
