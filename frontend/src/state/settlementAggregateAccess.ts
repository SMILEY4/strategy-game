import {
	ProductionOptionAggregate,
	ProductionQueueEntryAggregate,
	SettlementAggregate,
} from "../models/aggregates/SettlementAggregate";
import {AppCtx} from "../appContext";
import {useQueryMultiple, useQuerySingle} from "../shared/db/adapters/databaseHooks";
import {SettlementDatabase} from "./database/settlementDatabase";
import {CommandDatabase} from "./database/commandDatabase";
import {CommandType, ProductionQueueAddCommand, ProductionQueueCancelCommand} from "../models/primitives/command";
import {ProductionQueueEntry} from "../models/primitives/Settlement";
import {ProductionOption} from "../models/primitives/productionOption";
import {getHiddenOrDefault} from "../models/common/hiddenType";

export namespace SettlementAggregateAccess {

	export function useSettlementAggregate(settlementId: string | null): SettlementAggregate | null {

		const settlement = useQuerySingle(AppCtx.SettlementDatabase(), SettlementDatabase.QUERY_BY_ID, settlementId);
		const commands = useQueryMultiple(AppCtx.CommandDatabase(), CommandDatabase.QUERY_ALL, null);

		if (settlementId == null || settlement == null) {
			return null;
		}

		const addProductionQueueCommands = commands
			.filter(it => it.type === CommandType.PRODUCTION_QUEUE_ADD)
			.map(it => it as ProductionQueueAddCommand)
			.filter(it => it.settlement.id === settlementId);

		const cancelProductionQueueCommands = commands
			.filter(it => it.type === CommandType.PRODUCTION_QUEUE_CANCEL)
			.map(it => it as ProductionQueueCancelCommand)
			.filter(it => it.settlement.id === settlementId);

		const productionQueue = buildQueueEntries(getHiddenOrDefault(settlement.productionQueue, []), addProductionQueueCommands, cancelProductionQueueCommands);
		const productionOptions = buildOptions(getHiddenOrDefault(settlement.productionOptions, []), productionQueue);

		return {
			identifier: settlement.identifier,
			country: settlement.country,
			tile: settlement.tile,
			production: {
				options: productionOptions,
				queue: productionQueue,
			},
			buildings: getHiddenOrDefault(settlement.buildings, [])
		};

		function buildQueueEntries(
			productionQueue: ProductionQueueEntry[],
			addProductionQueueCommands: ProductionQueueAddCommand[],
			cancelProductionQueueCommands: ProductionQueueCancelCommand[],
		): ProductionQueueEntryAggregate[] {
			return [
				...productionQueue
					.filter(entry => !isCancelled(entry, cancelProductionQueueCommands))
					.map(entry => ({
						type: entry.type,
						entryId: entry.entryId,
						progress: entry.progress,
						isCommand: false,
					})),
				...addProductionQueueCommands
					.map(command => ({
						type: command.entry.type,
						entryId: command.id,
						progress: 0,
						isCommand: true,
					})),
			];
		}

		function isCancelled(entry: ProductionQueueEntry, cancelProductionQueueCommands: ProductionQueueCancelCommand[]): boolean {
			return cancelProductionQueueCommands.some(it => it.entry.entryId === entry.entryId);
		}


		function buildOptions(
			options: ProductionOption[],
			productionQueue: ProductionQueueEntryAggregate[],
		): ProductionOptionAggregate[] {
			return options.map(it => buildOption(it, productionQueue));
		}

		function buildOption(
			option: ProductionOption,
			productionQueue: ProductionQueueEntryAggregate[],
		): ProductionOptionAggregate {

			let queueCount = 0;
			let commandCount = 0;

			for (let queueEntry of productionQueue) {
				if (queueEntry.type === option.type) {
					if (queueEntry.isCommand) {
						commandCount++;
					} else {
						queueCount++;
					}
				}
			}

			let available = true
			if(option.requiresTile && option.availableTiles <= queueCount + commandCount) {
				available = false
			}

			return {
				type: option.type,
				queueCount: queueCount,
				commandCount: commandCount,
				available: available
			};
		}


	}

}