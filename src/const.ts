import type { StatelyMachine } from './main';

export interface StatelyTransition<T> {
  from: readonly T[];
  to: readonly T[];
}

/**
 * - `EMPTY_TRANSITIONS`: You must set all valid transitions to use the machine.
 * Use {@linkcode StatelyMachine.transitions} to declare valid transitions.
 *
 * - `NO_TRANSITION`: There's no valid transition from the active state to the
 * new state.
 *
 * - `SAME_STATE`: You can't transition from the active state to itself.
 */
export type StatelyErrorType = 'EMPTY_TRANSITIONS' | 'NO_TRANSITION' | 'SAME_STATE';

export interface StatelyError<T> {
  type: StatelyErrorType;
  from: T;
  to: T;
}

export interface StatelySuccess<T, C> {
  context: C;
  from: T;
  to: T;
}
