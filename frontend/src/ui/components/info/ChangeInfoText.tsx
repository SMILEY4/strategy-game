import {ReactElement} from "react";
import {HBox} from "../layout/hbox/HBox";
import {Text} from "../text_basic/Text";
import {BiSolidRightArrowAlt} from "react-icons/bi";
import {joinClassNames} from "../window/utils";
import "./changeInfoText.less";

export interface ChangeInfoTextProps {
    prevValue: any,
    nextValue: any | null
    fillParent?: boolean,
    secondary?: boolean,
    className?: string
}

export function ChangeInfoText(props: ChangeInfoTextProps): ReactElement {
    return (
        <HBox
            className={joinClassNames([
                "change-info-text",
                props.secondary === true ? "change-info-text--secondary" : null,
                props.className
            ])}
            centerVertical
            fullSize={props.fillParent}
        >

            <Text className="change-info-text__prev">{props.prevValue}</Text>

            {props.nextValue !== null && props.nextValue !== undefined && props.nextValue !== props.prevValue && (
                <>
                    <BiSolidRightArrowAlt className="change-info-text__next"/>
                    <Text className="change-info-text__next">{props.nextValue}</Text>
                </>
            )}

        </HBox>
    );
}