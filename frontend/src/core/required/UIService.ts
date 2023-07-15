import {TilePosition} from "../models/tilePosition";

export interface UIService {
    close: (frameId: string) => void
    pin: (frameId: string) => void
    repositionAll: () => void

    openToolbarMenuDebug: () => void;
    openToolbarMenuMap: () => void;

    openMenuSelectedTile: (menuLevel: number) => void;
    openMenuCountry: (countryId: string, menuLevel: number) => void;
    openMenuProvince: (provinceId: string, menuLevel: number) => void;
    openMenuCity: (cityId: string, menuLevel: number) => void;

    openDialogCreateCity: (pos: TilePosition | null) => void
    openDialogCreateTown: (pos: TilePosition | null) => void
}