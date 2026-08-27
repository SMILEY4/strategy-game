import {type ReactElement} from "react";
import {SimpleWindow} from "@modules/uicomponents/window/simple/SimpleWindow.tsx";
import {openWindow} from "@modules/uicomponents/window/useWindow.ts";
import {ANCHOR_CENTER_POINT} from "@modules/uicomponents/window/window-system.ts";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useInteraction} from "@modules/interaction/interaction.tools.ts";
import {CreateSettlementInteraction} from "@app/features/game/gameplay/create-settlement.interaction.ts";


export function openWindowCreateSettlement(): string {
    const windowId = crypto.randomUUID();
    openWindow({
        id: windowId,
        anchor: ANCHOR_CENTER_POINT,
        resizable: {
            horizontal: true,
            vertical: false,
        },
        content: windowId => (
            <CreateSettlementWindow windowId={windowId}/>
        ),
    });
    return windowId;
}

interface CreateSettlementWindowProps {
    windowId: string;
}

export function CreateSettlementWindow(props: CreateSettlementWindowProps): ReactElement {

    const {windowId} = props;

    const viewModel = useCreateSettlementWindowViewModel();

    return (
        <SimpleWindow windowId={windowId} title={"Found Settlement"} withCloseButton={false}>

            <VerticalLayout paddingS spacingM fillFlex fillWidth verticalStart horizontalStretch>


                <HorizontalLayout>
                    <TextField.Root>
                        <TextField.Control sizeM>
                            <TextField.Input
                                placeholder={"settlement.name.placeholder"}
                                value={viewModel.name.value}
                                onValueChange={viewModel.name.onChange}
                                onConfirm={viewModel.name.onCommit}
                            />
                        </TextField.Control>
                    </TextField.Root>
                    <Button
                        neutral
                        sizeM
                        onClick={viewModel.name.randomize}
                    >
                        Random
                    </Button>
                </HorizontalLayout>


                <HorizontalLayout verticalCenter horizontalEnd spacingXs>

                    <Button
                        neutral
                        sizeM
                        onClick={viewModel.cancel.execute}
                    >
                        Cancel
                    </Button>

                    <Button
                        success
                        sizeM
                        disabled={viewModel.create.disabled}
                        onClick={viewModel.create.execute}
                    >
                        Create
                    </Button>

                </HorizontalLayout>

            </VerticalLayout>
        </SimpleWindow>
    );
}


interface CreateSettlementWindowViewModel {
    name: {
        randomize: () => void,
        onChange: (value: string) => void,
        onCommit: (value: string) => void,
        value: string,
    },
    cancel: {
        execute: () => void
    },
    create: {
        disabled: boolean
        execute: () => void
    }
}

function useCreateSettlementWindowViewModel(): CreateSettlementWindowViewModel {

    const [interactionContext, interactionEvents] = useInteraction(CreateSettlementInteraction);

    return {
        name: {
            randomize: () => interactionEvents.RANDOMIZE_NAME({}),
            onChange: name => interactionEvents.SELECT_NAME({name: name}),
            onCommit: name => interactionEvents.SELECT_NAME({name: name}),
            value: interactionContext.name ?? "",
        },
        cancel: {
            execute: () => interactionEvents.ABORT({}),
        },
        create: {
            disabled: false,
            execute: () => interactionEvents.CONFIRM({}),
        },
    };
}