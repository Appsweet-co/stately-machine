import type { StatelyMachine } from './main';


/**
 * A collection of valid state transitions.
 *
 * Used with {@linkcode StatelyMachine.transitions} to define all valid state transitions.
 *
 * @example
 *
 * ```ts
 * { from: ['SomeState'], to: ['AnotherState', 'AlsoThisState'] }
 * ```
 *
 * @see {@linkcode StatelyMachine.transitions}
 */
export interface StatelyTransition<T> {
  from: readonly T[];
  to: readonly T[];
}

/**
 * The type of error, emitted as part of a {@linkcode StatelyError}.
 *
 * - `EMPTY_TRANSITIONS`: You must set all valid transitions to use the machine.
 * Use {@linkcode StatelyMachine.transitions} to declare valid transitions.
 *
 * - `NO_TRANSITION`: There's no valid transition from the active state to the
 * new state.
 *
 * - `SAME_STATE`: You can't transition from the active state to itself.
 *
 * @see {@linkcode StatelyError}
 */
export type StatelyErrorType = 'EMPTY_TRANSITIONS' | 'NO_TRANSITION' | 'SAME_STATE';

/**
 * Emitted by {@linkcode StatelyMachine.onError$} and {@linkcode StatelyMachine.onAnyError$}
 * for unsuccessful state transitions attempts.
 *
 * @example
 *
 * ```ts
 * { type: "NO_TRANSITION", from: 'SomeState', to: 'AnotherState' }
 * ```
 *
 * @see {@linkcode StatelyError}, {@linkcode StatelyMachine.onError$}, {@linkcode StatelyMachine.onAnyError$}
 */
export interface StatelyError<T> {
  type: StatelyErrorType;
  from: T;
  to: T;
}

/**
 * Emitted by {@linkcode StatelyMachine.on$} and {@linkcode StatelyMachine.onAny$}
 * for successful state transitions.
 *
 * @example
 *
 * ```ts
 * { from: 'SomeState', to: 'AnotherState', context: { anyProps: 'any values' } }
 * ```
 *
 * @see {@linkcode StatelyMachine.on$}, {@linkcode StatelyMachine.onAny$}
 */
export interface StatelySuccess<T, C> {
  context: C;
  from: T;
  to: T;
}
