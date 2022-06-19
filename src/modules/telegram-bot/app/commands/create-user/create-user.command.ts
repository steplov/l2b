import { Command } from '@shared/domain/base-classes';

export class CreateUser extends Command {
  public readonly id: string;
  public readonly languageCode: string;

  constructor(props: CreateUser) {
    super(props);

    this.id = props.id;
    this.languageCode = props.languageCode;
  }
}
