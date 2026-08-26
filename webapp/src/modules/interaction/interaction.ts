import {createInteraction} from "@modules/interaction/interaction.definition.ts";

interface CreateSettlementInteractionInput {
    position: [number, number];
}

interface CreateSettlementInteractionContext {
    position: [number, number],
    name: string | null,
    houseId: string | null,
    error: string | null,
}

type CreateSettlementInteractionEvent =
    | { type: "SELECT_NAME", name: string }
    | { type: "SELECT_HOUSE", houseId: string }
    | { type: "CONFIGURE_HOUSE" }
    | { type: "CONFIRM_HOUSE" }
    | { type: "CONFIRM" }

type CreateSettlementInteractionState =
    | "ConfiguringSettlement"
    | "ConfiguringHouse"
    | "Finalizing"

createInteraction<CreateSettlementInteractionState, CreateSettlementInteractionEvent, CreateSettlementInteractionContext, CreateSettlementInteractionInput>({
    initialState: () => "ConfiguringSettlement",
    initialContext: input => ({
        position: input.position,
        name: null,
        houseId: null,
        error: null,
    }),
    states: {
        ConfiguringSettlement: {
            onEnter: ({event}) => {
                if (event.type === "__INIT__") {
                    console.log("open settlement window");
                }
            },
            SELECT_NAME: {
                action: ({event, context}) => {
                    if (!event.name.trim()) {
                        return {...context, error: "name can not be empty"};
                    } else {
                        return {...context, name: event.name};
                    }
                },
                target: "ConfiguringSettlement",
                reenter: false,
            },
            CONFIGURE_HOUSE: {
                target: "ConfiguringHouse",
            },
            CONFIRM: {
                target: "Finalizing",
            },
        },
        ConfiguringHouse: {
            onEnter: () => console.log("open house window"),
            onExit: () => console.log("close house window"),
            SELECT_HOUSE: {
                action: ({context, event}) => {
                    return {...context, houseId: event.houseId};
                },
                target: "ConfiguringHouse",
                reenter: false,
            },
            CONFIRM_HOUSE: {
                target: "ConfiguringSettlement",
            },
        },
        Finalizing: {
            terminal: true,
            onEnter: () => {
                console.log("close settlement window");
                console.log("create command");
            },
        },
    },
});

// createInteraction({
//     initialContext: {},
//     initialState: (input: CreateSettlementInteractionInput) => ({
//         position: input.position,
//         name: "",
//         houseId: ""
//     }),
//     states: {
//         ConfiguringSettlement: {
//             onEnter: ({ context, event }) => context,
//             SELECT_NAME: {
//                 guard: ({ context, event }) => context.name,
//                 action: ({ context, event }) => context,
//                 target: "ConfiguringSettlement",
//             },
//             CONFIGURE_HOUSE: {
//                 target: "ConfiguringHouse",
//             },
//             CONFIRM: {
//                 target: "Finalizing"
//             },
//             onExit: ({ context, event }) => context,
//         },
//         ConfiguringHouse: {
//             SELECT_HOUSE: {
//                 target: "ConfiguringHouse",
//             },
//             CONFIRM_HOUSE: {
//                 target: "ConfiguringSettlement"
//             }
//         },
//         Finalizing: {
//             terminal: true
//         },
//     },
// });