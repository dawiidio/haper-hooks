import {useContext, useEffect, useState} from 'react';
import {haperContext} from "./Provider";
import {HaperCancelablePromise} from "haper";
import {DefaultPaginationResponse, GenericObject, UseCollectionWitPaginationProps} from "./index.d";

export {haperContext, HaperProvider} from './Provider';

function useHaperCancelablePromise<T>() {
    const [promise, setPromise] = useState<HaperCancelablePromise<T>>();

    useEffect(() => {
        return () => {
            if (!promise)
                return;

            promise.cancel();
        };
    }, [promise]);

    return setPromise;
}

export function useCollection<T, P = {}, E = Error>(
    endpoint: string,
    params: Partial<P> | null = null,
    fetchOnInit: boolean = true,
) {
    const haper = useContext(haperContext);
    const [data, setData] = useState<Array<T>>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<E | null>(null);
    const [isMount, setIsMount] = useState<boolean>(true);
    const [internalParams, setInternalParams] = useState<Partial<P> | null>(
        params,
    );
    const setPromise = useHaperCancelablePromise<Array<T>>();

    useEffect(() => {
        setInternalParams(params);
    }, [params]);

    useEffect(() => {
        if (isMount && !fetchOnInit) {
            setIsMount(false);
            return;
        }

        if (loading) return;

        (async () => {
            if (!haper)
                throw new Error('Haper context not provided!');

            try {
                setLoading(true);
                const _promise = haper.get<Array<T>>(endpoint, internalParams);
                setPromise(_promise);
                const data = await _promise;
                setData(data);
                setError(null);
            } catch (e) {
                if (e === 'cancel')
                    return;

                setError(e);
            } finally {
                setLoading(false);
                setPromise(undefined);
            }
        })();
    }, [internalParams]);

    return {
        data,
        loading,
        error,
        reload: (newParams: Partial<P>) => {
            setInternalParams(newParams);
        },
    };
}



export function useCollectionWithPagination<T, PaginationResponse extends GenericObject = DefaultPaginationResponse<T>, Params = {}, E = Error>({
    endpoint,
    userParams,
    currentPage: _currentPage = 1,
    getTotal = (response) => response.total as number,
    getData = response => response.data as Array<T>,
    getPaginationParams = (sizeOffset, userParams) => ({
        ...sizeOffset,
        ...(userParams && userParams),
    })
}: UseCollectionWitPaginationProps<T, Params, PaginationResponse>) {
    const haper = useContext(haperContext);
    const [data, setData] = useState<Array<T>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<E | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(_currentPage);
    const [total, setTotal] = useState<number | null>(null);
    const [allPages, setAllPages] = useState<number>(0);
    const [params, setParams] = useState<GenericObject | null>(null);
    const [size, setSize] = useState<number>(20);
    const [internalUserParams, setInternalUserParams] = useState<Partial<Params> | undefined>(userParams);
    const setPromise = useHaperCancelablePromise<PaginationResponse>();

    useEffect(() => {
        setInternalUserParams(userParams);
    }, [userParams]);

    useEffect(() => {
        setParams(
            getPaginationParams(
                {
                    size,
                    offset: (currentPage - 1) * size
                },
                internalUserParams
            )
        );
    }, [currentPage, size, internalUserParams]);

    useEffect(() => {
        if (!params) return;

        if (loading) return;

        (async () => {
            if (!haper)
                throw new Error('Haper context not provided!');

            try {
                setLoading(true);
                const _promise = haper.get<PaginationResponse>(endpoint, params);
                setPromise(_promise);
                const response = await _promise;
                setData(getData(response));
                setError(null);
                setTotal(getTotal(response));
            } catch (e) {
                if (e === 'cancel')
                    return;

                setError(e);
            } finally {
                setLoading(false);
                setPromise(undefined);
            }
        })();
    }, [params]);

    useEffect(() => {
        if (typeof total !== 'number') return;

        setAllPages(Math.round(total / size));
    }, [total]);

    return {
        setSize,
        loading,
        data,
        error,
        allPages,
        currentPage,
        next: () => {
            if (currentPage >= allPages) return;

            setCurrentPage(currentPage + 1);
        },
        prev: () => {
            if (currentPage === 1) return;

            setCurrentPage(currentPage - 1);
        },
        setPage: (page: number) => {
            if (page < 1 || page >= allPages) return;

            setCurrentPage(page);
        },
        reload: (newParams?: Partial<Params>, pageNumber?: number) => {
            setInternalUserParams(newParams);
            setCurrentPage(pageNumber || currentPage);
        },
    };
}

export function useEntity<T, P = {}, E = Error>(
    endpoint: string,
    userParams: Partial<P> | null = null,
    fetchOnInit: boolean = true,
) {
    const haper = useContext(haperContext);
    const [data, setData] = useState<T>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<E | null>(null);
    const [params, setParams] = useState<Partial<P> | null>(userParams);
    const [reload, setReload] = useState<boolean>(fetchOnInit);
    const setPromise = useHaperCancelablePromise<T>();

    useEffect(() => {
        if (!reload) return;

        if (loading) return;

        (async () => {
            if (!haper)
                throw new Error('Haper context not provided!');

            try {
                setLoading(true);
                const _promise = haper.get<T>(endpoint, params);
                setPromise(_promise);
                const data = await _promise;
                setData(data);
                setError(null);
            } catch (e) {
                if (e === 'cancel')
                    return;

                setError(e);
            } finally {
                setLoading(false);
                setPromise(undefined);
            }
        })();

        setReload(false);
    }, [reload, params]);

    return {
        data,
        loading,
        error,
        reload: (newParams: Partial<P>) => {
            setParams(newParams);
            setReload(true);
        },
    };
}
