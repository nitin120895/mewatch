import * as React from 'react';
import SeasonList from 'ref/responsive/pageEntry/itemDetail/d1/SeasonList';
import SeasonSelector from 'ref/responsive/pageEntry/itemDetail/d1/SeasonSelector';

const mockSeasons: api.ItemSummary[] = '1234567'.split('').map(
	i =>
		({
			id: i,
			type: 'movie',
			title: `season ${i}`,
			path: `/season-${i}`,
			seasonNumber: parseInt(i, 10)
		} as api.ItemSummary)
);

export default class SeasonListComponents extends React.Component<PageProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<main>
				<h3>Season List Component</h3>
				<section>
					<p>Normal Season List</p>
					<SeasonList seasons={mockSeasons} selectedSeasonId="2" />
				</section>
				<section>
					<p>Dropdown Season List Drop Down - left position</p>
					<SeasonSelector seasons={mockSeasons} selectedSeasonId="2" position="left" autoExpand={false} />
				</section>
				<section>
					<p>Dropdown Season List Drop Down - right position</p>
					<SeasonSelector seasons={mockSeasons} selectedSeasonId="2" position="right" autoExpand={false} />
				</section>
				<section>
					<p>Auto Expand Season List Drop Down</p>
					<SeasonSelector seasons={mockSeasons} selectedSeasonId="7" />
				</section>
				<section>
					<p>Auto Expand Season List Drop Down - right position</p>
					<SeasonSelector seasons={mockSeasons} selectedSeasonId="3" position="right" />
				</section>
			</main>
		);
	}
}
