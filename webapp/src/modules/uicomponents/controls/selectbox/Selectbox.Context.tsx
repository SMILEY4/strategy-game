import * as React from "react";
import {createContext, type ReactElement} from "react";
import type {SelectboxData, SelectboxItem} from "@modules/uicomponents/controls/selectbox/useSelectbox.ts";

interface ContextType {
    data: SelectboxData;
    items: SelectboxItem[];
    renderItem: ((item: SelectboxItem) => ReactElement);
}

export const SelectboxContext = createContext<ContextType | null>(null);

export function useSelectboxContext(): ContextType {
    const context = React.useContext(SelectboxContext);
    if (!context) {
        throw new Error("Context must be used within a provider");
    }
    return context;
}
