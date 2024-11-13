import * as React from 'react';
import { Bem } from 'shared/util/styles';
import H10Text from 'ref/tv/pageEntry/hero/h10/H10Text';
import EntryList from 'ref/tv/component/EntryList';
import { FormattedMessage } from 'react-intl';
import sass from 'ref/tv/util/sass';
import './AccountProfileStyles.scss';

type FavouriteListProps = {
	emptyMessage?: string;
	favouriteItemLists?: api.ItemList[];
	rowType?: { [key: string]: string };
	customFields?: { [key: string]: any };
	title?: string;
	location: HistoryLocation;
};

const bem = new Bem('favourite-list');

function renderEntryList(emptyMessage, favouriteItemLists, rowType, customFields, title, location) {
	if (emptyMessage) {
		return renderMessage(emptyMessage);
	} else {
		return (
			favouriteItemLists &&
			favouriteItemLists.map((item, index) => {
				const itemsIndex = index + 1;
				const listRowType = rowType[item.id];
				let rowHeight = 0;
				let rowTemplate;

				switch (listRowType) {
					case 'p1':
						rowHeight = sass.p1StandardHeight;
						rowTemplate = 'P1';
						break;
					case 't1':
						rowHeight = sass.t1StandardHeight;
						rowTemplate = 'T1';
						break;
					case 'b1':
						rowHeight = sass.b1StandardHeight;
						rowTemplate = 'B1';
						break;
					case 's1':
						rowHeight = sass.s1StandardHeight;
						rowTemplate = 'S1';
						break;
					default:
						break;
				}

				return (
					<section id={'row' + itemsIndex} className="page-entry" key={'title' + index}>
						<EntryList
							imageType={item.customFields.imageType}
							imageWidth={item.customFields.imageWidth}
							rowType={listRowType}
							focusable={true}
							index={itemsIndex}
							list={item}
							loadNextListPage={undefined}
							loadListPage={undefined}
							id={item.id}
							title={item.id}
							template={rowTemplate}
							savedState={undefined}
							customFields={customFields}
							displayPlayIcon={false}
							rowHeight={rowHeight}
							location={location}
							type={'ListEntry'}
							isUserList
						/>
					</section>
				);
			})
		);
	}
}

export function renderMessage(message: string) {
	return (
		<FormattedMessage id={message}>{title => <div className="empty-message-wrapper">{title}</div>}</FormattedMessage>
	);
}

export default function FavouriteList({
	emptyMessage,
	favouriteItemLists,
	rowType,
	customFields,
	title,
	location
}: FavouriteListProps) {
	return (
		<div className={bem.e('container')}>
			<H10Text
				text={title}
				title={title}
				customFields={{
					subheading: undefined,
					backgroundColor: { color: '#007bc7', opacity: 100 },
					textColor: { color: '', opacity: 100 },
					textHorizontalAlignment: 'left'
				}}
				template={'H10'}
				savedState={undefined}
				id={undefined}
				location={location}
				index={0}
				type={'TextEntry'}
			/>
			<div className={bem.e('body')}>
				<div className={bem.e('body-wrapper content-margin')}>
					{renderEntryList(emptyMessage, favouriteItemLists, rowType, customFields, title, location)}
				</div>
			</div>
		</div>
	);
}
