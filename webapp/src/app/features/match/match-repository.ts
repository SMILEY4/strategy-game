import {type MatchClient} from "@app/features/match/match.client.ts";
import {getReactiveData, type ReactiveResult, type ReactiveStateletSubscription} from "@modules/utilities/repository-utils.ts";
import {QueryClient} from "@tanstack/query-core";
import {minutes, seconds} from "@modules/utilities/time-units.ts";
import type {MatchDetails, MatchListEntry} from "@app/features/match/match.ts";

export interface MatchRepository {
    prefetchList: () => Promise<void>;
    prefetchDetails: (matchId: string) => Promise<void>;
    listAllReactive: (subscription: ReactiveStateletSubscription<MatchListEntry[]>) => ReactiveResult<MatchListEntry[]>;
    detailsReactive: (matchId: string, subscription: ReactiveStateletSubscription<MatchDetails>) => ReactiveResult<MatchDetails>;
    create: (name: string) => Promise<void>;
    delete: (matchId: string) => Promise<void>;
    createGame: (matchId: string) => Promise<void>;
}

interface Dependencies {
    matchClient: MatchClient;
}

const QueryKeys = {
    LIST_ALL: ["all"] as const,
    DETAILS: (matchId: string) => ["details", matchId],
};

export const matchRepository = ({matchClient}: Dependencies): MatchRepository => {

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: seconds(10).inMilliseconds().getValue(),
                gcTime: minutes(5).inMilliseconds().getValue(),
                retry: 1,
            },
        },
    });

    return {

        prefetchList: async () => {
            return queryClient.prefetchQuery({
                queryKey: QueryKeys.LIST_ALL,
                queryFn: () => matchClient.listAll(),
            });
        },

        prefetchDetails(matchId: string): Promise<void> {
            return queryClient.prefetchQuery({
                queryKey: QueryKeys.DETAILS(matchId),
                queryFn: () => matchClient.getDetails(matchId),
            });
        },

        listAllReactive: (subscription: ReactiveStateletSubscription<MatchListEntry[]>) => {
            return getReactiveData<MatchListEntry[]>({
                queryClient: queryClient,
                queryKey: QueryKeys.LIST_ALL,
                fetchFn: () => queryClient.fetchQuery({
                    queryKey: QueryKeys.LIST_ALL,
                    queryFn: () => matchClient.listAll(),
                }),
                subscription: subscription,
            });
        },

        detailsReactive(matchId: string, subscription: ReactiveStateletSubscription<MatchDetails>): ReactiveResult<MatchDetails> {
            return getReactiveData<MatchDetails>({
                queryClient: queryClient,
                queryKey: QueryKeys.DETAILS(matchId),
                fetchFn: () => queryClient.fetchQuery({
                    queryKey: QueryKeys.DETAILS(matchId),
                    queryFn: () => matchClient.getDetails(matchId),
                }),
                subscription: subscription,
            });
        },

        create: async (name: string) => {
            await matchClient.create(name);
            await queryClient.refetchQueries({queryKey: QueryKeys.LIST_ALL});
        },

        delete: async (matchId: string) => {
            await matchClient.delete(matchId);
            await queryClient.refetchQueries({queryKey: QueryKeys.LIST_ALL});
            await queryClient.refetchQueries({queryKey: QueryKeys.DETAILS(matchId)});
        },

        createGame: async (matchId: string) => {
            await matchClient.createGame(matchId);
            await queryClient.refetchQueries({queryKey: QueryKeys.DETAILS(matchId)});
        },

    };

};