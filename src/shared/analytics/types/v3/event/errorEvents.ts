export enum ResourceTrackingEventDetailTypes {
	Page = 'page',
	Image = 'image',
	Unknown = 'unknown',
	CSS = 'css',
	JS = 'js',
	List = 'list',
	Video = 'video'
}

export interface IExceptionEventDetail {
	status: string;
	message: string;
	path: string;
	data: string;
	isFatal: boolean;
}

export interface IResourceErrorDetail {
	status: string;
	message: string;
	path: string;
	type?: ResourceTrackingEventDetailTypes;
}
