import {useNavigate} from "react-router-dom";
import {Game} from "../../models/misc/game";

export function useGameSessionStart(): (gameId: Game.Id) => void {
    const navigate = useNavigate();
    return (gameId: string) => navigate("/game?id=" + gameId);
}