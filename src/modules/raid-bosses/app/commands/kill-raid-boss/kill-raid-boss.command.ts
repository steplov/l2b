import { Command, CommandProps } from '@shared/domain/base-classes';
import { Project, ServerTuple, RaidBoss } from '@shared/config';

export class KillRaidBoss extends Command {
  public readonly project: Project;
  public readonly server: ServerTuple;
  public readonly raidBoss: RaidBoss;
  public readonly killDate: Date;

  constructor(props: CommandProps<KillRaidBoss>) {
    super(props);

    this.project = props.project;
    this.server = props.server;
    this.raidBoss = props.raidBoss;
    this.killDate = props.killDate;
  }
}
