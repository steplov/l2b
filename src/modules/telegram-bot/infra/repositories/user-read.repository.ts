import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventStore } from '@shared/libs/eventsourcing';
import {
  UserRead,
  UserReadDocument,
  UserReadSchema,
} from '../schemas/user-read.schema';
import { UserReadDto } from '../dto/user-read.dto';

@Injectable()
export class UserReadRepository {
  constructor(
    private readonly eventStore: EventStore,
    @InjectModel(UserRead.name)
    private readonly userReadModel: Model<UserReadDocument>,
  ) {}

  async findUsers() {
    return await this.userReadModel.find().exec()
  }

  async findUserById(id: string): Promise<UserReadDto> {
    return await this.userReadModel.findOne({ _id: id }).exec();
  }

  async findUsersByRaidBossId(raidBossId: string): Promise<UserReadDto[]> {
    return await this.userReadModel.find({ subscriptions: raidBossId }).exec();
  }

  async saveUser(userReadDto: UserReadDto) {
    const _id = userReadDto._id;
    const userRaw = await this.userReadModel.findOne({ _id }).exec();

    if (!!userRaw) {
      await this.userReadModel.updateOne({ _id }, userReadDto, {
        new: true,
      });
    } else {
      await this.userReadModel.create(userReadDto);
    }
  }
}

export const getUserReadRepositoryConnection = () =>
  MongooseModule.forFeature(
    [{ name: UserRead.name, schema: UserReadSchema }],
    'read',
  );
