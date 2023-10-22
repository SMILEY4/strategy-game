import React, {ReactElement} from "react";
import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Banner} from "../../../../components/banner/Banner";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {KeyTextValuePair, KeyValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {Tile, TileIdentifier} from "../../../../../models/tile";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {usePlaceScout} from "../../../../hooks/game/scout";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import {useOpenCityWindow} from "../city/CityMenu";
import {useOpenCountryWindow} from "../country/CountryWindow";
import {useOpenSettlementCreationWindow} from "./SettlementCreationWindow";
import {Spacer} from "../../../../components/spacer/Spacer";
import {useValidateCreateSettlement} from "../../../../hooks/game/city";
import {GameStateAccess} from "../../../../../state/access/GameStateAccess";
import {Text} from "../../../../components/text/Text";


export function useOpenTileWindow() {
    const WINDOW_ID = "menubar-window";
    const addWindow = useOpenWindow();
    return (identifier: TileIdentifier | null) => {
        addWindow({
            id: WINDOW_ID,
            className: "tile-window",
            left: 25,
            top: 60,
            bottom: 25,
            width: 360,
            content: <TileWindow windowId={WINDOW_ID} identifier={identifier}/>,
        });
    };
}

export function openTileWindow(identifier: TileIdentifier) {
    const WINDOW_ID = "menubar-window";
    openWindow({
        id: WINDOW_ID,
        className: "tile-window",
        left: 25,
        top: 60,
        bottom: 25,
        width: 360,
        content: <TileWindow windowId={WINDOW_ID} identifier={identifier}/>,
    });
}

export interface TileWindowProps {
    windowId: string;
    identifier: TileIdentifier | null;
}

export function TileWindow(props: TileWindowProps): ReactElement {

    const selectedTileIdentifier = GameStateAccess.useSelectedTile();
    const tileIdentifier = props.identifier === null ? selectedTileIdentifier : props.identifier

    const tile = GameStateAccess.useTileById(tileIdentifier);

    const openCity = useOpenCityWindow();
    const openCountry = useOpenCountryWindow();
    const openSettlementCreation = useOpenSettlementCreationWindow();
    const validCreateSettlement = useValidateCreateSettlement(tile, "placeholder", false);
    const validCreateColony = useValidateCreateSettlement(tile, "placeholder", true);
    const placeScout = usePlaceScout();

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
                {tile && (
                    <>
                        <TileBanner data={tile}/>
                        <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                            <TileBaseDataSection
                                data={tile}
                                openCountry={() => openCountry(tile.owner!!.country.id, true)}
                                openCity={() => openCity(tile.owner!!.city!!.id, true)}
                            />
                            <Spacer size="s"/>
                            <ButtonPrimary blue onClick={() => placeScout(tile.identifier)}>
                                Place Scout
                            </ButtonPrimary>
                            <ButtonPrimary
                                blue
                                disabled={!validCreateColony}
                                onClick={() => openSettlementCreation(tile, true)}
                            >
                                Found Colony
                            </ButtonPrimary>
                            <ButtonPrimary
                                blue
                                disabled={!validCreateSettlement}
                                onClick={() => openSettlementCreation(tile, false)}
                            >
                                Found Settlement
                            </ButtonPrimary>
                        </VBox>
                    </>
                )}
                {!tile && (
                    <Text>No tile selected</Text>
                )}
            </VBox>
        </DecoratedWindow>
    );
}

function TileBanner(props: { data: Tile }): ReactElement {
    return (
        <Banner spaceAbove>
            <Header1 centered>{props.data.terrainType || "Unknown"}</Header1>
        </Banner>
    );
}

function TileBaseDataSection(props: { data: Tile, openCountry: () => void, openCity: () => void }): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair
                name={"Id"}
                value={props.data.identifier.id}
            />
            <KeyTextValuePair
                name={"Position"}
                value={props.data.identifier.q + ", " + props.data.identifier.r}
            />
            <KeyTextValuePair
                name={"Terrain"}
                value={props.data.terrainType}
            />
            {(props.data.owner && props.data.owner.city !== null) && (
                <KeyValuePair name={"Owned By"}>
                    <HBox gap_xs left>
                        <LinkButton align="left"
                                    onClick={props.openCountry}>{props.data.owner.country.name}</LinkButton>
                        (
                        <LinkButton align="left" onClick={props.openCity}>{props.data.owner.city!!.name}</LinkButton>
                        )
                    </HBox>
                </KeyValuePair>
            )}
            {(props.data.owner && props.data.owner.city === null) && (
                <KeyValuePair name={"Owned By"}>
                    <HBox gap_xs left>
                        <LinkButton align="left"
                                    onClick={props.openCountry}>{props.data.owner.country.name}</LinkButton>
                    </HBox>
                </KeyValuePair>
            )}
        </InsetPanel>
    );
}