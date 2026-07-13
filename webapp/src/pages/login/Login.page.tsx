import {useLoginViewModel} from "@pages/login/login.view-model.ts";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useRouting} from "@pages/routing.tsx";
import {Panel} from "@/modules/uicomponents/panel/Panel";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {Txt} from "@/modules/uicomponents/text/Txt";
import {Checkbox} from "@modules/uicomponents/controls/checkbox/Checkbox.tsx";
import {Separator} from "@modules/uicomponents/separator/Separator.tsx";
import {useTranslation} from "react-i18next";

export function LoginPage() {

    const viewModel = useLoginViewModel();
    const {urlRegister} = useRouting();
    const {t} = useTranslation("login");

    return (
        <VerticalLayout center fillWidth fillHeight>
            <Panel.Decorated neutral noBorder sharpCorner paperPattern fillParent>

                <VerticalLayout center fillWidth fillHeight paddingL>
                    <Panel.Decorated
                        neutral ornamentalBorder roundedCorner paperPattern fillParent
                        overlay={{
                            url: "/images/backgrounds/scenery_1.png",
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
                                                onValueChange={value => viewModel.password.onChange(value)}
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

                                    <Checkbox sizeS>{t("rememberMe")}</Checkbox>

                                    <Separator horizontal invisible none/>

                                    <VerticalLayout verticalStart horizontalStretch spacing2xs>

                                        <Button
                                            sizeL
                                            disabled={!viewModel.formValid}
                                            onClick={viewModel.login.submit}
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
                                        <Txt.String>{t("infoRegister.question")}</Txt.String>
                                        <Txt.Link to={urlRegister()}>{t("infoRegister.action")}</Txt.Link>
                                    </Txt.Line>

                                </VerticalLayout>
                            </Panel.Decorated>
                        </VerticalLayout>

                    </Panel.Decorated>
                </VerticalLayout>

            </Panel.Decorated>
        </VerticalLayout>
    );
}