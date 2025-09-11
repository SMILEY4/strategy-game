import React, {ReactElement, useState} from "react";
import {VBox} from "../layout/vbox/VBox";
import {HBox} from "../layout/hbox/HBox";
import {Button} from "../button/Button";
import {Divider} from "../divider/Divider";
import {BaseProps} from "../base/base";
import {joinClassNames} from "../window/utils";

export interface TabBarProps extends BaseProps {
    initial: string,
    noPadding?: boolean,
    children?: any,
}

export function TabBar(props: TabBarProps): ReactElement {

    const [selected, setSelected] = useState(props.initial);
    const options = collectOptions(props.children);
    const selectedOption = options.find(it => it.name === selected);

    return (
        <VBox
            gap_s
            padding_m={props.noPadding === true ? undefined : true}
            className={joinClassNames(["tabs", ...BaseProps.buildBaseClassNames(props),])}
            style={props.style}
        >

            <HBox dontGrow dontShrink centerHorizontal gap_xs centerVertical fullWidth wrap>
                {options.map(option => (
                    <Button
                        key={option.name}
                        small
                        rounded={!option.circle}
                        circle={option.circle}
                        onClick={() => setSelected(option.name)}
                    >
                        {option.name}
                    </Button>
                ))}
            </HBox>

            <Divider line/>

            {selectedOption?.element}

        </VBox>
    );

    function collectOptions(children: any[]): ({ element: ReactElement, name: string, circle: boolean })[] {
        const options: ({ element: ReactElement, name: string, circle: boolean })[] = [];
        for (let child of children) {
            if(Array.isArray(child)) {
                options.push(...collectOptions(child))
            } else {
                if (child.type.name === "TabOption") {
                    options.push({
                        element: child,
                        name: child.props.name,
                        circle: child.props.circle === true,
                    });
                }
            }
        }
        return options;
    }

}

export interface TabOptionProps {
    name: string,
    circle?: boolean,
    children?: any,
}

export function TabOption(props: TabOptionProps): ReactElement {
    return props.children;
}