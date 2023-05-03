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
  Pride = 'Pride',
}

export const serverId: Partial<Record<AsteriosServer, string>> = {
  [AsteriosServer.Asterios]: '0',
  [AsteriosServer.Hunter]: '2',
  [AsteriosServer.Prime]: '3',
  [AsteriosServer.Medea]: '6',
  [AsteriosServer.Pride]: '7',
};

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

export const calculator = {
  price: {
    '25-40': 100,
    '40-50': 100,
    '50-60': 150,
    '60-70': 250,
    '70-75': 250,
    '75-76': 100,
  },
};
