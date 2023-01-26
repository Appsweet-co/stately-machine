import { StatelySuccess } from './const';
export declare const toSuccess: <T, C>([[from], [to, context]]: [[T, C], [T, C]]) => StatelySuccess<T, C>;
