import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Banner} from "../../../../components/banner/Banner";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {KeyTextValuePair, KeyValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {TileIdentifier} from "../../../../../models/tile";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import {Spacer} from "../../../../components/spacer/Spacer";
import {Text} from "../../../../components/text/Text";
import {BasicTooltip} from "../../../../components/tooltip/BasicTooltip";
import {UseTileWindow} from "./useTileWindow";

export interface TileWindowProps {
    windowId: string;
    identifier: TileIdentifier | null;
}

export function TileWindow(props: TileWindowProps): ReactElement {

    const data: UseTileWindow.Data | null = UseTileWindow.useData(props.identifier);

    return (
        <DecoratedWindow
            windowId={props.windowId}
            className={"window-tile"}
            withCloseButton
            noPadding
            style={{
                minWidth: "fit-content",
                minHeight: "250px",
            }}
        >
            <VBox fillParent>
                {data && (
                    <>
                        <TileBanner {...data}/>
                        <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                            <BaseInformation {...data}/>
                            <Spacer size="s"/>
                            <PlaceScoutButton {...data}/>
                            <CreateColonyButton {...data}/>
                            <CreateSettlementButton {...data}/>
                        </VBox>
                    </>
                )}
                {!data && (
                    <VBox fillParent center>
                        <Text>No tile selected</Text>
                    </VBox>
                )}
            </VBox>
        </DecoratedWindow>
    );
}

function TileBanner(props: UseTileWindow.Data): ReactElement {
    return (
        <Banner spaceAbove subtitle={"Tile"}>
            <Header1 centered>{props.tile.terrainType || "Unknown"}</Header1>
        </Banner>
    );
}

function BaseInformation(props: UseTileWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair
                name={"Id"}
                value={props.tile.identifier.id}
            />
            <KeyTextValuePair
                name={"Position"}
                value={props.tile.identifier.q + ", " + props.tile.identifier.r}
            />
            <KeyTextValuePair
                name={"Terrain"}
                value={props.tile.terrainType}
            />
            {(props.tile.owner && props.tile.owner.city !== null) && (
                <KeyValuePair name={"Owned By"}>
                    <HBox gap_xs left>
                        <LinkButton align="left" onClick={props.openWindow.country}>
                            {props.tile.owner.country.name}
                        </LinkButton>
                        <LinkButton align="left" onClick={props.openWindow.city}>
                            {props.tile.owner.city!!.name}
                        </LinkButton>
                    </HBox>
                </KeyValuePair>
            )}
            {(props.tile.owner && props.tile.owner.city === null) && (
                <KeyValuePair name={"Owned By"}>
                    <HBox gap_xs left>
                        <LinkButton align="left" onClick={props.openWindow.country}>
                            {props.tile.owner.country.name}
                        </LinkButton>
                    </HBox>
                </KeyValuePair>
            )}
        </InsetPanel>
    );
}


function PlaceScoutButton(props: UseTileWindow.Data): ReactElement {
    return (
        <ButtonPrimary blue onClick={props.scout.place}>
            Place Scout
        </ButtonPrimary>
    );
}



function CreateColonyButton(props: UseTileWindow.Data): ReactElement {
    return (
        <BasicTooltip
            enabled={!props.createColony.valid}
            delay={500}
            content={
                <ul>
                    {props.createColony.reasonsInvalid.map((e, i) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            }
        >
            <ButtonPrimary
                blue
                disabled={!props.createColony.valid}
                onClick={props.openWindow.createColony}
            >
                Found Colony
            </ButtonPrimary>
        </BasicTooltip>
    );
}



function CreateSettlementButton(props: UseTileWindow.Data): ReactElement {
    return (
        <BasicTooltip
            enabled={!props.createSettlement.valid}
            delay={500}
            content={
                <ul>
                    {props.createSettlement.reasonsInvalid.map((e,i) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            }
        >
            <ButtonPrimary
                blue
                disabled={!props.createSettlement.valid}
                onClick={props.openWindow.createSettlement}
            >
                Found Settlement
            </ButtonPrimary>
        </BasicTooltip>
    );
}
