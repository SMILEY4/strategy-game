import {TilePosition} from "../../models/state/tilePosition";

export interface UIService {
    close: (frameId: string) => void
    pin: (frameId: string) => void
    openToolbarMenuSelectedTile: () => void;
    openToolbarMenuDebug: () => void;
    openToolbarMenuMap: () => void;
    openToolbarMenuOther: () => void;
    openDialogCreateCity: (pos: TilePosition | null) => void
    openDialogCreateTown: (pos: TilePosition | null) => void
    repositionAll: () => void
}