import React, {ReactElement, useState} from "react";
import {VBox} from "../layout/vbox/VBox";
import {HBox} from "../layout/hbox/HBox";
import {ButtonPrimary} from "../button/primary/ButtonPrimary";
import {Divider} from "../divider/Divider";

export interface TabBarProps {
    initial: string,
    className?: string,
    children?: any,
}

export function TabBar(props: TabBarProps): ReactElement {

    const [selected, setSelected] = useState(props.initial);

    const options = collectOptions();
    const selectedOption = options.find(it => it.name === selected);

    function collectOptions(): ({element: ReactElement, name: string, circle: boolean})[] {
        const options: ({element: ReactElement, name: string, circle: boolean})[] = []
        for(let child of props.children) {
            if(child.type.name === "TabOption") {
                options.push({
                    element: child,
                    name: child.props.name,
                    circle: child.props.circle === true
                })
            }
        }
        return options;
    }

    return (
        <VBox gap_s top stretch padding_m>

            <HBox centerHorizontal gap_xs centerVertical fillParentWidth>
                {options.map(option => (
                    <ButtonPrimary
                        key={option.name}
                        small
                        round={!option.circle}
                        circle={option.circle}
                        active={selected === option.name}
                        onClick={() => setSelected(option.name)}
                    >
                        {option.name}
                    </ButtonPrimary>
                ))}
            </HBox>

            <Divider type="simple"/>

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