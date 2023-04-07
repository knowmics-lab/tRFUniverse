import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, defaultValue?: T | (() => T)) {
    return useStorage(key, defaultValue, typeof window.localStorage !== "undefined" ? window.localStorage : undefined);
}

export function useSessionStorage<T>(key: string, defaultValue?: T | (() => T)) {
    return useStorage(
        key,
        defaultValue,
        typeof window.sessionStorage !== "undefined" ? window.sessionStorage : undefined,
    );
}

function useStorage<T>(key: string, defaultValue: T | (() => T), storageObject: Storage | undefined) {
    const [value, setValue] = useState<T | undefined>(() => {
        const jsonValue = storageObject ? storageObject.getItem(key) : null;
        if (jsonValue != null) return JSON.parse(jsonValue);
        if (typeof defaultValue === "function") {
            return (<() => T>defaultValue)();
        } else {
            return defaultValue;
        }
    });

    useEffect(() => {
        if (value === undefined && storageObject) return storageObject.removeItem(key);
        if (storageObject) storageObject.setItem(key, JSON.stringify(value));
    }, [key, value, storageObject]);

    const remove = useCallback(() => {
        setValue(undefined);
    }, []);

    return [value, setValue, remove];
}
