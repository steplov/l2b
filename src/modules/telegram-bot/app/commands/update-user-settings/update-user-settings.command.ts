import { Command, CommandProps } from '@shared/domain/base-classes';

export class UpdateUserSettings extends Command {
  public readonly userId: string;
  public readonly languageCode: string;

  constructor(props: CommandProps<UpdateUserSettings>) {
    super(props);

    this.userId = props.userId;
    this.languageCode = props.languageCode;
  }
}
