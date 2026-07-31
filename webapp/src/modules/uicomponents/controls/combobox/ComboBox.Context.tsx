import * as React from "react";
import {createContext} from "react";
import type {ComboboxData} from "@components/styled/combobox/useCombobox.ts";

interface ContextType {
    data: ComboboxData
}

export const ComboBoxContext = createContext<ContextType | null>(null);

export function useComboBoxContext(): ContextType {
    const context = React.useContext(ComboBoxContext);
    if (!context) {
        throw new Error("Context must be used within a provider");
    }
    return context;
}

