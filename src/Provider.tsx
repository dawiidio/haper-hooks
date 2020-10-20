import React, {createContext, FC, useEffect, useMemo} from "react";
import {createHaper, HaperApi} from "haper";

export const haperContext = createContext<HaperApi | undefined>(undefined);

interface HaperProviderProps {
    baseUrl?: string
    onInit?: (haper: HaperApi) => any,
    haperInstance?: HaperApi
}

export const HaperProvider: FC<HaperProviderProps> = ({
                                                          children,
                                                          baseUrl,
                                                          onInit = () => {},
                                                          haperInstance
                                                      }) => {
    const haper = useMemo<HaperApi|undefined>(() => {
        if (haperInstance)
            return haperInstance;

        return createHaper({
            baseUrl
        });
    }, [baseUrl]);

    useEffect(() => {
        if (!haper)
            return;

        onInit(haper);
    }, [haper]);

    return <haperContext.Provider value={haper}>
        {children}
    </haperContext.Provider>
};