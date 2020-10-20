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

export { HaperProvider, haperContext } from './Provider';
export * from 'haper';