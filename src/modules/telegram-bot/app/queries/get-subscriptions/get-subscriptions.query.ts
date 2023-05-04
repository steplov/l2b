import { Query } from '@shared/domain/base-classes';

export class GetSubscriptions extends Query {
  public readonly userId: string;

  constructor(props: GetSubscriptions) {
    super(props);

    this.userId = props.userId;
  }
}
