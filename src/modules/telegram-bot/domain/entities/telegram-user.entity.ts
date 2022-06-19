import { ArgumentInvalidException } from '@shared/exceptions';
import { Entity } from '@shared/domain/base-classes';
import { Guard } from '@shared/domain/guard';

export interface TelegramUserEntityProps {
  languageCode: string;
  subscriptions: string[];
}

export class TelegramUserEntity extends Entity<TelegramUserEntityProps> {
  constructor(props: TelegramUserEntityProps, id?: string) {
    super(props, id);
  }

  get userId() {
    return parseInt(this.id, 10);
  }

  get languageCode() {
    return this.props.languageCode;
  }

  get subscriptions() {
    return this.props.subscriptions;
  }

  validate(): void {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: this.props.languageCode, argumentName: 'languageCode' },
    ]);

    if (!guardResult.succeeded) {
      throw new ArgumentInvalidException(guardResult.message);
    }
  }
}
