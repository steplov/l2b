import { Query } from '@shared/domain/base-classes';

export class GetUser extends Query {
  public readonly userId: string;

  constructor(props: GetUser) {
    super(props);

    this.userId = props.userId;
  }
}
