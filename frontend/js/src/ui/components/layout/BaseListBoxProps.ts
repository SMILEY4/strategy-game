import {BaseBoxProps} from "./BaseBoxProps";

export interface BaseListBoxProps extends BaseBoxProps {

    scrollable?: boolean,

    wrap?: boolean,

    gap_none?: boolean
    gap_xs?: boolean,
    gap_s?: boolean,
    gap_m?: boolean,
    gap_l?: boolean,
    gap_xl?: boolean,
    gap_xxl?: boolean,
}

export namespace BaseListBoxProps {

    export type BoxGap = "none" | "xs" | "s" | "m" | "l" | "xl" | "xxl"

    export function gap(props: BaseListBoxProps): BoxGap | null {
        if(props.gap_xs) return "xs"
        if(props.gap_s) return "s"
        if(props.gap_m) return "m"
        if(props.gap_l) return "l"
        if(props.gap_xl) return "xl"
        if(props.gap_xxl) return "xxl"
        if(props.gap_none) return null
        return "xs"
    }

}