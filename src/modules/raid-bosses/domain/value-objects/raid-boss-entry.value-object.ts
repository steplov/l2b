import { ValueObject } from '@shared/domain/base-classes/value-object.base';
import { Guard } from '@shared/domain/guard';
import {
  ArgumentInvalidException,
  ArgumentNotProvidedException,
} from '@shared/exceptions';
import { Project, ServerTuple, servers, RaidBoss } from '@shared/config';

export interface RaidBossEntryProps {
  id: string;
  project: Project;
  server: ServerTuple;
  raidBoss: RaidBoss;
}

export class RaidBossEntry extends ValueObject<RaidBossEntryProps> {
  get project(): Project {
    return this.props.project;
  }

  get server(): ServerTuple {
    return this.props.server;
  }

  get id(): string {
    return this.props.id;
  }

  get raidBoss(): RaidBoss {
    return this.props.raidBoss;
  }

  protected validate(props: RaidBossEntryProps): void {
    const nullCheck = Guard.againstNullOrUndefinedBulk([
      { argument: props.project, argumentName: 'props.project' },
      { argument: props.server, argumentName: 'props.server' },
      { argument: props.id, argumentName: 'props.id' },
      { argument: props.raidBoss, argumentName: 'props.raidBoss' },
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
