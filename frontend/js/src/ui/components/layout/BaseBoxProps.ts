export interface BaseBoxProps {
    padding_none?: boolean,
    padding_xs?: boolean,
    padding_s?: boolean,
    padding_m?: boolean,
    padding_l?: boolean,
    padding_xl?: boolean,
    padding_xxl?: boolean,
}

export namespace BaseBoxProps {

    export type BoxPadding = "none" | "xs" | "s" | "m" | "l" | "xl" | "xxl"

    export function padding(props: BaseBoxProps): BoxPadding | null {
        if (props.padding_xs) return "xs";
        if (props.padding_s) return "s";
        if (props.padding_m) return "m";
        if (props.padding_l) return "l";
        if (props.padding_xl) return "xl";
        if (props.padding_xxl) return "xxl";
        if (props.padding_none) return null;
        return null;
    }

}