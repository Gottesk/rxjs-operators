import { MonoTypeOperatorFunction } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/** Extended distinctUntilChanged operator. */
export function distinctUntilKeysChanged<T>(keys: (keyof T)[]): MonoTypeOperatorFunction<T> {
    return input$ => input$.pipe(
        distinctUntilChanged((a, b) => {
            for (let i = 0; i < keys.length; i++) {
                const property = keys[i];
                if (a[property] !== b[property]) {
                    return false;
                }
            }
            return true;
        }),
    );
}
