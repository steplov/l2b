import { objectFlip } from '@shared/utils/object-flip';
import { AsteriosServer, TestServer } from '@shared/config';

export const asteriosServerRequestMap = {
  prime: AsteriosServer.Prime,
  medea: AsteriosServer.Medea,
  asterios: AsteriosServer.Asterios,
  hunter: AsteriosServer.Hunter,
};

export const asteriosServerResponseMap = objectFlip(asteriosServerRequestMap);

export const testServerRequestMap = {
  x1: TestServer.X1,
  x1000: TestServer.X1000,
};

export const testServerResponseMap = objectFlip(testServerRequestMap);

export const serverRequestMap = {
  ...asteriosServerRequestMap,
  ...testServerRequestMap,
};

export const serverResponseMap = {
  ...asteriosServerResponseMap,
  ...testServerResponseMap,
};
