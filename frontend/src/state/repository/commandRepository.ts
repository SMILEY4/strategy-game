import {CommandDatabase} from "../database/commandDatabase";
import {Command, CommandType} from "../../models/base/command";
import {useQueryMultiple, useQuerySingleOrThrow} from "../../common/db/adapters/databaseHooks";
import {useDI} from "../../appContext";

export class CommandRepository {

	private readonly commandDb: CommandDatabase;

	constructor(commandDb: CommandDatabase) {
		this.commandDb = commandDb;
	}

	public getAll(): Command[] {
		return this.commandDb.queryMany(CommandDatabase.QUERY_ALL, null);
	}

	public getAllByType<T extends Command>(type: CommandType): T[] {
		return this.getAll()
			.filter(it => it.type === type)
			.map(it => it as T);
	}

	public add(command: Command) {
		this.commandDb.insert(command);
	}

	public remove(commandId: string) {
		this.commandDb.delete(commandId);
	}

	public clear() {
		this.commandDb.deleteAll();
	}

	public getRevId(): string {
		return this.commandDb.getRevId();
	}

}

export namespace CommandRepository {

	export function useAll(): Command[] {
		const db = useDI<CommandDatabase>(CommandDatabase.name);
		return useQueryMultiple(db, CommandDatabase.QUERY_ALL, null);
	}

	export function useAllByType<T extends Command>(type: CommandType): T[] {
		const db = useDI<CommandDatabase>(CommandDatabase.name);
		return useQueryMultiple(db, CommandDatabase.QUERY_ALL, null)
			.filter(it => it.type === type)
			.map(it => it as T);
	}

	export function useById(commandId: string): Command {
		const db = useDI<CommandDatabase>(CommandDatabase.name);
		return useQuerySingleOrThrow(db, CommandDatabase.QUERY_BY_ID, commandId);
	}

}