import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {VSpacer} from "../../components/spacer/Spacer";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";
import {Txt} from "../../components/text/Txt";


export function PageNotFound(): ReactElement {
	return (
		<BackgroundPanel image="/images/image_4.bmp">
			<DecoratedPanel ornament>
				<VBox padding_l centerVertical left gap_s>
					<Txt.Header1>
						<Txt.String>404</Txt.String>
					</Txt.Header1>
					<VSpacer size_s/>
					<Txt.Body>
						<Txt.String>The requested page does not exist.</Txt.String>
					</Txt.Body>
				</VBox>
			</DecoratedPanel>
		</BackgroundPanel>
	);
}