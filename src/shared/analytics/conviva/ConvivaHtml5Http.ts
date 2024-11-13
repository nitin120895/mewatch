/// <reference path="conviva-core-sdk.d.ts" />

export class ConvivaHtml5Http implements Conviva.HttpInterface {
	makeRequest(
		httpMethod: 'GET' | 'POST',
		url: string,
		data: string | null,
		contentType: string | null,
		timeoutMs: number,
		callback: Conviva.HttpRequestCallback | null
	): Conviva.HttpRequestCancelFunction {
		const init: RequestInit = { method: httpMethod };
		if (contentType) init.headers = { 'Content-Type': contentType };
		if (data) init.body = data;
		let succeeded = false;
		fetch(url, init).then(response => {
			succeeded = response.ok;
			response.text().then(text => {
				if (callback) callback(succeeded, text);
			});
		});
		return undefined;
	}

	release(): void {}
}
