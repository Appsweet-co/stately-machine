import type { StatelyError, StatelyErrorType, StatelyTransition } from './const';
export declare class StatelyMachine<T> {
    #private;
    constructor(initial: T);
    get state(): T;
    get onAny$(): import("rxjs").Observable<T>;
    get onAnyError$(): import("rxjs").Observable<StatelyError<T>>;
    on$(state: T): import("rxjs").Observable<T>;
    onError$(type: StatelyErrorType): import("rxjs").Observable<StatelyError<T>>;
    transitions(config: ReadonlyArray<StatelyTransition<T>>): void;
    go(state: T): void;
}
