import { Observable, interval, MonoTypeOperatorFunction } from 'rxjs';
import { retryWhen, takeUntil, filter } from 'rxjs/operators';

export const retryUntil = <T>(condition: Observable<T>, delayMilliseconds: number = 3000): MonoTypeOperatorFunction<T> =>
    input$ => input$.pipe(
        retryWhen(() => interval(delayMilliseconds)),
        takeUntil(condition.pipe(filter(result => !!result)))
    );
