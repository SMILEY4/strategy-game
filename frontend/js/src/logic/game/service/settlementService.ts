import {Tile} from "../../../models/tile/tile";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {GameClient} from "./gameClient";
import {CommandService} from "./commandService";
import {Command} from "../../../models/command/command";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {HexUtils} from "../../../common/hexUtils";
import {TileService} from "./tileService";
import {InteractionService} from "./interactionService";
import {Interaction} from "../../../models/misc/interaction";

export interface SettlementService {
    /**
     * Start mode for creating a new settlement.
     */
    beginCreateSettlement(worldObjectId: WorldObject.Id): void;
    /**
     * Cancel mode for creating a new settlement.
     */
    cancelCreateSettlement(): void;
    /**
     * Choose a name for the settlement. Set name to "null" to choose a randomly generated one.
     */
    setSettlementName(name: string | null): Promise<void>;
    /**
     * Create a new settlement
     */
    createSettlement(): void;
}

export class SettlementServiceImpl implements SettlementService {

    constructor(
        private readonly gameClient: GameClient,
        private readonly commandService: CommandService,
        private readonly gameStateAccess: GameStateAccess,
        private readonly gameStateWriter: GameStateWriter,
        private readonly tileService: TileService,
        private readonly interactionService: InteractionService,
    ) {
    }

    beginCreateSettlement(worldObjectId: WorldObject.Id): void {
        const worldObject = this.gameStateAccess.getWorldObjectSummary(worldObjectId);
        if (!worldObject) {
            return;
        }

        Promise.resolve()
            .then(() => this.gameClient.getRandomSettlementName())
            .then(initialName => {
                this.interactionService.startInteraction({
                    type: Interaction.Type.CreateSettlement,
                    worldObjectId: worldObjectId,
                    location: null,
                    name: initialName,
                    validationErrors: [],
                });
                this.validateCreateSettlementState()
            })
            .then(() => {
                const tiles = this.findValidTiles(worldObject.tile.position);
                this.tileService.selectTile(tiles).then(selectedTile => {
                    if (selectedTile) {
                        this.interactionService.updateInteractionOfType(
                            Interaction.Type.CreateSettlement,
                            current => ({
                                ...current,
                                location: selectedTile,
                            }),
                        );
                        this.validateCreateSettlementState()
                    }
                });
            });
    }

    setSettlementName(name: string | null): Promise<void> {
        if (!name) {
            this.gameClient
                .getRandomSettlementName()
                .then(name => this.setSettlementName(name));
        }

        this.interactionService.updateInteractionOfType(
            Interaction.Type.CreateSettlement,
            current => ({
                ...current,
                name: name,
            }),
        );
        this.validateCreateSettlementState()
        return Promise.resolve();
    }

    createSettlement(): void {
        const state = this.interactionService.endInteractionOfType(Interaction.Type.CreateSettlement);
        if (state && state.validationErrors.length > 0) {
            this.commandService.addCommand({
                type: Command.Type.CreateSettlement,
                id: Command.genId(),
                worldObjectId: state.worldObjectId,
                name: state.name!,
                tile: state.location!,
            });
            this.gameStateWriter.setHighlightedTiles([]);
        }
    }

    cancelCreateSettlement() {
        this.interactionService.endInteractionOfType(Interaction.Type.CreateSettlement);
        this.gameStateWriter.setHighlightedTiles([]);
    }

    private validateCreateSettlementState(): void {
        const state = this.interactionService.getCurrentInteractionOfType(Interaction.Type.CreateSettlement);
        if (!state) {
            return;
        }

        const validationErrors: string[] = [];
        if (!state.name) {
            validationErrors.push("Invalid name");
        }
        if (!state.location) {
            validationErrors.push("Invalid location");
        }

        this.interactionService.updateInteractionOfType(
            Interaction.Type.CreateSettlement,
            current => ({
                ...current,
                validationErrors: validationErrors,
            }),
        );
    }

    private findValidTiles(tile: Tile.Position): Tile.Position[] {
        return HexUtils.getPositionsRadius(tile.q, tile.r, 1);
    }

}
