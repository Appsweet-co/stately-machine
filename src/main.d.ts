import { Observable } from 'rxjs';
import type { StatelyError, StatelyErrorType, StatelySuccess, StatelyTransition } from './const';
export declare class StatelyMachine<T, C extends Record<string, unknown>> {
    #private;
    constructor(initial: T, context?: C);
    get context(): C;
    get state(): T;
    get onAny$(): Observable<StatelySuccess<T, C>>;
    get onAnyError$(): Observable<StatelyError<T>>;
    on$(state: T): Observable<StatelySuccess<T, C>>;
    onError$(type: StatelyErrorType): Observable<StatelyError<T>>;
    transitions(config: ReadonlyArray<StatelyTransition<T>>): void;
    go(state: T, context?: Partial<C>): void;
}
