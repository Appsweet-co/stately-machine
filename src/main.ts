import type { Result } from '@appsweet-co/ts-utils';
import { filter, Observable, Subject } from 'rxjs';
import type { StatelyError, StatelyErrorType, StatelySuccess, StatelyTransition } from './const';

export class StatelyMachine<T, C extends Record<string, unknown>> {
  #context: C;
  #current: T;
  #transitions: ReadonlyArray<StatelyTransition<T>>;

  #didChange$$ = new Subject<StatelySuccess<T, C>>();
  #didError$$ = new Subject<StatelyError<T>>();

  constructor(initial: T, context = {} as C) {
    this.#context = context;
    this.#current = initial;
    this.#transitions = [];
  }

  public get context(): C {
    return this.#context;
  }

  public get state(): T {
    return this.#current;
  }

  public get onAny$(): Observable<StatelySuccess<T, C>> {
    return this.#didChange$$.asObservable();
  }

  public get onAnyError$(): Observable<StatelyError<T>> {
    return this.#didError$$.asObservable();
  }

  public on$(state: T): Observable<StatelySuccess<T, C>> {
    return this.#didChange$$
      .asObservable()
      .pipe(filter(next => next === state));
  }

  public onError$(type: StatelyErrorType): Observable<StatelyError<T>> {
    return this.#didError$$
      .asObservable()
      .pipe(filter(next => next.type === type));
  }

  public transitions(config: ReadonlyArray<StatelyTransition<T>>): void {
    this.#transitions = config;
  }

  public go(state: T, context?: C): void {
    const { error, ok } = this.#validate(state);

    if (error) {
      return this.#didError$$.next({ type: error, from: this.#current, to: state });
    }

    const payload: StatelySuccess<T, C> = {
      context: { ...this.#context, ...context },
      from: this.#current,
      to: ok
    };

    this.#context = payload.context;
    this.#current = payload.to;

    return this.#didChange$$.next(payload);
  }

  #validate(state: T): Result<T, StatelyErrorType> {
    if (this.#transitions.length === 0) return { error: 'EMPTY_TRANSITIONS' };
    if (this.#current === state) return { error: 'SAME_STATE' };
    if (this.#noTransition(state)) return { error: 'NO_TRANSITION' };

    return { ok: state };
  }

  #noTransition(state: T): boolean {
    return !this.#transitions
      .filter(item => item.from.includes(this.#current))
      .some(item => item.to.includes(state));
  }
}
