import {ReactElement} from "react";
import "./advButton.css";
import {ResourceLabel} from "./ResourceLabel";

export function AdvButton(props: {
    label: string,
    actionCosts: ({ type: "money" | "wood" | "stone" | "metal" | "food", value: number })[],
    turnCosts: ({ type: "money" | "wood" | "stone" | "metal" | "food", value: number })[],
    disabled: boolean,
    onClick: () => void
}): ReactElement {
    return (
        <div className={"adv-button" + (props.disabled ? " disabled" : "")} onClick={props.onClick}>
            <div className="label">
                {props.label}
            </div>
            {props.actionCosts && (
                <div className="cost">
                    {props.actionCosts.map((cost, index) => {
                        if (index === 0) {
                            return (
                                <ResourceLabel type={cost.type} value={cost.value} showPlusSign={false}/>
                            );
                        } else {
                            return (
                                <>
                                    ,
                                    <ResourceLabel type={cost.type} value={cost.value} showPlusSign={false}/>
                                </>
                            );
                        }
                    })}
                </div>
            )}
            {props.turnCosts && props.turnCosts.length !== 0 && (
                <div className="cost">
                    <div>Each turn:</div>
                    {props.turnCosts.map((cost, index) => {
                        if (index === 0) {
                            return (
                                <ResourceLabel type={cost.type} value={cost.value} showPlusSign={true}/>
                            );
                        } else {
                            return (
                                <>
                                    ,
                                    <ResourceLabel type={cost.type} value={cost.value} showPlusSign={true}/>
                                </>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
}