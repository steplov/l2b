import { Injectable } from '@nestjs/common';
import { EventStore } from '@shared/libs/eventsourcing';
import { TelegramUserAggregate } from '../../domain/entities/telegram-user.aggregate';

@Injectable()
export class UserRepository {
  constructor(private readonly eventStore: EventStore) {}

  async findOneById(id: string): Promise<TelegramUserAggregate> {
    const telegramUserAggregate = new TelegramUserAggregate(
      {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        languageCode: 'en',
        subscriptions: [],
      },
      id,
    );

    const events = await this.eventStore.getEvents('telegramUser', id);

    telegramUserAggregate.loadFromHistory(events.events);

    return telegramUserAggregate;
  }
}
