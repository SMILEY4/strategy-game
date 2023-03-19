import {TilePosition} from "../models/tilePosition";

export interface UIService {
    close: (frameId: string) => void
    pin: (frameId: string) => void
    openToolbarMenuSelectedTile: () => void;
    openToolbarMenuDebug: () => void;
    openToolbarMenuMap: () => void;
    openDialogCreateCity: (pos: TilePosition | null) => void
    openDialogCreateTown: (pos: TilePosition | null) => void
    repositionAll: () => void
}