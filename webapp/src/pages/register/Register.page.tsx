import {useRegisterViewModel} from "@pages/register/register.view-model.ts";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useRouting} from "@pages/routing.tsx";
import {Panel} from "@modules/uicomponents/panel/Panel.tsx";
import {Txt} from "@modules/uicomponents/text/Txt.tsx";
import {Separator} from "@modules/uicomponents/separator/Separator.tsx";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";

export function RegisterPage() {

    const viewModel = useRegisterViewModel();
    const {urlLogin} = useRouting();
    // const {t} = useTranslation("register");

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
                                        <Txt.Heading h1><Txt.String>Create Your Account</Txt.String></Txt.Heading>
                                        <Txt.Line><Txt.String>Shape your world's history.</Txt.String></Txt.Line>
                                    </VerticalLayout>

                                    <Separator horizontal invisible sizeS/>

                                    <TextField.Root>
                                        <TextField.Control sizeL>
                                            <TextField.Input
                                                placeholder="Username"
                                                value={viewModel.username.value}
                                                onValueChange={viewModel.username.onChange}
                                                onConfirm={viewModel.username.onCommit}

                                            />
                                        </TextField.Control>
                                    </TextField.Root>

                                    <TextField.Root type="password">
                                        <TextField.Control sizeL>
                                            <TextField.Input
                                                placeholder="Password"
                                                value={viewModel.password.value}
                                                onValueChange={viewModel.password.onChange}
                                                onConfirm={viewModel.password.onCommit}
                                            />
                                            <TextField.ShowPassword/>
                                        </TextField.Control>
                                    </TextField.Root>

                                    <TextField.Root type="password">
                                        <TextField.Control sizeL>
                                            <TextField.Input
                                                placeholder="Confirm Password"
                                                value={viewModel.passwordConfirmation.value}
                                                onValueChange={viewModel.passwordConfirmation.onChange}
                                                onConfirm={viewModel.passwordConfirmation.onCommit}
                                            />
                                            <TextField.ShowPassword/>
                                        </TextField.Control>
                                    </TextField.Root>

                                    <Button sizeL onClick={viewModel.register.submit}>Create Account</Button>

                                    <Separator horizontal invisible sizeS/>

                                    <Txt.Line center>
                                        <Txt.String>Already have an account?</Txt.String>
                                        <Txt.Link to={urlLogin()}>Sign In</Txt.Link>
                                    </Txt.Line>

                                </VerticalLayout>
                            </Panel.Decorated>
                        </VerticalLayout>

                    </Panel.Decorated>
                </VerticalLayout>

            </Panel.Decorated>
        </VerticalLayout>
    )
}