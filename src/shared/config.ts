export enum RaidBoss {
  Cabrio = "Shilen's Messenger Cabrio",
  Golkonda = 'Longhorn Golkonda',
  Hallate = 'Death Lord Hallate',
  Kernon = 'Kernon',
}

export enum Project {
  Asterios = 'Asterios',
  Test = 'Test',
}

export enum AsteriosServer {
  Prime = 'Prime',
  Medea = 'Medea',
  Asterios = 'Asterios',
  Hunter = 'Hunter',
}

export enum TestServer {
  X1 = 'X1',
  X1000 = 'X1000',
}

export type ServerTuple = AsteriosServer | TestServer;

export const servers = {
  [Project.Asterios]: AsteriosServer,
  [Project.Test]: TestServer,
};

export const raidBossOrder = [
  RaidBoss.Cabrio,
  RaidBoss.Hallate,
  RaidBoss.Kernon,
  RaidBoss.Golkonda,
];
