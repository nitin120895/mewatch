export interface RoleData {
	dataKey: string;
	labelKey: string;
}

export const requiredRoles: RoleData[] = [
	{
		dataKey: 'director',
		labelKey: '@{itemDetail_cast_directors_label|{peopleCount, plural, one {Director} other {Directors}}}'
	},
	{ dataKey: 'actor', labelKey: '@{itemDetail_cast_actors_label|Cast}' },
	{
		dataKey: 'producer',
		labelKey: '@{itemDetail_cast_producers_label|{peopleCount, plural, one {Producer} other {Producers}}}'
	},
	{
		dataKey: 'writer',
		labelKey: '@{itemDetail_cast_writers_label|{peopleCount, plural, one {Writer} other {Writers}}}'
	},
	{
		dataKey: 'filminglocation',
		labelKey:
			'@{itemDetail_cast_filming_location_label| {peopleCount, plural, one {Filming Location} other {Filming Locations}}}'
	},
	{
		dataKey: 'voice',
		labelKey: '@{itemDetail_cast_voice_label| {peopleCount, plural, one {Voice} other {Voices}}}'
	},
	{
		dataKey: 'productmanager',
		labelKey:
			'@{itemDetail_cast_product_manager_label| {peopleCount, plural, one {Product manager} other {Product managers}}}'
	},
	{
		dataKey: 'associateproducer',
		labelKey:
			'@{itemDetail_cast_associate_producer_label| {peopleCount, plural, one {Associate producer} other {Associate producers}}}'
	},
	{
		dataKey: 'executiveproducer',
		labelKey:
			'@{itemDetail_cast_executive_producer_label| {peopleCount, plural, one {Executive producer} other {Executive producers}}}'
	},
	{
		dataKey: 'guest',
		labelKey: '@{itemDetail_cast_guest_label| {peopleCount, plural, one {Guest} other {Guests}}}'
	},
	{
		dataKey: 'narrator',
		labelKey: '@{itemDetail_cast_narrator_label| {peopleCount, plural, one {Narrator} other {Narrators}}}'
	},
	{
		dataKey: 'presenter',
		labelKey: '@{itemDetail_cast_presenter_label| {peopleCount, plural, one {Presenter} other {Presenters}}}'
	},
	{
		dataKey: 'thememusicby',
		labelKey: '@{itemDetail_cast_theme_music_by_label|Theme music by}}'
	}
];
