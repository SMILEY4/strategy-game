import {useLoginViewModel} from "@pages/login/login.view-model.ts";
import {useTranslation} from "react-i18next";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";

export function LoginPage() {

    const viewModel = useLoginViewModel();
    const {t} = useTranslation("login");

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
                <button onClick={viewModel.login.submit}>{t("submit")}</button>
            </VerticalLayout>
        </VerticalLayout>
    );


}