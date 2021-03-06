# Haper hooks
haper-hooks is a small library with a few React hooks for easier data fetching from REST APIs.
For better performance in SPA applications hooks automatically detects already unmounted components and cancels requests initialized by them if any is pending

## Install
```sh
npm install --save haper-hooks
```

## Usage
Quick example

```typescript jsx
import React, {} from 'react';
import {render} from 'react-dom';
import {HaperProvider, useCollection} from 'haper-hooks';

interface User {
    name: string
    surname: string
    email: string
}

function UsersList() {
    const {
        loading, //bool
        data, // Array<User>
        error, // Error | 'cancel'
    } = useCollection<User>('/user');

    return (
        <div>
            {loading && 'Loading'}
            {error && (error?.message || error)}
            {
                data.map(user => (
                    <p key={user.email}>{user.name} {user.surname}</p>
                ))
            }
        </div>
    );
}

render(
    <HaperProvider baseUrl="http://localhost:3001">
        <UsersList />
    </HaperProvider>,
    document.getElementById('root')
)
```

## Hooks

#### useCollection
You should use it for simple and relatively small lists without pagination

Usage:

```typescript jsx
import {useCollection} from 'haper-hooks';

interface User {
    name: string
    surname: string
    email: string
}

function UsersList() {
    const {
        loading, //bool
        data, // Array<User>
        error, // Error | 'cancel'
    } = useCollection<User>('/user');

    return (
        <div>
            {loading && 'Loading'}
            {error && (error?.message || error)}
            {
                data.map(user => (
                    <p key={user.email}>{user.name} {user.surname}</p>
                ))
            }
        </div>

    );
}
```
Params

| name        | required | type                   | comment                                      |
|-------------|----------|------------------------|----------------------------------------------|
| endpoint    | ✅        | string                 |                                              |
| params      | ❌        | Partial< Params>\|null | initial params                               |
| fetchOnInit | ❌        | boolean                | should callback be called on component mount |

Returned object

| name    | type                               | comment                       |
|---------|------------------------------------|-------------------------------|
| reload  | (newParams?: Partial< P >) =>  any | reload data with new params   |
| loading | boolean                            | initial params                |
| data    | Array< T>                          | data fetched for current page |
| error   | E                                  |                               |

#### useEntity
You should use it for single data entity

Usage

```typescript jsx
import {useEntity} from 'haper-hooks';

interface User {
    name: string
    surname: string
    email: string
}

function UserProfile() {
    const {
        loading, //bool
        data: user, // User
        error, // Error | 'cancel'
    } = useEntity<User>('/user');

    return (
        <div>
            {loading && 'Loading'}
            {error && (error?.message || error)}
            <h2>{user?.name} {user?.surname}</h2>
            <p>{user?.email}</p>
        </div>

    );
}
```

Params

| name        | required | type                   | comment                                      |
|-------------|----------|------------------------|----------------------------------------------|
| endpoint    | ✅        | string                 |                                              |
| params      | ❌        | Partial< Params>\|null | initial params                               |
| fetchOnInit | ❌        | boolean                | should callback be called on component mount |

Returned object

| name    | type                               | comment                       |
|---------|------------------------------------|-------------------------------|
| reload  | (newParams?: Partial< P >) =>  any | reload data with new params   |
| loading | boolean                            | initial params                |
| data    | Array< T>                          | data fetched for current page |
| error   | E                                  |                               |

#### useCollectionWithPagination
This hook contains more logic focused on lists pagination. Values like offset and size
after set in frontend are send to backend with request as query params along with other
user params if such were specified

Usage
```typescript jsx
import {useCollectionWithPagination} from 'haper-hooks';

interface User {
    name: string
    surname: string
    email: string
}

function UserList() {
    const {
            data,
            allPages,
            reload: reloadList,
            loading,
            next,
            prev,
            currentPage
        } = useCollectionWithPagination<DataModel, Filters>({
            endpoint: '/user',
            currentPage: 1
        });

    return (
        <div>
            {loading && 'Loading'}
            {error && (error?.message || error)}
            {
                data.map(user => (
                    <p key={user.email}>{user.name} {user.surname}</p>
                ))
            }
            <p>Page {currentPage}/${allPages}</p>
            <button onClick={next}>next page</button>
            <button onClick={prev}>prev page</button>
            <button onClick={reloadList}>reload list</button>
            <button onClick={() => {
                reloadList({
                    name: 'Dawid'
                }); // this will send request with query params like: /user?offset=x&size=y&name=Dawid
            }}>Show all users wit name Dawid</button>
        </div>
    );
}
```

Params

