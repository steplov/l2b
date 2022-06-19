import { Command, CommandProps } from '@shared/domain/base-classes';

export class Notify extends Command {
  public readonly userId: string;
  public readonly message: string;

  constructor(props: CommandProps<Notify>) {
    super(props);

    this.userId = props.userId;
    this.message = props.message;
  }
}
