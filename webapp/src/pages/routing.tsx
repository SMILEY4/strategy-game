import {Navigate, type RouteObject, useMatches, useNavigate} from "react-router";
import {LoginPage} from "@pages/login/Login.page.tsx";
import {RegisterPage} from "@pages/register/Register.page.tsx";

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
    MATCHES: {
        id: "matches",
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
        element: <Navigate to={`/${Routes.MATCHES.path}`} replace/>,
    },
    {
        id: Routes.REGISTER.id,
        path: Routes.REGISTER.path,
        element: <RegisterPage/>,
    },
    {
        id: Routes.LOGIN.id,
        path: Routes.LOGIN.path,
        element: <LoginPage/>,
    },
    {
        id: Routes.MATCHES.id,
        path: Routes.MATCHES.path,
        element: <div>Match List</div>,
    },
    {
        id: Routes.MATCH.id,
        path: Routes.MATCH.path(Routes.MATCH.propMatchId),
        element: <div>Match</div>,
    },
    {
        id: Routes.GAME.id,
        path: Routes.GAME.path(Routes.GAME.propGameId),
        element: <div>Game</div>,
    }
];

export function useRouting() {
    const navigate = useNavigate();
    return {
        urlLogin: () => "/" + Routes.LOGIN.path,
        gotoLogin: () => void navigate("/" + Routes.LOGIN.path),

        urlRegister: () => "/" + Routes.REGISTER.path,
        gotoRegister: () => void navigate("/" + Routes.REGISTER.path),

        gotoMatches: () => void navigate("/" + Routes.MATCHES.path),
        gotoMatch: (matchId: string) => void navigate("/" + Routes.MATCH.path(matchId)),
    }
}

export function useRouteIds(): string[] {
    const matches = useMatches();
    return matches.map(it => it.id);
}