import { BehaviorSubject, filter, map, Observable, pairwise, Subject, zip } from 'rxjs';
import type { StatelyError, StatelyErrorType, StatelySuccess, StatelyTransition } from './const';
import { toSuccess } from './utils';

export class StatelyMachine<T, C extends Record<string, unknown>> {
  #context = new BehaviorSubject<C>(undefined);
  #error = new Subject<StatelyError<T>>();
  #state = new BehaviorSubject<T>(undefined);
  #transitions: ReadonlyArray<StatelyTransition<T>> = [];

  constructor(initial: T, context = {} as C) {
    this.#state.next(initial);
    this.#context.next(context);
  }

  /**
   * The current state of the machine.
   *
   * @example
   *
   * ```ts
   * machine.state
   * // => 'SomeState'
   * ```
   */
  public get state(): T {
    return this.#state.getValue();
  }

  /**
   * The current context of the machine.
   *
   * @example
   *
   * ```ts
   * machine.context
   * // => { anyProps: 'any values' }
   * ```
   */
  public get context(): C {
    return this.#context.getValue();
  }

  /**
   * Emits a {@linkcode StatelySuccess} on all successful state changes.
   *
   * @example
   *
   * ```ts
   * machine.onAny$.subscribe(console.log)
   * // ==> { from: 'SomeState', to: 'AnotherState', context: { anyProps: 'any values' } }
   * ```
   */
  public get onAny$(): Observable<StatelySuccess<T, C>> {
    return zip(this.#state, this.#context).pipe(pairwise(), map(toSuccess));
  }

  /**
   * Emits a {@linkcode StatelyError} on all {@linkcode StatelyErrorType}.
   *
   * @example
   *
   * ```ts
   * machine.onAnyError$.subscribe(console.error)
   * // ==> { from: 'SomeState', to: 'AnotherState', type: 'ANY_STATELY_ERROR_TYPE' }
   * ```
   */
  public get onAnyError$(): Observable<StatelyError<T>> {
    return this.#error.asObservable();
  }

  /**
   * Emits a {@linkcode StatelySuccess} only for the given `state`.
   *
   * @example
   *
   * ```ts
   * machine.on$(States.AnotherState).subscribe(console.log)
   * // ==> { from: 'SomeState', to: 'AnotherState', context: { anyProps: 'any values' } }
   * ```
   */
  public on$(state: T): Observable<StatelySuccess<T, C>> {
    return this.onAny$.pipe(filter(next => next.to === state));
  }

  /**
   * Emits a {@linkcode StatelyError} only for the given {@linkcode StatelyErrorType}.
   *
   * @example
   *
   * ```ts
   * machine.onError$('SPECIFIC_STATELY_ERROR_TYPE').subscribe(console.error)
   * // ==> { from: 'SomeState', to: 'AnotherState', type: 'SPECIFIC_STATELY_ERROR_TYPE' }
   * ```
   */
  public onError$(type: StatelyErrorType): Observable<StatelyError<T>> {
    return this.onAnyError$.pipe(filter(next => next.type === type));
  }

  /**
   * Declare all valid transitions for the machine.
   *
   * Emits an `EMPTY_TRANSITIONS` error on {@linkcode go} if you forget to set
   * the transitions.
   *
   * @example
   *
   * ```ts
   * machine.transitions([
   *  { from: [States.SomeState], to: [States.AnotherState] },
   *  { from: [States.AnotherState], to: Object.values(States) }
   * ])
   * ```
   */
  public transitions(config: ReadonlyArray<StatelyTransition<T>>): void {
    this.#transitions = config;
  }

  /**
   * Updates the machine to the new `state` and optional `context`.
   *
   * Emits a {@linkcode StatelySuccess} on a successful transition.
   *
   * Emits a `SAME_STATE` error if you try to transition to the
   * active state, or a `NO_TRANSITION` error if you try to transition to a state
   * without a valid transition.
   *
   * @example
   *
   * ```ts
   * machine.go(States.AnotherState, { foo: foo + 1 })
   * ```
   *
   */
  public go(state: T, context?: Partial<C>): void {
    this.#validate(state)
      .then(() => {
        this.#state.next(state);
        this.#context.next({ ...this.context, ...context });
      })
      .catch((type) => {
        this.#error.next({ type, from: this.state, to: state });
      })
  }

  #validate(state: T) {
    return new Promise((resolve, reject) => {
      if (this.#transitions.length === 0) return reject('EMPTY_TRANSITIONS');
      if (this.state === state) return reject('SAME_STATE');
      if (this.#noTransition(state)) return reject('NO_TRANSITION');

      return resolve(state);
    })
  }

  #noTransition(state: T): boolean {
    return !this.#transitions
      .filter(item => item.from.includes(this.state))
      .some(item => item.to.includes(state));
  }
}
