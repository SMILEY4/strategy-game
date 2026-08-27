import {type ReactElement, useState} from "react";
import {SimpleWindow} from "@modules/uicomponents/window/simple/SimpleWindow.tsx";
import {openWindow} from "@modules/uicomponents/window/useWindow.ts";
import {ANCHOR_CENTER_POINT} from "@modules/uicomponents/window/window-system.ts";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useInteractionContext, useInteractionEvents} from "@modules/interaction/interaction.tools.ts";
import {InteractionCreateSettlement} from "@app/features/game/interactions/interaction.create-settlement.ts";


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

                <TextField.Root>
                    <TextField.Control sizeL>
                        <TextField.Input
                            placeholder={"settlement.name.placeholder"}
                            value={viewModel.name.value}
                            onValueChange={viewModel.name.onChange}
                            onConfirm={viewModel.name.onCommit}
                        />
                    </TextField.Control>
                </TextField.Root>

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

    const interactionContext = useInteractionContext(InteractionCreateSettlement)

    const interactionEvents = useInteractionEvents(InteractionCreateSettlement)

    interactionEvents.SELECT_NAME({})

    return {
        name: {
            onChange: setName,
            onCommit: setName,
            value: interaction.name ?? "",
        },
        cancel: {
            execute: () => undefined,
        },
        create: {
            disabled: false,
            execute: () => undefined,
        },
    };
}