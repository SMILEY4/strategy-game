import {useState} from "react";
import {useValidatedInput, type ValidationResult} from "@modules/uicomponents/hooks/useValidatedInputState.ts";
import {UserValidations} from "@app/features/user/user.validations.ts";
import {useAction} from "@modules/uicomponents/hooks/useAction.ts";
import {DI} from "@app/app.ts";
import {AppError} from "@app/app-error.ts";
import {useRouting} from "@pages/routing.tsx";

interface RegisterViewModel {
    username: {
        onChange: (value: string) => void,
        onCommit: (value: string) => void,
        value: string,
        dirty: boolean,
        validation: ValidationResult<"empty" | "INVALID_USERNAME" | "USERNAME_TAKEN">
    },
    password: {
        onChange: (value: string) => void,
        onCommit: (value: string) => void,
        value: string,
        dirty: boolean,
        validation: ValidationResult<"empty" | "INVALID_PASSWORD">
    },
    passwordConfirmation: {
        onChange: (value: string) => void,
        onCommit: (value: string) => void,
        value: string,
        dirty: boolean,
        validation: ValidationResult<"empty" | "mismatch">
    },
    register: {
        submit: () => void,
        loading: boolean
    },
    formValid: boolean,
    generalError: undefined | string,
}

export function useRegisterViewModel(): RegisterViewModel {

    const username = useValidatedInput<"empty" | "INVALID_USERNAME" | "USERNAME_TAKEN">(
        {valid: true},
        value => UserValidations.username(value),
    );

    const password = useValidatedInput<"empty" | "INVALID_PASSWORD">(
        {valid: true},
        value => UserValidations.password(value),
    );

    const passwordConfirmation = useValidatedInput<"empty" | "mismatch">(
        {valid: true},
        value => UserValidations.passwordConfirmation(value, password.value),
    );

    const [generalError, setGeneralError] = useState<undefined | string>(undefined);

    const isFormValid = username.validation.valid && password.validation.valid && passwordConfirmation.validation.valid;

    const [register, registerLoading] = useAction((username: string, password: string) => DI.registerUseCase.execute(username, password));

    const {gotoLogin} = useRouting();

    function handleSubmit() {
        if (!isFormValid) {
            return Promise.resolve();
        }
        setGeneralError(undefined);
        register(username.value, password.value)
            .then(() => gotoLogin())
            .catch(error => {
                if (error instanceof AppError) {
                    if (error.errorCode === "INVALID_PASSWORD") {
                        password.setValidation({valid: false, reason: "INVALID_PASSWORD"});
                        return;
                    }
                    if (error.errorCode === "INVALID_USERNAME") {
                        username.setValidation({valid: false, reason: "INVALID_USERNAME"});
                        return;
                    }
                    if (error.errorCode === "USERNAME_ALREADY_TAKEN") {
                        username.setValidation({valid: false, reason: "USERNAME_TAKEN"});
                        return;
                    }
                }
                console.warn("Encountered unexpected error on registration", error);
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
        passwordConfirmation: {
            onChange: passwordConfirmation.onChange,
            onCommit: passwordConfirmation.onCommit,
            value: passwordConfirmation.value,
            dirty: passwordConfirmation.dirty,
            validation: passwordConfirmation.validation,
        },
        register: {
            submit: handleSubmit,
            loading: registerLoading,
        },
        formValid: isFormValid,
        generalError: generalError,
    }

}