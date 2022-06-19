import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { BotUpdate } from '../../../bot/bot.update';
import { Notify } from './notify.command';

@CommandHandler(Notify)
export class NotifyHandler implements ICommandHandler<Notify> {
  private readonly logger = new Logger(Notify.name);

  constructor(private readonly bot: BotUpdate) {}

  async execute(command: Notify) {
    this.logger.debug(`Notify: ${JSON.stringify(command)}`);

    this.bot.notifyUser(command.userId, command.message);

    return Result.ok('ok');
  }
}
