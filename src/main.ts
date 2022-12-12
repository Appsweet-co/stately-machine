import { filter, Subject } from 'rxjs';
import type { StatelyError, StatelyTransition } from './const';

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

    public get onAnyError$() {
      return this.#didError$$.asObservable();
    }

    public get onAny$() {
      return this.#didChange$$.asObservable();
    }

    public on$(state: T) {
      return this.#didChange$$
        .asObservable()
        .pipe(filter(next => next === state));
    }

    public onError$(type: StatelyError<T>['type']) {
        return this.#didError$$
          .asObservable()
          .pipe(filter(next => next.type === type));
      }

    public transitions(config: ReadonlyArray<StatelyTransition<T>>) {
      this.#transitions = config;
    }

    public go(state: T) {
      const { error, next } = this.#validate(state);

      if (error)
        return this.#didError$$.next({
          type: error,
          from: this.#current,
          to: state,
        });

      this.#current = next;
      this.#didChange$$.next(next);
    }

    #validate(state: T) {
      if (this.#current === state) {
        return { error: 'SAME_STATE' } as const;
      }

      if (this.#noTransition(state)) {
        return { error: 'NO_TRANSITION' } as const;
      }

      return { next: state } as const;
    }

    #noTransition(state: T) {
      return !this.#transitions
        .filter((item) => item.from.some((item) => item === this.#current))
        .some((item) => item.to.indexOf(state));
    }
  }
