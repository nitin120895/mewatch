import * as React from 'react';
import ListHeader from './ListHeader';
import { Lh1Standard as template } from 'shared/page/pageEntryTemplate';

const Component: any = (props: PageEntryListProps) => <ListHeader {...props} />;
Component.template = template;
export default Component;