| name        | required | type                                          | comment                                                     |   |
|---------------------|----------|-----------------------------------------------|-------------------------------------------------------------|---|
| endpoint            | ✅        | string                                        |                                                             |   |
| userParams          | ❌        | Partial< Params>                              | initial params                                              |   |
| currentPage         | ❌        | number                                        | initial page                                                |   |
| getTotal            | ❌        | (response:  PaginationResponse ) =>  number   | extractor function for total value from PaginationResponse  |   |
| getData             | ❌        | (response:  PaginationResponse ) => Array< T> | extractor function for data value from  PaginationResponse  |   |
| getPaginationParams | ❌        | ({ size, offset}, userParams) => object       | composer function for request params from internal size and offset and users additional params for example filters etc. |   |

Returned object

| name        | type                                                             | comment                                                         |
|-------------|------------------------------------------------------------------|-----------------------------------------------------------------|
| setSize     | (size:  number ) =>  any                                         | determines how many data entities should be fetched per request |
| loading     | boolean                                                          | initial params                                                  |
| data        | Array< T>                                                        | data fetched for current page                                   |
| error       | E                                                                |                                                                 |
| allPages    | number                                                           |                                                                 |
| currentPage | number                                                           |                                                                 |
| next        | () =>  any                                                       | go to next page                                                 |
| prev        | () => any                                                        | go to prev page                                                 |
| setPage     | (page:number) => any                                             |                                                                 |
| reload      | (newParams?: Partial<Params> ,  pageNumber?:  number ) =>  any | reload data with new params                                     |

### Usage with haper api builder

haper gives you additional approach to create api with which you can
better encapsulate your endpoints and combine them with models in one
place (if you using TypeScript, which I recommend)

For example you can create endpoint function and indicate model 
it takes as a parameters and which it will return after run

```typescript jsx
import {createApiBuilder, createHaper} from 'haper';

const haper = createHaper({});
const api = createApiBuilder(haper);

interface User {
    id: number
    name: string
}

interface ApiList<T> {
    total: number,
    data: T[]
}

interface UserListParams {
    size: number,
    offset: number,
    search?: string
}

export const getUsersList = api.get<ApiList<User>, UserListParams>(`/employee/users`);

async function main() {
    // you can use fetching function even without hooks, hooks are just additional layer
    const usersResponse = await getUsersList({
       size: 10,
       offset: 0
    });
    
    console.log(usersResponse); // { total: 100, data: [10xUser] }
}

main();
```

below I present examples of using hooks

#### useQueryCollection
Example:
```typescript jsx
import { useQueryCollection } from 'haper-hooks';

// useQuery* first param of hook is always getData function which fetch data for hook and returns it in a required by hook shape
const {
        data,
        loading,
        error,
        cancel
    } = useQueryCollection<User, UserListParams>(
        // first function is fetching function, it fetches users list by calling haper endpoint defined before
        async ({ requestId, params }) => {
            // if you want automatic request cancellation on unmount you need to pass request id to fetching function
            const tempData = await getUsersList(params, requestId);
    
            return tempData.data; // in useQueryCollection we need to return only array of T, so here we returning it
        },
        // as a second argument you can pass initial values for params object 
        {
            offset: 0,
            size: 10
        }
    );
```

Params

| name        | required | type                                          | comment                                                     |   |
|---------------------|----------|-----------------------------------------------|-------------------------------------------------------------|---|
| getData        | ✅        | (args: {requestId: string, initial: boolean, params: Partial< P >}) => Promise<T[]>                                        |                                                             |   |
| initialParams          | ❌        | Partial< P >                              | initial params                                              |   |

get data initial param indicates if it's first call on component mount

Returned object

| name        | type                                                             | comment                                                         |
|-------------|------------------------------------------------------------------|-----------------------------------------------------------------|
| loading     | boolean                                                          | loading indicator                                                  |
| initial     | boolean                                                          | is first, initial fetch                                                  |
| data        | Array< T >                                                         | fetched data                                   |
| params      | Partial< P >                                                       | current params object                                   |
| error       | Error|undefined                                                  | error                                                           |
| cancel      | () => any                                                        | cancels current request if pending                               |
| mutate      | (params: Partial< P >) => any                                      | changes request params and fetches new data                               |
| reload      | () => any                                                        | reload data without changing params                               |


