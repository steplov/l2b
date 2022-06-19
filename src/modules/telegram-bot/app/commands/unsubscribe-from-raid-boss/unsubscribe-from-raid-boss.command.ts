import { Command } from '@shared/domain/base-classes';
import { Project, ServerTuple, RaidBoss } from '@shared/config';

export class UnsubscribeFromRaidBoss extends Command {
  public readonly userId: string;
  public readonly project: Project;
  public readonly server: ServerTuple;
  public readonly raidBoss: RaidBoss;

  constructor(props: UnsubscribeFromRaidBoss) {
    super(props);

    this.userId = props.userId;
    this.project = props.project;
    this.server = props.server;
    this.raidBoss = props.raidBoss;
  }
}
