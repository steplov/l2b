import { Query, QueryProps } from '@shared/domain/base-classes';
import { Project, RaidBoss, ServerTuple } from '@shared/config';

export class GetRaidBossesConfig extends Query {
  public readonly project?: Project;
  public readonly server?: ServerTuple;
  public readonly raidBoss?: RaidBoss;

  constructor(props: QueryProps<GetRaidBossesConfig>) {
    super(props);

    this.project = props.project;
    this.server = props.server;
    this.raidBoss = props.raidBoss;
  }
}
