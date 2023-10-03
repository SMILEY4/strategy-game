import React from "react";
import {UIService} from "../../../_old_core/required/UIService";
import {generateId} from "../../../shared/utils";
import {UiFrames} from "./uiFrames";
import {UiStore} from "./uiStore";
import FrameLayout = UiFrames.FrameLayout;
import {TilePosition} from "../../../_old_core/models/tilePosition";

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

    openDialogCreateCity(pos: TilePosition | null): void {
    }

    openDialogCreateTown(pos: TilePosition | null): void {
    }

    openMenuCity(cityId: string, menuLevel: number): void {
    }

    openMenuCountry(countryId: string, menuLevel: number): void {
    }

    openMenuProvince(provinceId: string, menuLevel: number): void {
    }

    openMenuSelectedTile(menuLevel: number): void {
    }

    openToolbarMenuDebug(): void {
    }

    openToolbarMenuMap(): void {
    }

}