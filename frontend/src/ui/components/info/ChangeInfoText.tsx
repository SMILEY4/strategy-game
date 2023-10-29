import {ReactElement} from "react";
import {HBox} from "../layout/hbox/HBox";
import {Text} from "../text/Text";
import {BiSolidRightArrowAlt} from "react-icons/bi";
import "./changeInfoText.less";

export interface ChangeInfoTextProps {
    prevValue: any,
    nextValue: any | null
}

export function ChangeInfoText(props: ChangeInfoTextProps): ReactElement {
    return (
        <HBox className="change-info-text" fillParent centerVertical>
            <Text className="change-info-prev">{props.prevValue}</Text>
            {props.nextValue !== null && props.nextValue !== undefined && (
                <>
                    <BiSolidRightArrowAlt className="change-info-text__next"/>
                    <Text className="change-info-text__next">{props.nextValue}</Text>
                </>
            )}
        </HBox>
    );
}