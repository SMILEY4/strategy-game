import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Banner} from "../../../../components/banner/Banner";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {KeyTextValuePair, KeyValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {Tile, TileIdentifier} from "../../../../../models/tile";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {usePlaceScout} from "../../../../hooks/game/scout";
import {useCreateSettlement} from "../../../../hooks/game/city";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import {useOpenCityWindow} from "../city/CityMenu";
import {useOpenCountryWindow} from "../country/CountryWindow";
import {useOpenSettlementCreationWindow} from "./SettlementCreationWindow";


export function useOpenTileWindow() {
    const WINDOW_ID = "menubar-window";
    const addWindow = useOpenWindow();
    return (identifier: TileIdentifier) => {
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

export interface TileWindowProps {
    windowId: string;
    identifier: TileIdentifier;
}

export function TileWindow(props: TileWindowProps): ReactElement {

    const tile: Tile = {
        identifier: props.identifier,
        terrainType: "land",
        owner: null,
        // owner: {
        //     country: {
        //         id: "germany",
        //         name: "Germany"
        //     },
        //     province: {
        //         id: "baden-wurttemberg",
        //         name: "Baden-Württemberg"
        //     },
        //     city: {
        //         id: "stuttgart",
        //         name: "Stuttgart"
        //     }
        // },
        influences: []
    };

    const openCity = useOpenCityWindow();
    const openCountry = useOpenCountryWindow();
    const openSettlementCreation = useOpenSettlementCreationWindow()
    const placeScout = usePlaceScout();
    const [validCreateSettlement, _] = useCreateSettlement(tile, null, null);

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
                <TileBanner data={tile}/>
                <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                    <TileBaseDataSection
                        data={tile}
                        openCountry={() => openCountry(tile.owner!!.country.id, true)}
                        openCity={() => openCity(tile.owner!!.city!!.id, true)}
                    />
                    <ButtonPrimary blue onClick={() => placeScout(tile.identifier)}>
                        Place Scout
                    </ButtonPrimary>
                    <ButtonPrimary
                        blue
                        disabled={!validCreateSettlement}
                        onClick={() => openSettlementCreation(tile)}
                    >
                        Found Settlement
                    </ButtonPrimary>
                </VBox>
            </VBox>
        </DecoratedWindow>
    );
}

function TileBanner(props: { data: Tile }): ReactElement {
    return (
        <Banner spaceAbove>
            <Header1 centered>{props.data.terrainType}</Header1>
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
            {props.data.owner && (
                <KeyValuePair name={"Owned By"}>
                    <HBox gap_xs>
                        <LinkButton fillParent align="left" onClick={props.openCountry}>{props.data.owner.country.name}</LinkButton>
                        (
                        <LinkButton fillParent align="left" onClick={props.openCity}>{props.data.owner.city!!.name}</LinkButton>
                        )
                    </HBox>
                </KeyValuePair>
            )}
        </InsetPanel>
    );
}