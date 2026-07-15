import * as React from "react";
import {createContext} from "react";
import type {SelectboxData} from "@modules/uicomponents/controls/selectbox/useSelectbox.ts";

interface ContextType {
    data: SelectboxData;
}

export const SelectboxContext = createContext<ContextType | null>(null);

export function useSelectboxContext(): ContextType {
    const context = React.useContext(SelectboxContext);
    if (!context) {
        throw new Error("Context must be used within a provider");
    }
    return context;
}

