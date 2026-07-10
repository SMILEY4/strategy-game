import type {ReactElement, ReactNode, SyntheticEvent} from "react";
import classNames from "classnames";

export interface FormProps {
    onSubmit?: () => void;
    className?: string;
    children?: ReactNode;
}

export function Form(props: FormProps): ReactElement {

    function handleOnSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        props.onSubmit?.();
    }


    return (
        <form
            className={classNames("hl-form", props.className)}
            onSubmit={handleOnSubmit}
        >
            {props.children}
        </form>
    );
}