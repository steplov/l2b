import { BaseEntityProps } from '@shared/domain/base-classes/entity.base';
import { IdResponse } from '../dtos/id.response.dto';

export class ResponseBase extends IdResponse {
  constructor(entity: BaseEntityProps) {
    super(entity.id);
  }
}
