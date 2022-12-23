import type { Result } from '@appsweet-co/ts-utils';
import { filter, Observable, Subject } from 'rxjs';
import type { StatelyError, StatelyErrorType, StatelySuccess, StatelyTransition } from './const';

export class StatelyMachine<T, C extends Record<string, unknown>> {
  #active: T;
  #context: C;
  #transitions: ReadonlyArray<StatelyTransition<T>>;

  #didChange$$ = new Subject<StatelySuccess<T, C>>();
  #didError$$ = new Subject<StatelyError<T>>();

  constructor(initial: T, context = {} as C) {
    this.#active = initial;
    this.#context = context;
    this.#transitions = [];
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
    return this.#context;
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
    return this.#active;
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
    return this.#didChange$$.asObservable();
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
    return this.#didError$$.asObservable();
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
    return this.#didChange$$
      .asObservable()
      .pipe(filter(next => next.to === state));
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
    return this.#didError$$
      .asObservable()
      .pipe(filter(next => next.type === type));
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
    const { error, ok } = this.#validate(state);

    if (error) {
      return this.#didError$$.next({ type: error, from: this.#active, to: state });
    }

    const payload: StatelySuccess<T, C> = {
      context: { ...this.#context, ...context },
      from: this.#active,
      to: ok
    };

    this.#active = payload.to;
    this.#context = payload.context;

    return this.#didChange$$.next(payload);
  }

  #validate(state: T): Result<T, StatelyErrorType> {
    if (this.#transitions.length === 0) return { error: 'EMPTY_TRANSITIONS' };
    if (this.#active === state) return { error: 'SAME_STATE' };
    if (this.#noTransition(state)) return { error: 'NO_TRANSITION' };

    return { ok: state };
  }

  #noTransition(state: T): boolean {
    return !this.#transitions
      .filter(item => item.from.includes(this.#active))
      .some(item => item.to.includes(state));
  }
}
