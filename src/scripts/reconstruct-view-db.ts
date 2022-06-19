import { Script } from './script';
import { INestApplication } from '@nestjs/common';
import { ReconstructViewDb } from '@shared/libs/eventsourcing';

Script.run(async (app: INestApplication) => {
  await ReconstructViewDb.run(app);
});
