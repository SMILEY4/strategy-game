import {useState} from "react";
import {useAction} from "@modules/uicomponents/hooks/useAction.ts";
import {DI} from "@app/app.ts";
import {useRouting} from "@pages/routing.tsx";
import {useValidatedInput, type ValidationResult} from "@modules/uicomponents/hooks/useValidatedInputState.ts";
import {UserValidations} from "@app/features/user/user.validations.ts";
import {AppError} from "@app/app-error.ts";

interface LoginViewModel {
    username: {
        onChange: (value: string) => void,
        onCommit: (value: string) => void,
        value: string,
        dirty: boolean,
        validation: ValidationResult<"empty" | "wrongCredentials">,
    },
    password: {
        onChange: (value: string) => void,
        onCommit: (value: string) => void,
        value: string,
        dirty: boolean,
        validation: ValidationResult<"empty" | "wrongCredentials">,
    },
    login: {
        submit: () => void,
        loading: boolean
    },
    formValid: boolean,
    generalError: undefined | string,
}

/** View-model for the login page, managing form state and validation. */
export function useLoginViewModel(): LoginViewModel {

    const username = useValidatedInput<"empty" | "wrongCredentials">(
        {valid: false, reason: "empty"},
        value => UserValidations.username(value),
    );

    const password = useValidatedInput<"empty" | "wrongCredentials">(
        {valid: false, reason: "empty"},
        value => UserValidations.password(value),
    );

    const [generalError, setGeneralError] = useState<undefined | string>(undefined);

    const isFormValid = username.validation.valid && password.validation.valid;

    const [login, loginLoading] = useAction((username: string, password: string) => DI.logInUseCase.execute(username, password));

    const {gotoMatchList} = useRouting();

    function handleSubmit() {
        if (!isFormValid) {
            return Promise.resolve();
        }
        login(username.value, password.value)
            .then(() => gotoMatchList())
            .catch(error => {
                if (error instanceof AppError) {
                    if (error.errorCode === "INCORRECT_USERNAME_OR_PASSWORD") {
                        username.setValidation({valid: false, reason: "wrongCredentials"});
                        password.setValidation({valid: false, reason: "wrongCredentials"});
                        return;
                    }
                }
                console.warn("Encountered unexpected error on login", error);
                setGeneralError("unknown");
            });
    }

    return {
        username: {
            onChange: username.onChange,
            onCommit: username.onCommit,
            value: username.value,
            dirty: username.dirty,
            validation: username.validation,
        },
        password: {
            onChange: password.onChange,
            onCommit: password.onCommit,
            value: password.value,
            dirty: password.dirty,
            validation: password.validation,
        },
        login: {
            submit: handleSubmit,
            loading: loginLoading,
        },
        formValid: isFormValid,
        generalError: generalError,
    };

}