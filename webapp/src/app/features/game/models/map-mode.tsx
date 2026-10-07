import { Icon } from "@/modules/uicomponents/icon/Icon";
import type {ColorGrading} from "@app/features/game/models/color-grading.ts";
import type {ReactElement} from "react";

export type MapModeTileElements = {
    readonly resourceIcons: boolean;
}

const COLOR_GRADING_NORMAL: ColorGrading = {
    exposure: 0,
    temperature: 0,
    tint: 0,
    brightness: 0,
    contrast: 0,
    blacks: 0,
    whites: 0,
    shadows: 0,
    highlights: 0,
    vibrance: 0,
    saturation: 0,
};

const COLOR_GRADING_GRAYSCALE: ColorGrading = {
    ...COLOR_GRADING_NORMAL,
    saturation: -1,
};

export class MapMode {

    public static readonly TERRAIN = new MapMode({
        id: "terrain",
        numericId: 1,
        icon: () => <Icon.Mountain/>,
        colorGrading: COLOR_GRADING_NORMAL,
        tileElements: {resourceIcons: true},
    });

    public static readonly POLITICAL = new MapMode({
        id: "political",
        numericId: 2,
        icon: () => <Icon.Flag/>,
        colorGrading: COLOR_GRADING_NORMAL,
        tileElements: {resourceIcons: false},
    });

    public static readonly SETTLEMENT_LOCATIONS = new MapMode({
        id: "settlement-locations",
        numericId: 3,
        icon: () => <Icon.HouseFlag/>,
        colorGrading: COLOR_GRADING_GRAYSCALE,
        tileElements: {resourceIcons: false},
    });


    public static readonly ALL: MapMode[] = [
        MapMode.TERRAIN,
        MapMode.POLITICAL,
        MapMode.SETTLEMENT_LOCATIONS,
    ];

    readonly id: string;
    readonly numericId: number;
    readonly icon: () => ReactElement;
    readonly colorGrading: ColorGrading;
    readonly tileElements: MapModeTileElements;

    constructor(props: {
        id: string,
        numericId: number,
        icon: () => ReactElement,
        colorGrading: ColorGrading,
        tileElements: MapModeTileElements,
    }) {
        this.id = props.id;
        this.numericId = props.numericId;
        this.icon = props.icon;
        this.colorGrading = props.colorGrading;
        this.tileElements = props.tileElements;
    }
}
