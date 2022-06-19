import { Scenes } from 'telegraf';
import { TelegrafGA4 } from '@shared/libs/tga4';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Context extends Scenes.SceneContext {
  ga4: TelegrafGA4
}
