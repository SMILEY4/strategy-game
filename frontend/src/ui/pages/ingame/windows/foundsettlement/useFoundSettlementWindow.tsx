import {Tile, TileIdentifier} from "../../../../../models/base/tile";
import {FoundSettlementWindow} from "./FoundSettlementWindow";
import {useDI} from "../../../../../appContext";
import {useEffect, useState} from "react";
import {SettlementService} from "../../../../../logic/game/settlementService";
import {TileRepository} from "../../../../../state/repository/tileRepository";
import {useCloseWindow, useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";

export namespace UseFoundSettlementWindow {

	/**
	 * Returns a function to open the "found settlement" dialog window
	 */
	export function useOpen() {
		const WINDOW_ID = "found-settlement-window";
		const open = useOpenWindow();
		return (tile: TileIdentifier, worldObjectId: string) => {
			open({
				id: WINDOW_ID,
				anchor: WindowStore.ANCHOR_CENTER_POINT,
				content: <FoundSettlementWindow windowId={WINDOW_ID} tile={tile} worldObjectId={worldObjectId}/>,
			});
		};
	}

	/**
	 * The data and functions required by the "found settlement" window
	 */
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

	/**
	 * Provides the data and functions required by the "found settlement" window
	 */
	export function useData(windowId: string, tileIdentifier: TileIdentifier, worldObjectId: string): UseFoundSettlementWindow.Data {

		const tile = TileRepository.useByIdOrThrow(tileIdentifier);

		const closeWindow = useCloseWindow();

		const [name, setName] = useState("");
		const [valid, failedValidations, create] = useCreateSettlement(worldObjectId, tile, name);

		useEffect(() => {
			setRandomName(setName);
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
		const service = useDI<SettlementService>(SettlementService.name);
		service.getRandomName().then(set);
	}

	/**
	 * Returns
	 * - whether the given data is valid and a settlement can be created using a settler
	 * - a list of validation errors
	 * - a function to create the settlement
	 */
	function useCreateSettlement(worldObjectId: string, tile: Tile, name: string | null): [boolean, string[], () => void] {
		const settlementService = useDI<SettlementService>(SettlementService.name);
		const [possible, reasons] = useValidateCreateSettlement(tile, name);

		function perform() {
			settlementService.createSettlementWith(worldObjectId, tile, name!);
		}

		return [possible, reasons, perform];
	}

	/**
	 * Returns
	 * - whether the settlement to found with the given data is valid
	 * - a list of validation errors
	 */
	function useValidateCreateSettlement(tile: Tile | null, name: string | null): [boolean, string[]] {
		if (tile) {
			const settlementService = useDI<SettlementService>(SettlementService.name);
			const result = settlementService.validateFounding(tile, name);
			return [result.length === 0, result];
		} else {
			return [false, ["No tile selected"]];
		}
	}

}