import React from "react";
import {UIService} from "../../../core/required/UIService";
import {TilePosition} from "../../../core/models/tilePosition";
import {generateId} from "../../../shared/utils";
import {CreateCityDialog} from "../../../ui/pages/game/ui/CreateCityDialog";
import {CreateTownDialog} from "../../../ui/pages/game/ui/CreateTownDialog";
import {MenuDebug} from "../../../ui/pages/game/ui/MenuDebug";
import {MenuMap} from "../../../ui/pages/game/ui/MenuMap";
import {MenuOther} from "../../../ui/pages/game/ui/MenuOther";
import {MenuSelectedTile} from "../../../ui/pages/game/ui/MenuSelectedTile";
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

    openToolbarMenuSelectedTile(): void {
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
            () => <MenuSelectedTile/>
        );
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

    openToolbarMenuOther(): void {
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
            () => <MenuOther/>);
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