export interface StatelyTransition<T> {
    from: readonly T[];
    to: readonly T[];
}
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
