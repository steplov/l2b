import { Event } from '@shared/domain/base-classes/event';

export class UserSettingsUpdated extends Event {
  constructor(
    public readonly id: string,
    public readonly languageCode: string,
  ) {
    super();
  }
}
