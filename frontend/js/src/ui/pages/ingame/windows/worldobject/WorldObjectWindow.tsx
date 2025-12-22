import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Button} from "../../../../components/button/Button";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";
import {UseWorldObjectWindow} from "./useWorldObjectWindow";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {VSpacer} from "../../../../components/spacer/Spacer";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {WorldObjectComponent} from "../../../../../models/worldobject/worldObjectComponent";

export interface WorldObjectWindowProps {
    windowId: string;
    identifier: WorldObject.Id | null;
}

export function WorldObjectWindow(props: WorldObjectWindowProps): ReactElement {

    const data: UseWorldObjectWindow.Data | null = UseWorldObjectWindow.useData(props.identifier);

    if (data === null) {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
                <Txt.Body center fullSize>
                    <Txt.String>No world object selected</Txt.String>
                </Txt.Body>
            </DecoratedWindow>
        );
    } else {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton withPinButton noPadding>
                <VBox fullSize scrollable>

                    <Banner
                        title={data.worldObject.type.group + "/" + data.worldObject.type.name}
                        subtitle={"World Object"}
                        color={data.worldObject.realm.color}
                        spaceAbove
                    >
                        <Button circle small onClick={data.open.tile}><Txt.Icon.Tile/></Button>
                        <Button circle small onClick={data.centerCamera}><Txt.Icon.Eye/></Button>
                    </Banner>

                    <VBox padding_l gap_m scrollable shrink>
                        {data.worldObject.realm.ownedByUser && (
                            <>
                                <Txt.Header2 center>
                                    <Txt.String>Actions</Txt.String>
                                </Txt.Header2>
                                <Divider line/>

                                <InsetPanel dontShrink dontGrow>
                                    <VBox padding_s gap_s fullSize>
                                        {data.actions.map(action => {

                                            if (action.type === "move") {
                                                return (
                                                    <Button disabled={!action.enabled} onClick={action.perform}
                                                            key={action.type}>
                                                        Move
                                                    </Button>
                                                );
                                            }

                                            if (action.type === "construct-tile-improvement") {
                                                return (
                                                    <Button disabled={!action.enabled} onClick={action.perform}
                                                            key={action.type}>
                                                        Construct Tile Improvement
                                                    </Button>
                                                );
                                            }

                                            if (action.type === "spawn-settlement") {
                                                return (
                                                    <Button disabled={!action.enabled} onClick={action.perform}
                                                            key={action.type}>
                                                        Spawn Settlement
                                                    </Button>
                                                );
                                            }

                                            if (action.type === "disband") {
                                                return (
                                                    <Button disabled={!action.enabled} onClick={action.perform}
                                                            key={action.type}>
                                                        Disband
                                                    </Button>
                                                );
                                            }

                                            if (action.type === "cancel-current-command") {
                                                return (
                                                    <Button disabled={!action.enabled} onClick={action.perform}
                                                            key={action.type}>
                                                        Cancel Command
                                                    </Button>
                                                );
                                            }

                                            // exhaustiveness check: syntax error in case of unhandled action type
                                            // noinspection UnnecessaryLocalVariableJS
                                            const _exhaustive: never = action;
                                            throw new Error("Unexpected action type: " + _exhaustive);
                                        })}
                                    </VBox>
                                </InsetPanel>

                            </>
                        )}
                    </VBox>

                    <VBox padding_l gap_s dontGrow dontShrink>

                        <VSpacer size_s/>
                        <Txt.Header2 center>
                            <Txt.String>Connections</Txt.String>
                        </Txt.Header2>
                        <Divider line/>

                        <InsetPanel dontShrink dontGrow>
                            <VBox padding_s gap_s fullSize>

                                {data.routes.length === 0 && (
                                    <Txt.Body center secondary>
                                        <Txt.String>No connected locations.</Txt.String>
                                    </Txt.Body>
                                )}

                                {data.routes.map(route => (
                                    <DecoratedPanel
                                        key={route.id}
                                        pattern
                                        blue
                                        background={<DecoratedPanel.ColorBackground color={route.realm.color.toCss()}/>}
                                    >
                                        <HBox fullSize padding_s gap_s>
                                            <Txt.Body>
                                                <Txt.String>to</Txt.String>
                                                <Txt.Whitespace/>
                                                <Txt.Link onClick={() => data.open.worldObject(route.id)}>
                                                    <Txt.String>{`${route.type.group}/${route.type.name}`}</Txt.String>
                                                </Txt.Link>
                                            </Txt.Body>
                                        </HBox>
                                    </DecoratedPanel>
                                ))}

                            </VBox>
                        </InsetPanel>
                    </VBox>

                    {(WorldObjectComponent.has(data.worldObject, WorldObjectComponent.Type.Production)) && (
                        <VBox padding_l gap_s dontGrow dontShrink>

                            <VSpacer size_s/>
                            <Txt.Header2 center>
                                <Txt.String>Production</Txt.String>
                            </Txt.Header2>
                            <Divider line/>

                            <HBox>
                                <Button onClick={() => data.productionQueue.add("worker")}>Add Worker</Button>
                                <Button onClick={() => data.productionQueue.add("scout")}>Add Scout</Button>
                            </HBox>

                            <InsetPanel dontShrink dontGrow>
                                {WorldObjectComponent.get(data.worldObject, WorldObjectComponent.Type.Production).queue.map((queueEntry, index) => (
                                    <Txt.Body>
                                        <Txt.String>{(index+1) + ") " + queueEntry.type}</Txt.String>
                                        <Txt.Whitespace/>
                                        <Txt.Percentage>{queueEntry.progress}</Txt.Percentage>
                                    </Txt.Body>
                                ))}
                            </InsetPanel>

                        </VBox>
                    )}


                    {(WorldObjectComponent.has(data.worldObject, WorldObjectComponent.Type.Economy)) && (
                        <VBox padding_l gap_s dontGrow dontShrink>

                            <VSpacer size_s/>
                            <Txt.Header2 center>
                                <Txt.String>Resources</Txt.String>
                            </Txt.Header2>
                            <Divider line/>

                            <Txt.Body center><Txt.String>Storage</Txt.String></Txt.Body>
                            <InsetPanel dontShrink dontGrow>
                                <VBox padding_s gap_s fullSize>
                                    {Object.entries(WorldObjectComponent.get(data.worldObject, WorldObjectComponent.Type.Economy).storage).map(([key, value]) => (
                                        <Txt.Body>
                                            <Txt.String>{key}</Txt.String>
                                            <Txt.String>: </Txt.String>
                                            <Txt.Number>{value}</Txt.Number>
                                        </Txt.Body>
                                    ))}
                                </VBox>
                            </InsetPanel>

                            <Txt.Body center><Txt.String>Entries</Txt.String></Txt.Body>
                            <InsetPanel dontShrink dontGrow>
                                <VBox padding_s gap_s fullSize>
                                    {WorldObjectComponent.get(data.worldObject, WorldObjectComponent.Type.Economy).entries.map(entry => (
                                        <Txt.Body>
                                            <Txt.String>{entry.name}</Txt.String>
                                            <Txt.String> Active: </Txt.String>
                                            <Txt.Boolean mode="yes/no">{entry.active}</Txt.Boolean>
                                        </Txt.Body>
                                    ))}
                                </VBox>
                            </InsetPanel>

                            <Txt.Body center><Txt.String>Economy Log</Txt.String></Txt.Body>
                            <InsetPanel dontShrink dontGrow>
                                <VBox padding_s gap_s fullSize>
                                    {WorldObjectComponent.get(data.worldObject, WorldObjectComponent.Type.Economy).log.map(logEntry => (
                                        <Txt.Body>
                                            <Txt.String>{logEntry.logType}</Txt.String>
                                            <Txt.String>: </Txt.String>
                                            <Txt.String>{logEntry.resourceType}</Txt.String>
                                            <Txt.String> </Txt.String>
                                            <Txt.Number>{logEntry.amount}</Txt.Number>
                                            <Txt.String> (</Txt.String>
                                            <Txt.String>{logEntry.entryName ?? "-"}</Txt.String>
                                            <Txt.String>)</Txt.String>
                                        </Txt.Body>
                                    ))}
                                </VBox>
                            </InsetPanel>

                        </VBox>
                    )}

                </VBox>
            </DecoratedWindow>
        );
    }

}
