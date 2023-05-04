import { Command, CommandProps } from '@shared/domain/base-classes';

export class GenerateConfig extends Command {
  constructor(props: CommandProps<GenerateConfig>) {
    super(props);
  }
}
