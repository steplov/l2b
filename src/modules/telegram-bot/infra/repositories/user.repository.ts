import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserSchema } from '../schemas/user.schema';
import { UserReadDto } from '../dto/user-read.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userReadModel: Model<UserDocument>,
  ) {}

  async findUsers() {
    return await this.userReadModel.find().exec();
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
  MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'l2b');
