import { useState, useEffect, useCallback, useRef } from 'react';

export function useInfiniteScroll<T>(
    fetchFn: (page: number) => Promise<T[]>,
    options: {
        initialPage?: number;
        threshold?: number;
    } = {}
) {
    const { initialPage = 1, threshold = 100 } = options;

    const [data, setData] = useState<T[]>([]);
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const observer = useRef<IntersectionObserver>();
    const lastElementRef = useCallback(
        (node: HTMLElement | null) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prev) => prev + 1);
                }
            }, {
                rootMargin: `${threshold}px`
            });

            if (node) observer.current.observe(node);
        },
        [loading, hasMore, threshold]
    );

    useEffect(() => {
        const loadMore = async () => {
            if (!hasMore || loading) return;

            try {
                setLoading(true);
                setError(null);
                const newData = await fetchFn(page);

                if (newData.length === 0) {
                    setHasMore(false);
                } else {
                    setData((prev) => [...prev, ...newData]);
                }
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadMore();
    }, [page, fetchFn]);

    const reset = useCallback(() => {
        setData([]);
        setPage(initialPage);
        setHasMore(true);
        setError(null);
    }, [initialPage]);

    return {
        data,
        loading,
        hasMore,
        error,
        lastElementRef,
        reset
    };
}
