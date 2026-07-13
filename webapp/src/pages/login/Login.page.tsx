import {useLoginViewModel} from "@pages/login/login.view-model.ts";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useRouting} from "@pages/routing.tsx";
import { Panel } from "@/modules/uicomponents/panel/Panel";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import { Txt } from "@/modules/uicomponents/text/Txt";
import {Checkbox} from "@modules/uicomponents/controls/checkbox/Checkbox.tsx";
import {Separator} from "@modules/uicomponents/separator/Separator.tsx";

export function LoginPage() {

    const viewModel = useLoginViewModel();
    const {urlRegister} = useRouting();
    // const {t} = useTranslation("login");

    return (
        <VerticalLayout center fillWidth fillHeight>
            <Panel.Decorated
                border="none"
                corner="sharp"
                pattern="paper"
                variant="neutral"
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >

                <VerticalLayout center fillWidth fillHeight padding="l">
                    <Panel.Decorated
                        border="ornamental"
                        corner="rounded"
                        pattern="paper"
                        variant="neutral"
                        overlay={{
                            url: "/images/backgrounds/scenery_1.png",
                            direction: "fill"
                        }}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    >

                        <VerticalLayout center fillWidth fillHeight padding="l">
                            <Panel.Decorated
                                border="ornamental"
                                corner="rounded"
                                pattern="paper"
                                variant="neutral"
                            >
                                <VerticalLayout verticalStart horizontalStretch padding="xl" spacing="m">

                                    <VerticalLayout verticalStart horizontalCenter spacing="3xs">
                                        <Txt.Heading h1><Txt.String>Welcome Back</Txt.String></Txt.Heading>
                                        <Txt.Line><Txt.String>Sign in to continue your journey.</Txt.String></Txt.Line>
                                    </VerticalLayout>

                                    <Separator horizontal invisible sizeS/>

                                    <TextField.Root>
                                        <TextField.Control sizeL>
                                            <TextField.Input
                                                placeholder="Username"
                                                value={viewModel.username.value}
                                                onValueChange={value => viewModel.username.onChange(value)}
                                            />
                                        </TextField.Control>
                                    </TextField.Root>

                                    <TextField.Root type="password">
                                        <TextField.Control sizeL>
                                            <TextField.Input
                                                placeholder="Password"
                                                value={viewModel.password.value}
                                                onValueChange={value => viewModel.password.onChange(value)}
                                            />
                                            <TextField.ShowPassword/>
                                        </TextField.Control>
                                    </TextField.Root>

                                    <Checkbox sizeS>Remember Me</Checkbox>

                                    <Button sizeL onClick={viewModel.login.submit}>Login</Button>

                                    <Separator horizontal invisible sizeS/>

                                    <Txt.Line center>
                                        <Txt.String>Don't have an account?</Txt.String>
                                        <Txt.Link to={urlRegister()}>Create Account</Txt.Link>
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