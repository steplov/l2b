import { ValueObject } from '@shared/domain/base-classes/value-object.base';
import { Guard } from '@shared/domain/guard';
import { ArgumentNotProvidedException } from '@shared/exceptions';

export interface RespawnProps {
  killDate: Date;
  min: Date;
  max: Date;
}

export class Respawn extends ValueObject<RespawnProps> {
  get killDate(): Date {
    return this.props.killDate;
  }

  get min(): Date {
    return this.props.min;
  }

  get max(): Date {
    return this.props.max;
  }

  protected validate(props: RespawnProps): void {
    const nullCheck = Guard.againstNullOrUndefinedBulk([
      { argument: props.min, argumentName: 'props.min' },
      { argument: props.max, argumentName: 'props.max' },
      { argument: props.killDate, argumentName: 'props.killDate' },
    ]);

    if (!nullCheck.succeeded) {
      throw new ArgumentNotProvidedException(nullCheck.message);
    }
  }
}
