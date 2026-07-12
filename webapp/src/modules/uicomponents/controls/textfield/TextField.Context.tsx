import * as React from "react";
import {createContext} from "react";

interface ContextType {
    type?: "text" | "password",
    setType: (type: "text" | "password") => void,
}

export const TextFieldContext = createContext<ContextType | null>(null);

export function useTextFieldContext(): ContextType {
    const context = React.useContext(TextFieldContext);
    if (!context) {
        throw new Error("Context must be used within a provider");
    }
    return context;
}

