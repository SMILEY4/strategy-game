import {useRegisterViewModel} from "@pages/register/register.view-model.ts";
import {useTranslation} from "react-i18next";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useRouting} from "@pages/routing.tsx";
import {Link} from "react-router";

export function RegisterPage() {

    const viewModel = useRegisterViewModel();
    const {urlLogin} = useRouting();
    const {t} = useTranslation("register");

    return (
        <VerticalLayout center fillWidth fillHeight>
            <VerticalLayout verticalStart horizontalStretch spacingS>
                <input
                    placeholder={t("username.placeholder")}
                    value={viewModel.username.value}
                    onChange={e => viewModel.username.onChange(e.target.value)}
                />
                <input
                    placeholder={t("password.placeholder")}
                    value={viewModel.password.value}
                    onChange={e => viewModel.password.onChange(e.target.value)}
                />
                <input
                    placeholder={t("passwordConfirmation.placeholder")}
                    value={viewModel.passwordConfirmation.value}
                    onChange={e => viewModel.passwordConfirmation.onChange(e.target.value)}
                />
                <button onClick={viewModel.register.submit}>{t("submit")}</button>
                <Link to={urlLogin()}>Log-In</Link>
            </VerticalLayout>
        </VerticalLayout>
    );


}