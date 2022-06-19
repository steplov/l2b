import { Query, QueryProps } from '@shared/domain/base-classes';
import { Project, ServerTuple, RaidBoss } from '@shared/config';

export class GetRaidBoss extends Query {
  public readonly project: Project;
  public readonly server: ServerTuple;
  public readonly raidBoss: RaidBoss;

  constructor(props: QueryProps<GetRaidBoss>) {
    super(props);

    this.project = props.project;
    this.server = props.server;
    this.raidBoss = props.raidBoss;
  }
}
