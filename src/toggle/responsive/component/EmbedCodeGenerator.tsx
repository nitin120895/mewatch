import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CopyInput from 'toggle/responsive/component/input/CopyInput';
import RadioButtonComponent from 'toggle/responsive/component/input/RadioButtonComponent';
import { Bem } from 'shared/util/styles';

import './EmbedCodeGenerator.scss';

const bem = new Bem('embed-code-generator');

interface EmbedCodeGeneratorProps {
	playerSizes?: {};
	embedPath: string;
	onCopied?: () => void;
}

interface EmbedCodeGeneratorState {
	playerSize?: string;
}

export default class EmbedCodeGenerator extends React.PureComponent<EmbedCodeGeneratorProps, EmbedCodeGeneratorState> {
	static defaultProps = {
		playerSizes: {
			small: {
				label: 'Small',
				width: 320,
				height: 180
			},
			medium: {
				label: 'Medium',
				width: 470,
				height: 270
			},
			large: {
				label: 'Large',
				width: 640,
				height: 360
			}
		}
	};

	state = {
		playerSize: 'small'
	};

	private getEmbedCode() {
		const { playerSizes, embedPath } = this.props;
		const { width, height } = playerSizes[this.state.playerSize];

		return `<iframe width="${width}" height="${height}" src="${embedPath}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
	}

	onChange = e => {
		this.setState({ playerSize: e.target.value });
	};

	renderPlayerSizeRadioButtons() {
		const { playerSizes } = this.props;
		const { playerSize } = this.state;

		return Object.keys(playerSizes).map(size => {
			const { label, width, height } = playerSizes[size];
			return (
				<div className={bem.e('radio')} key={size}>
					<RadioButtonComponent
						value={size}
						key={size}
						name="playerSize"
						checked={playerSize === size}
						label={label}
						onChange={e => this.onChange(e)}
					/>
					<div>{`(${width}x${height}px)`}</div>
				</div>
			);
		});
	}
	render() {
		const { onCopied } = this.props;

		return (
			<div className={bem.b()}>
				<CopyInput
					id="embedCodeInput"
					name="embedCodeInput"
					label={'@{share_modal_embed_label|Embed}'}
					value={this.getEmbedCode()}
					onCopied={onCopied}
				/>

				<div className={bem.e('player-size')}>
					<IntlFormatter elementType="div" className={bem.e('label')}>
						{'@{share_modal_player_size_label|Player Size}'}
					</IntlFormatter>
					{this.renderPlayerSizeRadioButtons()}
				</div>
			</div>
		);
	}
}
