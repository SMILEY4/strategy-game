import {Navigate, type RouteObject, useMatches, useNavigate} from "react-router";
import {LoginPage} from "@pages/login/Login.page.tsx";
import {RegisterPage} from "@pages/register/Register.page.tsx";
import {MatchPage} from "@pages/match/Match.page.tsx";
import {MatchListPage} from "@pages/matchList/Match-list.page.tsx";
import {GamePage} from "@pages/game/Game.page.tsx";
import {StrictMode} from "react";
import {ComponentsPage} from "@pages/dev/Components.page.tsx";
import {AtlasPage} from "@pages/dev/Atlas.page.tsx";

type RouteInfo = {
    id: string,
    path: string | ((...args: any[]) => string),
} & {
    [K in `prop${string}`]: string;
}

export const Routes = {
    ROOT: {
        id: "root",
        path: "",
    },
    REGISTER: {
        id: "register",
        path: "register",
    },
    LOGIN: {
        id: "login",
        path: "login",
    },
    MATCH_LIST: {
        id: "match-list",
        path: "matches",
    },
    MATCH: {
        id: "match",
        path: (id: string) => `match/${id}`,
        propMatchId: ":matchId",
    },
    GAME: {
        id: "game",
        path: (id: string) => `game/${id}`,
        propGameId: ":gameId",
    },
} satisfies Record<string, RouteInfo>;

export const routing: RouteObject[] = [
    {
        id: Routes.ROOT.id,
        path: Routes.ROOT.path,
        element: <Navigate to={`/${Routes.MATCH_LIST.path}`} replace/>,
    },
    {
        id: Routes.REGISTER.id,
        path: Routes.REGISTER.path,
        element: (
            <StrictMode>
                <RegisterPage/>
            </StrictMode>
        ),
    },
    {
        id: Routes.LOGIN.id,
        path: Routes.LOGIN.path,
        element: (
            <StrictMode>
                <LoginPage/>
            </StrictMode>
        ),
    },
    {
        id: Routes.MATCH_LIST.id,
        path: Routes.MATCH_LIST.path,
        element: (
            <StrictMode>
                <MatchListPage/>
            </StrictMode>
        ),
    },
    {
        id: Routes.MATCH.id,
        path: Routes.MATCH.path(Routes.MATCH.propMatchId),
        element: (
            <StrictMode>
                <MatchPage/>
            </StrictMode>
        ),
    },
    {
        id: Routes.GAME.id,
        path: Routes.GAME.path(Routes.GAME.propGameId),
        element: (
            <GamePage/>
        ),
    },
    {
        id: "dev",
        path: "dev",
        children: [
            {
                id: "components",
                path: "components",
                element: (
                    <ComponentsPage/>
                ),
            },
            {
                id: "atlas",
                path: "atlas",
                element: (
                    <AtlasPage/>
                ),
            },
        ],
    },
];

export function useRouting() {
    const navigate = useNavigate();
    return {
        urlLogin: () => "/" + Routes.LOGIN.path,
        gotoLogin: () => void navigate("/" + Routes.LOGIN.path),

        urlRegister: () => "/" + Routes.REGISTER.path,
        gotoRegister: () => void navigate("/" + Routes.REGISTER.path),

        gotoMatchList: () => void navigate("/" + Routes.MATCH_LIST.path),
        gotoMatch: (matchId: string) => void navigate("/" + Routes.MATCH.path(matchId)),

        gotoGame: (gameId: string) => void navigate("/" + Routes.GAME.path(gameId)),
    };
}

export function useRouteIds(): string[] {
    const matches = useMatches();
    return matches.map(it => it.id);
}