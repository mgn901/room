import { TPrimitive } from './TPrimitive.ts';

export type TNominalPrimitive<P extends TPrimitive, N extends symbol> = P & Record<N, unknown>;
