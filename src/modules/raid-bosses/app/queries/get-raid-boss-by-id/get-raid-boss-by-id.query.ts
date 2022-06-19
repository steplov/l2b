import { Query, QueryProps } from '@shared/domain/base-classes';

export class GetRaidBossById extends Query {
  public readonly raidBossId: string;

  constructor(props: QueryProps<GetRaidBossById>) {
    super(props);

    this.raidBossId = props.raidBossId;
  }
}
