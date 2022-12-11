import React from "react";
import {UIService} from "../../../core/required/UIService";
import {TilePosition} from "../../../core/models/tilePosition";
import {generateId} from "../../../shared/utils";
import {CreateCityDialog} from "../../../ui/pages/game/ui/CreateCityDialog";
import {CreateTownDialog} from "../../../ui/pages/game/ui/CreateTownDialog";
import {MenuDebug} from "../../../ui/pages/game/ui/MenuDebug";
import {MenuCity} from "../../../ui/pages/game/ui/menues/MenuCity";
import {MenuCountry} from "../../../ui/pages/game/ui/menues/MenuCountry";
import {MenuProvince} from "../../../ui/pages/game/ui/menues/MenuProvince";
import {MenuSelectedTile} from "../../../ui/pages/game/ui/menues/MenuSelectedTile";
import {MenuMap} from "../../../ui/pages/game/ui/MenuMap";
import {UiFrames} from "./uiFrames";
import {UiStore} from "./uiStore";
import FrameLayout = UiFrames.FrameLayout;

export class UIServiceImpl implements UIService {

    close(frameId: string): void {
        console.log("CLOSE ", frameId);
        UiStore.useState.getState().removeFrame(frameId);
    }

    pin(frameId: string): void {
        UiStore.useState.getState().updateFrame(frameId, frame => ({
            ...frame,
            menuId: generateId(),
            enablePin: false
        }));
    }

    openToolbarMenuDebug(): void {
        this.openFrame(
            "topbar.category.menu",
            {
                vertical: {
                    x: 10,
                    width: 320,
                    top: 50,
                    bottom: 10
                }
            },
            () => <MenuDebug/>);
    }

    openToolbarMenuMap(): void {
        this.openFrame(
            "topbar.category.menu",
            {
                vertical: {
                    x: 10,
                    width: 320,
                    top: 50,
                    bottom: 10
                }
            },
            () => <MenuMap/>);
    }

    openDialogCreateCity(pos: TilePosition | null): void {
        if (pos) {
            this.openFrame(
                "dialog.create-city",
                {
                    centered: {
                        width: 320,
                        height: 200
                    }
                },
                frameId => <CreateCityDialog frameId={frameId} tile={pos}/>
            );
        }
    }

    openDialogCreateTown(pos: TilePosition | null): void {
        if (pos) {
            this.openFrame(
                "dialog.create-city",
                {
                    centered: {
                        width: 320,
                        height: 200
                    }
                },
                frameId => <CreateTownDialog frameId={frameId} tile={pos}/>
            );
        }
    }

    openMenuSelectedTile(): void {
        this.openFrame(
            "topbar.category.selected-tile",
            {
                vertical: {
                    x: 10,
                    width: 320,
                    top: 50,
                    bottom: 10
                }
            },
            () => <MenuSelectedTile/>
        );
    }

    openMenuCountry(countryId: string): void {
        this.openFrame(
            "topbar.category.country",
            {
                vertical: {
                    x: 10,
                    width: 320,
                    top: 50,
                    bottom: 10
                }
            },
            () => <MenuCountry countryId={countryId}/>
        );
    }

    openMenuProvince(provinceId: string): void {
        this.openFrame(
            "topbar.category.province",
            {
                vertical: {
                    x: 10,
                    width: 320,
                    top: 50,
                    bottom: 10
                }
            },
            () => <MenuProvince provinceId={provinceId}/>
        );
    }

    openMenuCity(cityId: string): void {
        this.openFrame(
            "topbar.category.city",
            {
                vertical: {
                    x: 10,
                    width: 320,
                    top: 50,
                    bottom: 10
                }
            },
            () => <MenuCity cityId={cityId}/>
        );
    }


    private openFrame(menuId: string, layout: FrameLayout, content: (frameId: string) => any) {
        const frames = UiStore.useState.getState().frames;
        const addFrame = UiStore.useState.getState().addFrame;
        const bringToFront = UiStore.useState.getState().bringFrameToFront;
        const setContent = UiStore.useState.getState().setFrameContent;
        UiFrames.openFrame(
            menuId,
            layout,
            content,
            frames,
            addFrame,
            bringToFront,
            setContent
        );
    }

    repositionAll(): void {
        UiStore.useState().setAllFramePositions(300, 300);
    }

}