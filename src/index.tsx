import {useContext, useEffect, useState} from 'react';
import {haperContext} from "./Provider";
import {createApiBuilder, createHaper, FakerMethod, HaperCancelablePromise, HaperMethodOptions} from "haper";
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

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export interface GetDataArgs {
    requestId: string
    initial: boolean
}

export function useQueryCollection<T>(getData: (args: GetDataArgs) => Promise<T[]>, reloadArguments: any[] = []) {
    const haper = useContext(haperContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<T[]>();
    const [error, setError] = useState<Error>();
    const setPromise = useHaperCancelablePromise<T[]>();
    const [uuid, setUuid] = useState<string>();
    const [initial, setInitial] = useState<boolean>(true);

    function cancel() {
        if (uuid) {
            const promise = haper?.getRequestPromise(uuid);

            if (promise)
                promise.cancel();
        }
    }

    async function fetchData() {
        if (loading)
            return;

        try {
            setLoading(true);
            const uv4 = uuidv4();
            setUuid(uv4);

            const newData = await getData({
                requestId: uv4,
                initial
            });

            setData(newData);
            setError(undefined);
        } catch (e) {
            if (e === 'cancel')
                return;

            setError(e);
        } finally {
            setLoading(false);
            setUuid(undefined);
            setInitial(false);
        }
    }

    useEffect(() => {
        if (uuid) {
            const promise = haper?.getRequestPromise(uuid);

            if (promise)
                setPromise(promise);
        }
    }, [uuid]);

    useEffect(() => {
        fetchData();
    }, [...reloadArguments]);

    return {
        data,
        loading,
        error,
        cancel
    }
}

export interface PaginationDataOut<T> {
    data: T[]
    total: number
}

export interface PaginationFields {
    total: number
    pageSize: number
    pageNumber: number
    totalPages: number
}

export interface PaginationDataIn<T> extends GetDataArgs, PaginationFields {
    data?: T[]
}

export function useQueryCollectionWithPagination<T>(getData: (args: PaginationDataIn<T>) => Promise<PaginationDataOut<T>>, initialPaginationData: Partial<Omit<Omit<PaginationFields, "total">, "totalPages">>, reloadArguments: any[] = []) {
    const haper = useContext(haperContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<T[]>();
    const [error, setError] = useState<Error>();
    const setPromise = useHaperCancelablePromise<T[]>();
    const [uuid, setUuid] = useState<string>();
    const [pageNumber, setPageNumber] = useState<number>(initialPaginationData.pageNumber || 1);
    const [pageSize, setPageSize] = useState<number>(initialPaginationData.pageSize || 20);
    const [total, setTotal] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [initial, setInitial] = useState<boolean>(true);

    function cancel() {
        if (uuid) {
            const promise = haper?.getRequestPromise(uuid);

            if (promise)
                promise.cancel();
        }
    }

    async function fetchData() {
        if (loading)
            return;

        try {
            setLoading(true);
            const uv4 = uuidv4();
            setUuid(uv4);

            const paginationDataOut = await getData({
                requestId: uv4,
                initial,
                pageNumber,
                pageSize,
                total,
                totalPages,
                data
            });

            setTotal(paginationDataOut.total);
            setTotalPages(Math.round(paginationDataOut.total / pageSize));
            setData(paginationDataOut.data);
            setError(undefined);
        } catch (e) {
            if (e === 'cancel')
                return;

            setError(e);
        } finally {
            setLoading(false);
            setUuid(undefined);
            setInitial(false);
        }
    }

    useEffect(() => {
        if (uuid) {
            const promise = haper?.getRequestPromise(uuid);

            if (promise)
                setPromise(promise);
        }
    }, [uuid]);

    useEffect(() => {
        fetchData();
    }, [...reloadArguments]);

    return {
        data,
        loading,
        error,
        setPageSize,
        pageSize,
        pageNumber,
        totalPages,
        total,
        cancel,
        next: () => {
            if (pageNumber >= totalPages) return;

            setPageNumber(pageNumber + 1);
        },
        prev: () => {
            if (pageNumber === 1) return;

            setPageNumber(pageNumber - 1);
        },
        setPage: (page: number) => {
            if (page < 1 || page >= totalPages) return;

            setPageNumber(page);
        },
    }
}

export function useQueryEntity<T>(getData: (args: GetDataArgs) => Promise<T>, reloadArguments: any[] = []) {
    const haper = useContext(haperContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<T>();
    const [error, setError] = useState<Error>();
    const setPromise = useHaperCancelablePromise<T>();
    const [uuid, setUuid] = useState<string>();
    const [initial, setInitial] = useState<boolean>(true);

    function cancel() {
        if (uuid) {
            const promise = haper?.getRequestPromise(uuid);

            if (promise)
                promise.cancel();
        }
    }

    async function fetchData() {
        if (loading)
            return;

        try {
            setLoading(true);
            const uv4 = uuidv4();
            setUuid(uv4);

            const newData = await getData({
                requestId: uv4,
                initial
            });

            setData(newData);
            setError(undefined);
        } catch (e) {
            if (e === 'cancel')
                return;

            setError(e);
        } finally {
            setLoading(false);
            setUuid(undefined);
            setInitial(false);
        }
    }

    useEffect(() => {
        if (uuid) {
            const promise = haper?.getRequestPromise(uuid);

            if (promise)
                setPromise(promise);
        }
    }, [uuid]);

    useEffect(() => {
        fetchData();
    }, [...reloadArguments]);

    return {
        data,
        loading,
        error,
        cancel
    }
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
