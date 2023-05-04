import { Project } from '@shared/config';

export class IndexPageDto {
  readonly projects: { title: string; url: string }[];

  constructor(readonly title: string) {
    this.projects = [
      {
        url: '/asterios',
        title: Project.Asterios,
      },
    ];
  }
}
