import type { Result } from '@appsweet-co/ts-utils';
import { filter, Subject } from 'rxjs';
import type { StatelyError, StatelyErrorType, StatelyTransition } from './const';

export class StatelyMachine<T> {
  #current: T;
  #transitions: ReadonlyArray<StatelyTransition<T>>;

  #didChange$$ = new Subject<T>();
  #didError$$ = new Subject<StatelyError<T>>();

  constructor(initial: T) {
    this.#current = initial;
    this.#transitions = [];
  }

  public get state() {
    return this.#current;
  }

  public get onAny$() {
    return this.#didChange$$.asObservable();
  }

  public get onAnyError$() {
    return this.#didError$$.asObservable();
  }

  public on$(state: T) {
    return this.#didChange$$
      .asObservable()
      .pipe(filter(next => next === state));
  }

  public onError$(type: StatelyErrorType) {
    return this.#didError$$
      .asObservable()
      .pipe(filter(next => next.type === type));
  }

  public transitions(config: ReadonlyArray<StatelyTransition<T>>) {
    this.#transitions = config;
  }

  public go(state: T) {
    const { error, ok } = this.#validate(state);

    if (error) {
      return this.#didError$$.next({ type: error, from: this.#current, to: state });
    }

    this.#current = ok;

    return this.#didChange$$.next(ok);
  }

  #validate(state: T): Result<T, StatelyErrorType> {
    if (this.#transitions.length === 0) return { error: 'EMPTY_TRANSITIONS' };

    if (this.#current === state) return { error: 'SAME_STATE' };

    if (this.#noTransition(state)) return { error: 'NO_TRANSITION' };

    return { ok: state };
  }

  #noTransition(state: T) {
    return !this.#transitions
      .filter(item => item.from.includes(this.#current))
      .some(item => item.to.includes(state));
  }
}
