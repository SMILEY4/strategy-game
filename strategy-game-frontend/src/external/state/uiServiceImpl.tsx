import {UIService} from "../../core/required/UIService";
import {MenuSelectedTile} from "../../ui/pages/game/ui/MenuSelectedTile";
import {UIStateAccess} from "./ui/uiStateAccess";

export class UIServiceImpl implements UIService {

    private readonly uiStateAccess: UIStateAccess;

    constructor(uiStateAccess: UIStateAccess) {
        this.uiStateAccess = uiStateAccess;
    }

    openMenuSelectedTile(): void {
        this.uiStateAccess.openFrame(
            "topbar.category.menu",
            {
                vertical: {
                    x: 10,
                    width: 320,
                    top: 50,
                    bottom: 10
                }
            },
            () => <MenuSelectedTile/>
        );
    }


}