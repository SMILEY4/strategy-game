package io.github.smiley4.strategygame.engine.simulation.turn

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.turn.commands.CommandHandler
import io.github.smiley4.strategygame.engine.simulation.turn.commands.FoundRealmCapitalCommandHandler
import io.github.smiley4.strategygame.engine.simulation.turn.systems.GameSystem

/*

PIPELINE
========

basis
- game state + commands as input
- everything can emit events -> stored in context, discarded at start of next turn, no "event handlers"

1. Commands & Command Handlers
	- commands are sorted
	- for each command: call correct handler
	- handlers execute command

2. Systems
	- run every turn in same order
	- order of systems
	- each system independent

3. Triggers
	- all triggers checked every turn
	- check condition (gamestate + events)
	- if condition met -> trigger effect
	- maybe: different type of triggers?
		- when condition if met  (e.g. x > 10 -> triggers every turn if true )
		- when condition changes from true to false (e.g. x > 10 -> only triggers 1x when it changes to true)
		- with cooldown
		- ...
 */

internal class TurnService {

    private val commandHandlers = listOf<CommandHandler<*>>(
        FoundRealmCapitalCommandHandler()
    )

    private val systems = listOf<GameSystem>()

    fun execute(gameState: GameStateContext, commands: Collection<PlayerCommand>) {

        // 1. execute all commands
        commands
            .sortedBy { it::class.simpleName }
            .associateWith { command ->
                commandHandlers.find { it.commandType == command::class }
                    ?: throw IllegalArgumentException("No command handler for '${command::class.simpleName}'")
            }
            .forEach { (command, handler) ->
                @Suppress("UNCHECKED_CAST")
                (handler as CommandHandler<PlayerCommand>).handle(gameState, command)
            }

        // 2. run common game systems
        systems.forEach { system ->
            system.execute(gameState)
        }

        // 3. handle triggers

        // 4. finalize turn
        gameState.turn++

    }

}