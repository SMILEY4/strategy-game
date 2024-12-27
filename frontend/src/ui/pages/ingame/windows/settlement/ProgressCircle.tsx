import React, {ReactElement} from "react";
import "./progressCircle.scoped.less";
import {joinClassNames} from "../../../../components/utils";
import {FaArrowUp} from "react-icons/fa6";
import {FaArrowDown} from "react-icons/fa";
import {TbPointFilled} from "react-icons/tb";

export function ProgressCircle(props: { totalProgress: number, currentChange: number }): ReactElement {
    return (
        <div className="progress-circle">
            <div className="progress-circle_inner"/>
            <div className={joinClassNames([
                "progress-circle__total",
                props.totalProgress > 0 ? "progress-circle__total--positive" : "progress-circle__total--negative",
            ])} style={{
                top: getTotalTop(props.totalProgress),
            }}/>
            {props.currentChange > 0 && (
                <FaArrowUp className="progress-circle__arrow progress-circle__arrow--positive"/>
            )}
            {props.currentChange < 0 && (
                <FaArrowDown className="progress-circle__arrow progress-circle__arrow--negative"/>
            )}
            {props.currentChange === 0 && (
                <TbPointFilled className="progress-circle__arrow  progress-circle__arrow--neutral"/>
            )}
        </div>
    );

    function getTotalTop(totalProgress: number): string | undefined {
        const percent = Math.abs(totalProgress * 100);
        const clamped = Math.max(0, Math.min(percent, 100));
        return (100 - clamped) + "%";
    }

}