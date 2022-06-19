import { IQuery } from '@nestjs/cqrs';
import { ArgumentNotProvidedException } from '../../exceptions';
import { Guard } from '../guard';

export type QueryProps<T> = Omit<T, 'id'> & Partial<Query>;

export class Query implements IQuery {
  constructor(props: QueryProps<unknown>) {
    const guard = Guard.againstNullOrUndefined(props, 'props');

    if (!guard.succeeded) {
      throw new ArgumentNotProvidedException(guard.message);
    }
  }
}
