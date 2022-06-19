import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly config: ConfigService,
    ) {
        super({
            passReqToCallback: true
        });
    }

    public validate = async (req, username, password): Promise<boolean> => {
      if (
          this.config.get<string>('basicAuth.user') === username &&
          this.config.get<string>('basicAuth.pass') === password
      ) {
          return true;
      }
      throw new UnauthorizedException();
    }
}