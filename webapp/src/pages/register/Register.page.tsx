import {useRegisterViewModel} from "@pages/register/register.view-model.ts";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useRouting} from "@pages/routing.tsx";
import {Panel} from "@modules/uicomponents/panel/Panel.tsx";
import {Txt} from "@modules/uicomponents/text/Txt.tsx";
import {Separator} from "@modules/uicomponents/separator/Separator.tsx";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {Selectbox} from "@modules/uicomponents/controls/selectbox/Selectbox.ts";
import {useLanguage} from "@modules/uicomponents/hooks/useLanguage.ts";
import {useTranslation} from "react-i18next";

export function RegisterPage() {

    const viewModel = useRegisterViewModel();
    const {urlLogin} = useRouting();
    const {t} = useTranslation("register");

    const {languages, setLanguage, selectedLanguage} = useLanguage();

    return (
        <VerticalLayout center fillWidth fillHeight>
            <Panel.Decorated neutral noBorder sharpCorner paperPattern fillParent>

                <VerticalLayout center fillWidth fillHeight paddingL>
                    <Panel.Decorated
                        neutral ornamentalBorder roundedCorner paperPattern fillParent
                        overlay={{
                            url: "/images/backgrounds/scenery_2.png",
                            direction: "fill",
                        }}
                    >

                        <VerticalLayout center fillWidth fillHeight paddingL>
                            <Panel.Decorated neutral ornamentalBorder roundedCorner paperPattern>
                                <VerticalLayout verticalStart horizontalStretch paddingXl spacingM>

                                    <VerticalLayout verticalStart horizontalCenter spacing3xs>
                                        <Txt.Heading h1><Txt.String>{t("header.title")}</Txt.String></Txt.Heading>
                                        <Txt.Line><Txt.String>{t("header.subtitle")}</Txt.String></Txt.Line>
                                    </VerticalLayout>

                                    <Separator horizontal invisible sizeS/>

                                    <TextField.Root>
                                        <TextField.Control sizeL>
                                            <TextField.Input
                                                placeholder={t("username.placeholder")}
                                                value={viewModel.username.value}
                                                onValueChange={viewModel.username.onChange}
                                                onConfirm={viewModel.username.onCommit}

                                            />
                                        </TextField.Control>
                                        <TextField.Message negative>
                                            {
                                                viewModel.username.validation.valid
                                                    ? undefined
                                                    : t(`username.error.${viewModel.username.validation.reason}`)
                                            }
                                        </TextField.Message>
                                    </TextField.Root>

                                    <TextField.Root type="password">
                                        <TextField.Control sizeL>
                                            <TextField.Input
                                                placeholder={t("password.placeholder")}
                                                value={viewModel.password.value}
                                                onValueChange={viewModel.password.onChange}
                                                onConfirm={viewModel.password.onCommit}
                                            />
                                            <TextField.ShowPassword/>
                                        </TextField.Control>
                                        <TextField.Message negative>
                                            {
                                                viewModel.password.validation.valid
                                                    ? undefined
                                                    : t(`password.error.${viewModel.password.validation.reason}`)
                                            }
                                        </TextField.Message>
                                    </TextField.Root>

                                    <TextField.Root type="password">
                                        <TextField.Control sizeL>
                                            <TextField.Input
                                                placeholder={t("passwordConfirmation.placeholder")}
                                                value={viewModel.passwordConfirmation.value}
                                                onValueChange={viewModel.passwordConfirmation.onChange}
                                                onConfirm={viewModel.passwordConfirmation.onCommit}
                                            />
                                            <TextField.ShowPassword/>
                                        </TextField.Control>
                                        <TextField.Message negative>
                                            {
                                                viewModel.passwordConfirmation.validation.valid
                                                    ? undefined
                                                    : t(`passwordConfirmation.error.${viewModel.passwordConfirmation.validation.reason}`)
                                            }
                                        </TextField.Message>
                                    </TextField.Root>

                                    <VerticalLayout verticalStart horizontalStretch spacing2xs>

                                        <Button
                                            sizeL
                                            disabled={!viewModel.formValid}
                                            onClick={viewModel.register.submit}
                                        >
                                            {t("submit")}
                                        </Button>

                                        {viewModel.generalError && (
                                            <Txt.Body>
                                                <Txt.String negative>{t("error.unknown")}</Txt.String>
                                            </Txt.Body>
                                        )}

                                    </VerticalLayout>

                                    <Separator horizontal invisible sizeS/>

                                    <Txt.Line center>
                                        <Txt.String>{t("infoLogIn.question")}</Txt.String>
                                        <Txt.Link to={urlLogin()}>{t("infoLogIn.action")}</Txt.Link>
                                    </Txt.Line>

                                </VerticalLayout>
                            </Panel.Decorated>
                        </VerticalLayout>

                        <div style={{position: "absolute", top: 24, right: 24}}>
                            <Selectbox.Root
                                items={languages}
                                selectedItem={selectedLanguage}
                                onSelectedItemChange={setLanguage}
                                renderItem={item => (<Selectbox.Item key={item.key}>{item.flag + " " + item.name}</Selectbox.Item>)}
                            >
                                <Selectbox.Control sizeM stableSize box/>
                                <Selectbox.List/>
                            </Selectbox.Root>
                        </div>

                    </Panel.Decorated>
                </VerticalLayout>

            </Panel.Decorated>
        </VerticalLayout>
    );
}