import {createPortal} from "react-dom";
import {DevUIPane} from "./DevUIPane.tsx";
import {useDevUIPopup} from "./useDevUIPopup.ts";
import "./dev-ui.less";

export function DevUI() {
    const {root, open} = useDevUIPopup();

    return (
        <>
            {!root && (
                <button className="dev-ui-toggle" type="button" onClick={open}>
                    DEV
                </button>
            )}
            {root && createPortal(<DevUIPane/>, root)}
        </>
    );
}
