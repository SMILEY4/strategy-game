import classNames from "classnames";
import {type ComponentPropsWithoutRef, type ReactElement, useState} from "react";
import "./textField.less";
import { TextFieldContext } from "./TextField.Context";


type TextField_RootProps = {
        type?: "text" | "password",
    }
    & ComponentPropsWithoutRef<"div">


export function TextField_Root(props: TextField_RootProps): ReactElement {

    const {
        className,
        children,
        type,

        // safe DOM props
        ...rest
    } = props;

    const [typeInternal, setTypeInternal] = useState(type);

    return (
        <TextFieldContext.Provider value={{
            type: typeInternal,
            setType: setTypeInternal,
        }}>
            <div
                className={classNames("text-field__root", className)}
                {...rest}
            >
                {children}
            </div>
        </TextFieldContext.Provider>
    );
}

TextField_Root.displayName = "TextField.Root";

