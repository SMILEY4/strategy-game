import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useMatchListViewModel} from "@pages/matchList/match-list.view-model.ts";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Link} from "react-router";

export function MatchListPage() {

    const viewModel = useMatchListViewModel();

    return (
        <VerticalLayout center fillWidth fillHeight>
            <VerticalLayout verticalStart horizontalStretch spacingS>
                <button onClick={viewModel.create.execute}>Create</button>
                {viewModel.list.loading && (
                    <div>Loading...</div>
                )}
                {!viewModel.list.loading && viewModel.list.matches.map(match => (
                    <HorizontalLayout key={match.id} verticalCenter horizontalSpaceBetween style={{border: "1px solid gray", padding: "10px"}}>
                        <Link to={`/match/${match.id}`}>{match.name}</Link>
                        <button onClick={() => viewModel.delete.execute(match.id)}>Delete</button>
                    </HorizontalLayout>
                ))}
            </VerticalLayout>
        </VerticalLayout>
    );


}