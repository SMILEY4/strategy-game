import {useCloseWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import {Tile, TileIdentifier} from "../../../../../models/primitives/tile";
import {FoundSettlementWindow} from "./FoundSettlementWindow";
import {useQuerySingleOrThrow} from "../../../../../shared/db/adapters/databaseHooks";
import {AppCtx} from "../../../../../appContext";
import {TileDatabase} from "../../../../../state/database/tileDatabase";
import {useEffect, useState} from "react";

export namespace UseFoundSettlementWindow {


	export function useOpen() {
		const WINDOW_ID = "found-settlement-window";
		const addWindow = useOpenWindow();
		return (tile: TileIdentifier, worldObjectId: string | null) => {
			addWindow({
				id: WINDOW_ID,
				className: "found-settlement-window",
				left: 125,
				top: 160,
				width: 360,
				height: 170,
				content: <FoundSettlementWindow windowId={WINDOW_ID} tile={tile} worldObjectId={worldObjectId}/>,
			});
		};
	}

	export interface Data {
		input: {
			valid: boolean,
			reasonsInvalid: string[]
			name: {
				value: string,
				set: (value: string) => void
			}
		};
		randomizeName: () => void;
		cancel: () => void;
		create: () => void;
	}

	export function useData(windowId: string, tileIdentifier: TileIdentifier, worldObjectId: string | null): UseFoundSettlementWindow.Data {

		const tile = useQuerySingleOrThrow(AppCtx.TileDatabase(), TileDatabase.QUERY_BY_ID, tileIdentifier.id);

		const closeWindow = useCloseWindow();
		const [name, setName] = useState("");
		const [valid, failedValidations, create] = worldObjectId ? useCreateSettlementWithSettler(worldObjectId, tile, name) : useCreateSettlementDirect(tile, name);

		useEffect(() => {
			setRandomName(setName)
		}, []);

		return {
			input: {
				valid: valid,
				reasonsInvalid: failedValidations,
				name: {
					value: name,
					set: setName,
				},
			},
			randomizeName: () => setRandomName(setName),
			cancel: () => closeWindow(windowId),
			create: () => {
				create();
				closeWindow(windowId);
			},
		};
	}

	function setRandomName(set: (name: string) => void) {
		AppCtx.SettlementService().getRandomName().then(set)
	}

	function useCreateSettlementDirect(tile: Tile, name: string | null): [boolean, string[], () => void] {
		const settlementService = AppCtx.SettlementService();
		const [possible, reasons] = useValidateCreateSettlement(tile, name);

		function perform() {
			settlementService.createSettlementDirect(tile, name!)
		}

		return [possible, reasons, perform];
	}

	function useCreateSettlementWithSettler(worldObjectId: string, tile: Tile, name: string | null): [boolean, string[], () => void] {
		const settlementService = AppCtx.SettlementService();
		const [possible, reasons] = useValidateCreateSettlement(tile, name);

		function perform() {
			settlementService.createSettlementWithSettler(worldObjectId, tile, name!)
		}

		return [possible, reasons, perform];
	}

	function useValidateCreateSettlement(tile: Tile | null, name: string | null): [boolean, string[]] {
		if (tile) {
			const settlementService = AppCtx.SettlementService();
			const result = settlementService.validateFounding(tile, name);
			return [result.length === 0, result];
		} else {
			return [false, ["No tile selected"]];
		}
	}

}