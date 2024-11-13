import { IWidgetView } from '@wscsports/blaze-web-sdk';

export interface IWSCWidgetActions extends IWidgetView {
	setWidgetSize: (width: string, height: string) => void;
}
