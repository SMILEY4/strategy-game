import {type ReactElement} from "react";
import {SimpleWindow} from "@modules/uicomponents/window/simple/SimpleWindow.tsx";
import {openWindow} from "@modules/uicomponents/window/useWindow.ts";
import {ANCHOR_CENTER_POINT} from "@modules/uicomponents/window/window-system.ts";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useInteraction} from "@modules/interaction/interaction.tools.ts";
import {CreateTileImprovementInteraction} from "@app/features/game/gameplay/create-tile-improvement.interaction.ts";
import {Selectbox} from "@modules/uicomponents/controls/selectbox/Selectbox.ts";
import styles from "./create-tile-improvement-window.module.less";

export function openWindowCreateTileImprovement(): string {
    const windowId = crypto.randomUUID();
    openWindow({
        id: windowId,
        anchor: ANCHOR_CENTER_POINT,
        resizable: {
            horizontal: true,
            vertical: false,
        },
        content: windowId => (
            <CreateTileImprovementWindow windowId={windowId}/>
        ),
    });
    return windowId;
}

interface CreateTileImprovementWindowProps {
    windowId: string;
}

export function CreateTileImprovementWindow(props: CreateTileImprovementWindowProps): ReactElement {

    const {windowId} = props;

    const viewModel = useCreateTileImprovementWindowViewModel();

    return (
        <SimpleWindow windowId={windowId} title={"Create Tile Improvement"} withCloseButton={false}>

            <VerticalLayout paddingS spacingM fillFlex fillWidth verticalStart horizontalStretch>

                <HorizontalLayout verticalCenter horizontalStart>

                    <Selectbox.Root
                        className={styles["select-administering-settlement"]}
                        items={viewModel.administeringSettlement.available}
                        selectedItem={viewModel.administeringSettlement.selected}
                        onSelectedItemChange={viewModel.administeringSettlement.select}
                        renderItem={item => (<Selectbox.Item key={item.key}>{item.key}</Selectbox.Item>)}
                    >
                        <Selectbox.Control sizeM stableSize box className={styles["select-administering-settlement"]}/>
                        <Selectbox.List/>
                    </Selectbox.Root>

                    <Button
                        neutral
                        sizeM
                        onClick={viewModel.administeringSettlement.pick}
                    >
                        Pick
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


interface CreateTileImprovementWindowViewModel {
    administeringSettlement: {
        available: { key: number}[]
        selected: { key: number },
        select: (item: { key: number }) => void
        pick: () => void,
    }
    cancel: {
        execute: () => void
    },
    create: {
        disabled: boolean
        execute: () => void
    }
}

function useCreateTileImprovementWindowViewModel(): CreateTileImprovementWindowViewModel {

    const [interactionContext, interactionEvents] = useInteraction(CreateTileImprovementInteraction);

    return {
        administeringSettlement: {
            available: interactionContext.availableSettlementEntityIds.map(id => ({key: id})),
            selected: {key: interactionContext.settlementEntityId ?? -1},
            select: entry => interactionEvents.SELECT_SETTLEMENT({settlementEntityId: entry.key}),
            pick: () => undefined, // todo
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