import {type ReactElement} from "react";
import styles from "./textField.module.less";
import {useTextFieldContext} from "@modules/uicomponents/controls/textfield/TextField.Context.tsx";
import { Icon } from "@modules/uicomponents/icon/Icon";


export function TextField_ShowPassword(): ReactElement {

    const {
        type,
        setType,
    } = useTextFieldContext();

    function setShowPassword(show: boolean) {
        setType(show ? "text" : "password");
    }

    return (
        <div
            className={styles["text-field__show-password"]}
            onPointerDown={() => setShowPassword(true)}
            onPointerUp={() => setShowPassword(false)}
            onPointerLeave={() => setShowPassword(false)}
            onPointerCancel={() => setShowPassword(false)}
        >
            {type === "password"
                ? <Icon.EyeSlash/>
                : <Icon.Eye/>}
        </div>
    );
}

TextField_ShowPassword.displayName = "TextField.ShowPassword";

