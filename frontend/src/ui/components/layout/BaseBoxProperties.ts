export interface BaseBoxProperties {

    center?: boolean,

    fillParent?: boolean,

    scrollable?: boolean,

    gap_none?: boolean
    gap_xs?: boolean,
    gap_s?: boolean,
    gap_m?: boolean,
    gap_l?: boolean,
    gap_xl?: boolean,
    gap_xxl?: boolean,

    padding_none?: boolean,
    padding_xs?: boolean,
    padding_s?: boolean,
    padding_m?: boolean,
    padding_l?: boolean,
    padding_xl?: boolean,
    padding_xxl?: boolean,

}

export namespace BaseBoxProperties {

    export type BoxGap = "none" | "xs" | "s" | "m" | "l" | "xl" | "xxl"

    export function gap(props: BaseBoxProperties): BoxGap {
        if(props.gap_xs) return "xs"
        if(props.gap_s) return "s"
        if(props.gap_m) return "m"
        if(props.gap_l) return "l"
        if(props.gap_xl) return "xl"
        if(props.gap_xxl) return "xxl"
        if(props.gap_none) return "none"
        return "none"
    }

    export type BoxPadding = "none" | "xs" | "s" | "m" | "l" | "xl" | "xxl"

    export function padding(props: BaseBoxProperties): BoxPadding {
        if(props.padding_xs) return "xs"
        if(props.padding_s) return "s"
        if(props.padding_m) return "m"
        if(props.padding_l) return "l"
        if(props.padding_xl) return "xl"
        if(props.padding_xxl) return "xxl"
        if(props.padding_none) return "none"
        return "none"
    }

}