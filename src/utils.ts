import { StatelySuccess } from './const';

export const toSuccess = <T, C>([[from], [to, context]]: [[T, C], [T, C]]): StatelySuccess<T, C> => ({ from, to, context });
