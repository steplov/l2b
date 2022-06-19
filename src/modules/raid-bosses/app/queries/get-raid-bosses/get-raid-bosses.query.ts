import { Query, QueryProps } from '@shared/domain/base-classes';
import { Project, ServerTuple } from '@shared/config';

export class GetRaidBosses extends Query {
  public readonly project?: Project;
  public readonly server?: ServerTuple;

  constructor(props: QueryProps<GetRaidBosses>) {
    super(props);

    this.project = props.project;
    this.server = props.server;
  }
}
