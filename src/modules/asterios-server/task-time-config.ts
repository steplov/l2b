import { AsteriosServer } from '@shared/config';

const serverCount = Object.keys(AsteriosServer).length;

const rawInterval = 3000;

export const gap = 3000;
export const interval = serverCount * gap + rawInterval;
