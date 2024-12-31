import React, {ReactElement, useState} from "react";
import {VBox} from "../layout/vbox/VBox";
import {HBox} from "../layout/hbox/HBox";
import {Button} from "../button/primary/Button";
import {Divider} from "../divider/Divider";
import {BaseProps} from "../base/base";
import {joinClassNames} from "../window/utils";

export interface TabBarProps extends BaseProps {
    initial: string,
    children?: any,
}

export function TabBar(props: TabBarProps): ReactElement {

    const [selected, setSelected] = useState(props.initial);

    const options = collectOptions();
    const selectedOption = options.find(it => it.name === selected);

    function collectOptions(): ({ element: ReactElement, name: string, circle: boolean })[] {
        const options: ({ element: ReactElement, name: string, circle: boolean })[] = [];
        for (let child of props.children) {
            if (child.type.name === "TabOption") {
                options.push({
                    element: child,
                    name: child.props.name,
                    circle: child.props.circle === true,
                });
            }
        }
        return options;
    }

    return (
        <VBox
            gap_s
            padding_m
            className={joinClassNames(["tabs", ...BaseProps.buildBaseClassNames(props),])}
            style={props.style}
        >

            <HBox dontGrow dontShrink centerHorizontal gap_xs centerVertical fullWidth>
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
}

export interface TabOptionProps {
    name: string,
    circle?: boolean,
    children?: any,
}

export function TabOption(props: TabOptionProps): ReactElement {
    return props.children;
}