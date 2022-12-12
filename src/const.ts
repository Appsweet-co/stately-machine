export interface StatelyTransition<T> {
  from: readonly T[];
  to: readonly T[];
}

export type StatelyErrorType = 'NO_TRANSITION' | 'SAME_STATE';

export interface StatelyError<T> {
  type: StatelyErrorType;
  from: T;
  to: T;
}

