import { objectFlip } from '@shared/utils/object-flip';
import { Project } from '@shared/config';

export const projectRequestMap = {
  asterios: Project.Asterios,
  test: Project.Test,
};

export const projectResponseMap = objectFlip(projectRequestMap);
