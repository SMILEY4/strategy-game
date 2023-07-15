import React, {ReactElement} from "react";
import {useCityById} from "../../../../../core/hooks/useCityById";
import {useSelectedTilePosition} from "../../../../../core/hooks/useSelectedTilePosition";
import {useTileAt} from "../../../../../core/hooks/useTileAt";
import {useValidateCreateCity} from "../../../../../core/hooks/useValidateCreateCity";
import {useValidateCreateTown} from "../../../../../core/hooks/useValidateCreateTown";
import {useValidatePlaceScout} from "../../../../../core/hooks/useValidatePlaceScout";
import {BuildingType} from "../../../../../core/models/buildingType";
import {City} from "../../../../../core/models/city";
import {Tile} from "../../../../../core/models/tile";
import {TilePosition} from "../../../../../core/models/tilePosition";
import {AppConfig} from "../../../../../main";
import {AdvButton} from "../../../../components/specific/AdvButton";
import {Section} from "../../../../components/specific/Section";
import {TilemapUtils} from "../../../../../core/tilemap/tilemapUtils";

export function MenuSelectedTile(props: {menuLevel: number}): ReactElement {
    const selectedTilePos = useSelectedTilePosition();
    const selectedTile = useTileAt(selectedTilePos);
    const city = useCityById(selectedTile?.dataTier1?.owner?.cityId);
    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);
    const canPlaceScout = useValidatePlaceScout(selectedTilePos);
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    const canCreateCity = useValidateCreateCity(selectedTilePos);
    const canCreateTown = useValidateCreateTown(selectedTilePos);

    return (
        <div>
            {!selectedTile && (
                <h2>No Tile selected</h2>
            )}
            {selectedTile && (
                <>
                    <h2>Selected Tile</h2>

                    <Section title={"Actions"}>
                        <AdvButton
                            label={"Create City"}
                            actionCosts={[]}
                            turnCosts={[]}
                            disabled={!canCreateCity}
                            onClick={() => createCity(selectedTile?.position)}
                        />
                        <AdvButton
                            label={"Create Town"}
                            actionCosts={[]}
                            turnCosts={[]}
                            disabled={!canCreateTown}
                            onClick={() => createTown(selectedTile?.position)}
                        />
                        <AdvButton
                            label={"Send Scout"}
                            actionCosts={[]}
                            turnCosts={[]}
                            disabled={!canPlaceScout}
                            onClick={() => placeScout(selectedTile?.position)}
                        />
                        <AdvButton
                            label={"Place Marker"}
                            actionCosts={[]}
                            turnCosts={[]}
                            disabled={false}
                            onClick={() => placeMarker(selectedTile?.position)}
                        />
                    </Section>

                    <Section title={"Geographic"}>
                        <p>{"Position: " + getPosition(selectedTile)}</p>
                        <p>{"Terrain: " + getTerrain(selectedTile)}</p>
                        <p>{"Raw Resources: " + getRawResources(selectedTile)}</p>
                    </Section>

                    <Section title={"Political"}>
                        <p className={"clickable"} onClick={() => openCountry(selectedTile)}>{"Country: " + getCountry(selectedTile)}</p>
                        <p className={"clickable"} onClick={() => openProvince(selectedTile)}>{"Province: " + getProvince(selectedTile)}</p>
                        <p className={"clickable"} onClick={() => openCity(selectedTile)}>{"City: " + getCity(selectedTile)}</p>
                    </Section>

                    <Section title={"Economic"}>
                        <p>{"Worked by: " + getWorkedBy(selectedTile, city)}</p>
                    </Section>

                </>
            )}
        </div>
    );

    function getTerrain(tile: Tile): string {
        if (tile.dataTier1) {
            return tile.dataTier1.terrainType;
        } else {
            return "unknown";
        }
    }

    function getRawResources(tile: Tile): string {
        if (tile.dataTier1) {
            return tile.dataTier1.resourceType;
        } else {
            return "unknown";
        }
    }

    function getPosition(tile: Tile): string {
        return tile.position.q + ", " + tile.position.r + " (" + TilemapUtils.hexCoordinateS(tile.position) + ")   'q,r,(s)'";
    }

    function getCountry(tile: Tile): string {
        if (tile.dataTier1) {
            return tile.dataTier1.owner ? tile.dataTier1.owner.countryId : "none";
        } else {
            return "unknown";
        }
    }

    function getProvince(tile: Tile): string {
        if (tile.dataTier1) {
            return tile.dataTier1.owner ? tile.dataTier1.owner.provinceId : "none";
        } else {
            return "unknown";
        }
    }

    function getCity(tile: Tile): string {
        if (tile.dataTier1) {
            return (tile.dataTier1.owner && tile.dataTier1.owner.cityId) ? tile.dataTier1.owner.cityId : "none";
        } else {
            return "unknown";
        }
    }

    function getWorkedBy(tile: Tile, city: City | null): string {
        if (tile.dataTier1 && tile.dataTier1.owner && tile.dataTier1.owner.cityId) {
            if (city) {
                const building = city.buildings.find(b => b.tile?.tileId == tile.tileId);
                return building ? (BuildingType.toDisplayString(building.type) + (building.active ? "" : " (inactive)")) : "none";
            } else {
                return "error";
            }
        } else {
            return "unknown";
        }
    }

    function createCity(position: TilePosition) {
        uiService.openDialogCreateCity(position);
    }

    function createTown(position: TilePosition) {
        uiService.openDialogCreateTown(position);
    }

    function placeScout(position: TilePosition) {
        actionAddCommand.addPlaceScout(position);
    }

    function placeMarker(position: TilePosition) {
        actionAddCommand.addPlaceMarker(position);
    }

    function openCountry(tile: Tile) {
        const countryId = tile.dataTier1?.owner?.countryId;
        if (countryId) {
            uiService.openMenuCountry(countryId, props.menuLevel+1);
        }
    }

    function openProvince(tile: Tile) {
        const provinceId = tile.dataTier1?.owner?.provinceId;
        if (provinceId) {
            uiService.openMenuProvince(provinceId, props.menuLevel+1);
        }
    }

    function openCity(tile: Tile) {
        const cityId = tile.dataTier1?.owner?.cityId;
        if (cityId) {
            uiService.openMenuCity(cityId, props.menuLevel+1);
        }
    }

}