import { configPage } from 'shared/';
import { ListDetail as template } from 'shared/page/pageTemplate';
import ListPage from './ListPage';
import Lh1Standard from '../../pageEntry/list/Lh1Standard';
import Lh2Centered from '../../pageEntry/list/Lh2Centered';
import H11PageTitle from '../../pageEntry/hero/h11/H11PageTitle';
import Cs5ContinuousAutomatic from '../../pageEntry/continuous/Cs5ContinuousAutomatic';

export const listDetailEntries = [Lh1Standard, Lh2Centered, H11PageTitle, Cs5ContinuousAutomatic];

export default configPage(ListPage, {
	template,
	entryRenderers: listDetailEntries
});
