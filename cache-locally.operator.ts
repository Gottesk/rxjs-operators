import { MonoTypeOperatorFunction, Observable, iif, of } from 'rxjs';
import { tap } from 'rxjs/operators';

const expirationTimeDefault = 60 * 5000;

const storageKey = 'dataCache';

interface ICachedItem<T> {
    key: string;
    cachedDate: Date;
    data: T;
}
interface IDataCache<T> {
    [key: string]: ICachedItem<T>;
}

const getDataCache = <T>() => {
    const dataCache: IDataCache<T> = JSON.parse(localStorage.getItem(storageKey)) || {};
    return dataCache;
};

const getItem = <T>(key: string): ICachedItem<T> => {
    const dataCache: IDataCache<T> = getDataCache();
    return dataCache[key];
};

const setItem = <T>(key: string, data: T) => {
    const dataCache: IDataCache<T> = getDataCache();
    const item: ICachedItem<T> = {
        key,
        cachedDate: new Date(),
        data
    };
    const newDataCache: IDataCache<T> = { ...dataCache, [key]: item };
    localStorage.setItem(storageKey, JSON.stringify(newDataCache));
};

const isCacheAvailable = <T>(key: string, expirationTime: number): boolean => {
    if (!isLocalStorageAvailable()) {
        return false;
    }
    const item = getItem<T>(key);
    if (!item) {
        return false;
    }
    const nowDate = new Date();
    const cachedDate = new Date(item.cachedDate);
    const expirationDate = new Date(cachedDate.getTime() + expirationTime);
    return expirationDate > nowDate;
};

const getFromCache = <T>(key: string): T => {
    const item = getItem<T>(key);
    return item && item.data;
};

const isLocalStorageAvailable = () => {
    const test = '__test__';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

/** Operator for caching data from an observable in localStorage with an expiration date. */
export function cacheLocally<T>(key: string, request: Observable<T>, expirationTime = expirationTimeDefault): MonoTypeOperatorFunction<T> {
    return input$ => input$.pipe(
        () =>
            iif(() => isCacheAvailable(key, expirationTime),
                of(getFromCache(key)),
                request.pipe(
                    tap(data => {
                        setItem(key, data);
                    })
                ),
            )
    );
}
