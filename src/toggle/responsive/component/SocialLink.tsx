import * as React from 'react';
import Link from 'shared/component/Link';
import { isMobile } from 'shared/util/browser';

interface Props {
	item: api.SocialLinkEntry;
}

interface State {
	hover: boolean;
}

export default class SocialLink extends React.PureComponent<Props, State> {
	state = {
		hover: false
	};

	onMouseEnter = () => {
		this.setState({
			hover: true
		});
	};

	onMouseLeave = () => {
		this.setState({
			hover: false
		});
	};

	render() {
		const { images, link } = this.props.item;
		const currentImage = this.state.hover ? images.custom : images.logo;
		return (
			<div
				className="social-link"
				onMouseEnter={isMobile() ? undefined : this.onMouseEnter}
				onMouseLeave={isMobile() ? undefined : this.onMouseLeave}
			>
				<Link to={link}>
					<img src={currentImage} />
				</Link>
			</div>
		);
	}
}
