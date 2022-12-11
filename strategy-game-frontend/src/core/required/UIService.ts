import {TilePosition} from "../models/tilePosition";

export interface UIService {
    close: (frameId: string) => void
    pin: (frameId: string) => void
    repositionAll: () => void

    openToolbarMenuDebug: () => void;
    openToolbarMenuMap: () => void;

    openMenuSelectedTile: () => void;
    openMenuCountry: (countryId: string) => void;
    openMenuProvince: (provinceId: string) => void;
    openMenuCity: (cityId: string) => void;

    openDialogCreateCity: (pos: TilePosition | null) => void
    openDialogCreateTown: (pos: TilePosition | null) => void
}