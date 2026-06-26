import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useMatchId, useMatchViewModel} from "@pages/match/match.view-model.ts";

export function MatchPage() {

    const matchId = useMatchId();
    const viewModel = useMatchViewModel(matchId);

    return (
        <VerticalLayout center fillWidth fillHeight>
            {viewModel.match.loading && (
                <div>Loading...</div>
            )}
            {!viewModel.match.loading && (
                <VerticalLayout verticalStart horizontalStretch spacingS>
                    <span><b>Name: </b>{viewModel.match.data.name}</span>
                    <span><b>Id: </b>{viewModel.match.data.id}</span>
                    <b>Participants:</b>
                    <ul>
                        {viewModel.match.data.participants.map(it => (
                            <li key={it}>{it}</li>
                        ))}
                    </ul>
                    <span><b>State: </b>{viewModel.match.data.state}</span>
                    <button onClick={viewModel.createGame.execute}>Create Game</button>
                    <button onClick={viewModel.startGame.execute}>Start</button>
                </VerticalLayout>
            )}
        </VerticalLayout>
    );
}