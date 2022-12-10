export interface StatelyTransition<T> {
  from: readonly T[];
  to: readonly T[];
}

export interface StatelyError<T> {
  type: 'NO_TRANSITION' | 'SAME_STATE';
  from: T;
  to: T;
}
