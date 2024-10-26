import {
	ProductionOptionAggregate,
	ProductionQueueEntryAggregate,
	ResourceLedgerEntryAggregate,
	SettlementAggregate,
} from "../models/aggregates/SettlementAggregate";
import {AppCtx} from "../appContext";
import {useQueryMultiple, useQuerySingle} from "../shared/db/adapters/databaseHooks";
import {SettlementDatabase} from "./database/settlementDatabase";
import {CommandDatabase} from "./database/commandDatabase";
import {CommandType, ProductionQueueAddCommand, ProductionQueueCancelCommand} from "../models/primitives/command";
import {ProductionQueueEntry, ResourceLedgerEntry} from "../models/primitives/Settlement";
import {ProductionOption} from "../models/primitives/productionOption";
import {getHiddenOrDefault} from "../models/common/hiddenType";
import {DetailsLogEntry, NumberDetailsLogValue, TextDetailsLogValue} from "../models/primitives/detailLog";

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
		const productionOptions = buildProductionOptions(getHiddenOrDefault(settlement.productionOptions, []), productionQueue);

		return {
			identifier: settlement.identifier,
			country: settlement.country,
			tile: settlement.tile,
			production: {
				options: productionOptions,
				queue: productionQueue,
			},
			buildings: getHiddenOrDefault(settlement.buildings, []),
			resources: getHiddenOrDefault(settlement.resources, []).map(buildResourceEntry),
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


		function buildProductionOptions(
			options: ProductionOption[],
			productionQueue: ProductionQueueEntryAggregate[],
		): ProductionOptionAggregate[] {
			return options.map(it => buildProductionOption(it, productionQueue));
		}

		function buildProductionOption(
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

			let available = true;
			if (option.requiresTile && option.availableTiles <= queueCount + commandCount) {
				available = false;
			}

			return {
				type: option.type,
				queueCount: queueCount,
				commandCount: commandCount,
				available: available,
			};
		}

		function buildResourceEntry(entry: ResourceLedgerEntry): ResourceLedgerEntryAggregate {

			function hasGroup(entry: DetailsLogEntry, group: string): boolean {
				return entry.data.some(d => d.key === "group" && (d as TextDetailsLogValue).value === group);
			}

			function getAmount(entry: DetailsLogEntry): number {
				return (entry.data.find(d => d.key === "amount") as NumberDetailsLogValue).value;
			}

			function getKey(entry: DetailsLogEntry): string {
				return (entry.data.find(d => d.key === "key") as TextDetailsLogValue).value;
			}

			return {
				type: entry.type,
				amount: entry.missing > 0 ? -entry.missing : entry.amount,
				produced: {
					amount: entry.produced,
					details: entry.details
						.filter(it => hasGroup(it, "produce"))
						.map(it => ({
							amount: getAmount(it),
							key: getKey(it),
						})),
				},
				consumed: {
					amount: entry.consumed,
					details: entry.details
						.filter(it => hasGroup(it, "consume"))
						.map(it => ({
							amount: getAmount(it),
							key: getKey(it),
						})),
				},
				missing: {
					amount: entry.missing,
					details: entry.details
						.filter(it => hasGroup(it, "missing"))
						.map(it => ({
							amount: getAmount(it),
							key: getKey(it),
						})),
				},
			};
		}


	}

}