import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosError } from 'axios';

interface UseFetchOptions<T> {
    initialData?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    skip?: boolean;
}

interface UseFetchReturn<T> {
    data: T | null;
    error: Error | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
}

export function useFetch<T>(
    fetchFn: () => Promise<T>,
    options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
    const [data, setData] = useState<T | null>(options.initialData || null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(!options.skip);
    const fetchFnRef = useRef(fetchFn);

    // Update ref when fetchFn changes
    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetchFnRef.current();
            setData(result);
            if (options.onSuccess) {
                options.onSuccess(result);
            }
        } catch (err) {
            const error = err as AxiosError;
            setError(error);
            if (options.onError) {
                options.onError(error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [options.onSuccess, options.onError]);

    useEffect(() => {
        if (!options.skip) {
            fetchData();
        }
    }, [options.skip, fetchData]);

    return {
        data,
        error,
        isLoading,
        refetch: fetchData,
    };
}