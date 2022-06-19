import { ArgumentNotProvidedException } from '../../exceptions';
import { Guard } from '../guard';

export type CommandProps<T> = Omit<T, 'id'> & Partial<Command>;

export class Command {
  constructor(props: CommandProps<unknown>) {
    const guard = Guard.againstNullOrUndefined(props, 'props');

    if (!guard.succeeded) {
      throw new ArgumentNotProvidedException(guard.message);
    }
  }
}
