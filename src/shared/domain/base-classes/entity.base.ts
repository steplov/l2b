import {
  ArgumentNotProvidedException,
  ArgumentInvalidException,
  ArgumentOutOfRangeException,
} from '../../exceptions';
import { UUID } from '../value-objects';
import { convertPropsToObject } from '../utils';
import { Guard } from '../guard';

export interface BaseEntityProps {
  id: string;
}

export abstract class Entity<EntityProps> {
  protected readonly _id: string;
  protected readonly props: EntityProps;

  constructor(props: EntityProps, id?: string) {
    this._id = id ? id : UUID.generate().value;
    this.validateProps(props);
    this.props = props;
    this.validate();
  }

  get id(): string {
    return this._id;
  }

  static isEntity(entity: unknown): entity is Entity<unknown> {
    return entity instanceof Entity;
  }

  abstract validate(): void;

  equals(object?: Entity<EntityProps>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!Entity.isEntity(object)) {
      return false;
    }

    return this._id === object._id;
  }

  /**
   * Convert an Entity and all sub-entities/Value Objects it
   * contains to a plain object with primitive types. Can be
   * useful when logging an entity during testing/debugging
   */
  toObject(): unknown {
    const plainProps = convertPropsToObject(this.props);

    const result = {
      id: this._id,
      ...plainProps,
    };
    return Object.freeze(result);
  }

  private validateProps(props: EntityProps): void {
    const maxProps = 50;

    const guardResult = Guard.againstNullOrUndefined(props, 'props');

    if (!guardResult.succeeded) {
      throw new ArgumentNotProvidedException(guardResult.message);
    }
    if (typeof props !== 'object') {
      throw new ArgumentInvalidException('Entity props should be an object');
    }
    if (Object.keys(props).length > maxProps) {
      throw new ArgumentOutOfRangeException(
        `Entity props should not have more than ${maxProps} properties`,
      );
    }
  }
}
