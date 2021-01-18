export interface GenericObject {
    [key: string]: any
}

export interface SizeOffsetObject {
    size: number
    offset: number
}

export interface UseCollectionWitPaginationProps<T, Params, PaginationResponse> {
    endpoint: string,
    userParams?: Partial<Params>,
    currentPage?: number,
    getTotal?: (response: PaginationResponse) => number
    getData?: (response: PaginationResponse) => Array<T>
    getPaginationParams?: (sizeOffset:SizeOffsetObject, userParams: Partial<Params>|undefined) => GenericObject
}

export interface DefaultPaginationResponse<T> {
    total: number;
    data: Array<T>;
}

export function useCollectionWithPagination<T, PaginationResponse extends GenericObject = DefaultPaginationResponse<T>, Params = {}, E = Error>(
    args: UseCollectionWitPaginationProps<T, Params, PaginationResponse>
): {
    setSize: (size: number) => any
    loading: boolean
    data: Array<T>,
    error: E
    allPages: number
    currentPage: number
    next: () => any
    prev: () => any
    setPage: (page: number) => any
    reload: (newParams?: Partial<Params>, pageNumber?: number) => any
}

export function useCollection<T, P = {}, E = Error>(
    endpoint: string,
    params?: Partial<P> | null,
    fetchOnInit?: boolean,
): {
    loading: boolean
    data: Array<T>,
    error: E
    reload: (newParams?: Partial<P>) => any
}

export function useEntity<T, P = {}, E = Error>(
    endpoint: string,
    params?: Partial<P> | null,
    fetchOnInit?: boolean,
): {
    loading: boolean
    data: T,
    error: E
    reload: (newParams?: Partial<P>) => any
}

export interface PaginationDataOut<T> {
    data: T[]
    total: number
    pageSize?: number
    pageNumber?: number
    totalPages?: number
}

export interface GetDataArgs<P = {}> {
    requestId: string
    initial: boolean
    params: P
}

export function useQueryCollection<T, P = {}>(getData: (args: GetDataBaseArgs<Partial<P>>) => Promise<T[]>, initialParams?: Partial<P>): {
    data: T[]|undefined,
    loading: boolean
    error: Error|undefined
    cancel: () => void
    params: Partial<P>,
    initial: boolean
    reload: () => any
    mutate: (params: Partial<P>) => any
};

export function useQueryEntity<T, P = {}>(getData: (args: GetDataBaseArgs<Partial<P>>) => Promise<T>, initialParams?: Partial<P>): {
    data: T|undefined,
    loading: boolean
    error: Error|undefined
    cancel: () => void
    initial: boolean
    params: Partial<P>,
    reload: () => any
    mutate: (params: Partial<P>) => any
};

interface PublicPaginationData<P = {}> {
    pageNumber: number
    pageSize: number
    params: Partial<P>
}

export interface GetDataArgs<P = {}> {
    requestId: string
    initial: boolean
    params: P
}

interface PublicPaginationData<P = {}> {
    pageNumber: number
    pageSize: number
    params: Partial<P>
}

interface PrivatePaginationData {
    total: number
    totalPages: number
}

export interface PaginationDataOut<T> {
    data: T[]
    total: number
    incremental?: boolean
    resetData?: boolean
}

export function useQueryCollectionWithPagination <T, P = {}>
(
    getData: (args: PublicPaginationData<P>&PrivatePaginationData&GetDataArgs&{ resetData?: boolean }) => Promise<PaginationDataOut<T>>,
    initialParams: Partial<PublicPaginationData<P>>
): {
    data: T[],
    error: Error|undefined
    loading: boolean
    total: number|undefined
    pageSize: number
    pageNumber: number
    totalPages: number|undefined
    params: P
    next: () => void
    prev: () => void
    cancel: () => void
    setPageSize: (size: number) => void
    initial: boolean
    setPage: (page: number) => void
    mutate: (data: Partial<PublicPaginationData<P>>&{ resetData?: boolean }) => void
    resetData: () => void
}

export { HaperProvider, haperContext } from './Provider';
export * from 'haper';
