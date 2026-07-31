import type {HttpClient} from "@modules/client/http-client.ts";
import type {MatchDetails, MatchListEntry} from "@app/features/match/match.ts";

/** Match API client for CRUD operations on matches. */
export interface MatchClient {
    listAll: () => Promise<MatchListEntry[]>;
    getDetails: (matchId: string) => Promise<MatchDetails>;
    create: (name: string) => Promise<void>;
    delete: (matchId: string) => Promise<void>;
    createGame: (matchId: string) => Promise<void>;
}

interface Dependencies {
    httpClient: HttpClient;
}

export const matchClient = ({httpClient}: Dependencies): MatchClient => ({

    listAll: () => {
        return httpClient.get<MatchListEntry[]>({
            url: "/api/platform/match",
            authenticated: true,
        });
    },

    getDetails: (matchId: string) => {
        return httpClient.get<MatchDetails>({
            url: `/api/platform/match/${matchId}`,
            authenticated: true,
        });
    },

    create: (name: string) => {
        return httpClient.post({
            url: "/api/platform/match",
            authenticated: true,
            content: {
                name: name,
            },
        });
    },

    delete: (matchId: string) => {
        return httpClient.delete({
            url: `/api/platform/match/${matchId}`,
            authenticated: true,
        });
    },

    createGame: (matchId: string) => {
        return httpClient.post({
            url: `/api/platform/match/${matchId}/game`,
            authenticated: true,
        });
    },

});