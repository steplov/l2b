import { AsteriosServer } from '@shared/config';

export const serverId: Partial<Record<AsteriosServer, string>> = {
  [AsteriosServer.Asterios]: '0',
  [AsteriosServer.Hunter]: '2',
  [AsteriosServer.Prime]: '3',
  [AsteriosServer.Medea]: '6',
};
