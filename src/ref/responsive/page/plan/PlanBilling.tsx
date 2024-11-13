import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { PlanBilling as key } from 'shared/page/pageKey';

const PlanBilling = (props: PageProps) => <div>PlanBilling</div>;

export default configPage(PlanBilling, { template, key });
