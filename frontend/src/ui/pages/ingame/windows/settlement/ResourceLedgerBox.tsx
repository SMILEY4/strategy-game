import {ResourceLedgerEntry} from "../../../../../models/base/Settlement";
import React, {ReactElement} from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {If, Then} from "react-if";
import "./resourceLedgerBox.less";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Divider} from "../../../../components/divider/Divider";
import {Tooltip} from "../../../../components/tooltip/Tooltip";
import {Txt} from "../../../../components/text/Txt";

export function ResourceLedgerBox(props: ResourceLedgerEntry): ReactElement {

	return (
		<Tooltip.Context>
			<Tooltip.Trigger>
				<Box {...props}/>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<Details {...props}/>
			</Tooltip.Content>
		</Tooltip.Context>
	);
}

function Box(props: ResourceLedgerEntry): ReactElement {
	return (
		<DecoratedPanel blue pattern className="resource-ledger-box">
			<div
				className="resource-ledger-box__icon"
				style={{backgroundImage: "url('/icons/resources/" + props.type + ".png')"}}
			/>
			<Txt.Body className="resource-ledger-box__label">
				<Txt.Number>{props.amount}</Txt.Number>
				{props.missing.amount > 0
					? (
						<>
							<Txt.String>/</Txt.String>
							<Txt.Number behaviour="less-is-better"
										signBehaviour="never">{props.missing.amount}</Txt.Number>
						</>
					)
					: undefined}
			</Txt.Body>
		</DecoratedPanel>
	);
}

function Details(props: ResourceLedgerEntry): ReactElement {
	return (
		<VBox fullSize padding_s gap_xs>

			<Txt.Header4>
				<Txt.Icon name={props.type.toLowerCase()}/>
				<Txt.Whitespace/>
				<Txt.String>{props.type}</Txt.String>
			</Txt.Header4>

			<Divider line/>

			<If condition={props.produced.amount > 0 && props.produced.details.length > 0}>
				<Then>
					<Txt.Body>
						<Txt.Number behaviour="more-is-better"
									signBehaviour="always">{props.produced.amount}</Txt.Number>
						<Txt.Whitespace/>
						<Txt.String>Produced</Txt.String>
					</Txt.Body>
					<InsetPanel>
						<VBox padding_xs gap_xs fullSize>
							{props.produced.details.map(detail => (
								<Txt.Body>
									<Txt.Number behaviour="more-is-better"
												signBehaviour="always">{detail.amount}</Txt.Number>
									<Txt.Whitespace/>
									<Txt.String>{detail.key}</Txt.String>
								</Txt.Body>
							))}
						</VBox>
					</InsetPanel>
				</Then>
			</If>

			<If condition={props.consumed.amount > 0 && props.consumed.details.length > 0}>
				<Then>
					<Txt.Body>
						<Txt.Number behaviour="more-is-better" signBehaviour="always"
									zeroClassification="neutral">{-props.consumed.amount}</Txt.Number>
						<Txt.Whitespace/>
						<Txt.String>Consumed</Txt.String>
					</Txt.Body>
					<InsetPanel>
						<VBox padding_xs gap_xs fullSize>
							{props.consumed.details.map(detail => (
								<Txt.Body>
									<Txt.Number behaviour="more-is-better" signBehaviour="always"
												zeroClassification="neutral">{-detail.amount}</Txt.Number>
									<Txt.Whitespace/>
									<Txt.String>{detail.key}</Txt.String>
								</Txt.Body>
							))}
						</VBox>
					</InsetPanel>
				</Then>
			</If>

			<If condition={props.missing.amount > 0 && props.missing.details.length > 0}>
				<Then>
					<Txt.Body>
						<Txt.Number behaviour="less-is-better" signBehaviour="never"
									zeroClassification="neutral">{props.missing.amount}</Txt.Number>
						<Txt.Whitespace/>
						<Txt.String>Missing</Txt.String>
					</Txt.Body>
					<InsetPanel>
						<VBox padding_xs gap_xs fullSize>
							{props.missing.details.map(detail => (
								<Txt.Body>
									<Txt.Number behaviour="less-is-better" signBehaviour="never"
												zeroClassification="neutral">{detail.amount}</Txt.Number>
									<Txt.Whitespace/>
									<Txt.String>{detail.key}</Txt.String>
								</Txt.Body>
							))}
						</VBox>
					</InsetPanel>
				</Then>
			</If>

		</VBox>
	);
}