#### useQueryCollectionWithPagination
Example:
```typescript jsx
import { useQueryCollectionWithPagination } from 'haper-hooks';

// useQuery* first param of hook is always getData function which fetch data for hook and returns it in a required by hook shape
const {
    data,
    next,
    pageNumber,
    params,
    prev,
    setPageSize,
    mutate,
    loading,
    pageSize,
    initial,
    total,
} = useQueryCollectionWithPagination<User, UserListParams>(
     ({ pageSize, pageNumber, params }) => {
        return getUsersList(JSON.parse(JSON.stringify({
            ...params,
            offset: pageNumber * pageSize,
            size: pageSize,
        })));
    },
    {
        pageSize: 20,
        pageNumber: 1,
    },
);

function goToNextPage() {
    next();
}

function filterByName(name: string) {
  mutate({
    pageNumber: 1,
    resetData: true,
    params: {
        search: name
    }
  });
}
```

Params

| name        | required | type                                          | comment                                                     |   |
|---------------------|----------|-----------------------------------------------|-------------------------------------------------------------|---|
| getData        | ✅        | (args: {requestId: string, initial: boolean, params: Partial< P >}) => Promise<T[]>                                        |                                                             |   |
| initialPaginationData | ❌        | {pageSize: number, pageNumber: number, params: Partial< P >} | pagination initial data                                              |   |

get data initial param indicates if it's first call on component mount

Returned object

| name        | type                                                             | comment                                                         |
|-------------|------------------------------------------------------------------|-----------------------------------------------------------------|
| loading     | boolean                                                          | loading indicator                                                  |
| data        | Array< T >                                                         | fetched data                                   |
| error       | Error|undefined                                                  | error                                                           |
| total      | number                                                    | total items number (obtained from response)                               |
| pageSize      | number                                                        | current page size                               |
| pageNumber      | number                                                        | current page number                               |
| totalPages      | number                                                        | total pages (obtained from response)                               |
| setPageSize      | (size: number) => any                                                        | set items per page                               |
| setPage      | (page: number) => any                                                        | set current page number                               |
| next      | () => any                                                        | go to next page                               |
| prev      | () => any                                                        | go to prev page                               |
| cancel      | () => any                                                        | cancels current request if pending                               |
| resetData      | () => any                                                        | reset current data                               |
| mutate      | (params: Partial< P >) => any                                                        | changes request params and fetches new data                                |


#### useQueryEntity
Example:
```typescript jsx
import { useQueryCollection } from 'haper-hooks';

// useQuery* first param of hook is always getData function which fetch data for hook and returns it in a required by hook shape
const {
        data,
        loading,
        error,
        cancel
    } = useQueryCollection<User, GetUserParams>(
        ({ requestId, params }) => {
            // if you want automatic request cancellation on unmount you need to pass request id to fetching function
            return getUser(params, requestId);
        },
    );
```

Params

| name        | required | type                                          | comment                                                     |   |
|---------------------|----------|-----------------------------------------------|-------------------------------------------------------------|---|
| getData        | ✅        | (args: {requestId: string, initial: boolean, params: Partial< P >}) => Promise<T>                                        |                                                             |   |
| initialParams          | ❌        | Partial< P >                              | initial params                                              |   |


get data initial param indicates if it's first call on component mount

Returned object

| name        | type                                                             | comment                                                         |
|-------------|------------------------------------------------------------------|-----------------------------------------------------------------|
| loading     | boolean                                                          | loading indicator                                                  |
| data        | T|undefined                                                      | fetched data                                   |
| error       | Error|undefined                                                  | error                                                           |
| cancel      | () => any                                                        | cancels current request if pending                               |

## Most common cases

#### Provide custom haper instance
Most of the time I use raw haper for other fetching tasks along with haper-hooks
and I like to create it's instance by myself, register some interceptors etc. in that
case I want to provide my custom instance of haper to all haper-hooks. This is example
how you can do it

```typescript jsx
import React, {} from 'react';
import {render} from 'react-dom';
import {HaperProvider, useCollection} from 'haper-hooks';
import {createHaper} from 'haper';

const haper = createHaper({});

haper.registerResponseDataInterceptor('* * *', (apiResponse: { error: boolean, result: any }) => {
    if (apiResponse.error) {
        throw new Error('Api error');
    }

    return apiResponse.result;
});

interface User {
    name: string
    surname: string
    email: string
    id: number
}

function UsersList() {
    const {
        loading, //bool
        data, // Array<User>
        error, // Error | 'cancel'
        reload
    } = useCollection<User>('/user');
    
    return (
        <div>
            {loading && 'Loading'}
            {error && (error?.message || error)}
            {
                data.map(user => (
                    <button 
                        key={user.email} 
                        onClick={async () => {
                            await haper.delete(`/user/${user.id}`);
                            reload();
                        }}
                    >
                        Delete user {user.name} {user.surname}
                    </button>
                ))
            }
        </div>
    );
}

render(
    <HaperProvider haperInstance={haper}>
        <UsersList />
    </HaperProvider>,
    document.getElementById('root')
)
```
