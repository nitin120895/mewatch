export function mcSSOSignIn(body: any, rc: string): Promise<any> {
	const path = '/mcs-signin';

	const headers = getSSOFetchOptions.headers;
	headers['X-Authorization'] = `Bearer ${rc}`;

	const hashBody = { body: btoa(JSON.stringify(body)) };
	const operation = { ...getSSOFetchOptions, headers, ...{ body: JSON.stringify(hashBody) } };

	return fetch(path, operation)
		.then(res => res.json())
		.catch(error => {
			return { error: error };
		});
}

const getSSOFetchOptions: any = {
	contentTypes: ['application/json'],
	method: 'post',
	compress: true,
	credentials: 'same-origin',
	mode: 'cors',
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json'
	}
};

export function encryptSSOToken(token: string): Promise<any> {
	const path = '/mc-sso-token';
	const operation = { ...getSSOFetchOptions, ...{ body: JSON.stringify({ token }) } };

	return fetch(path, operation)
		.then(res => res.json())
		.catch(e => Promise.reject(e));
}

export function trySharedSession(session_uid, device_id): Promise<any> {
	return fetch('/mc-sso-shared-signin', {
		...getSSOFetchOptions,
		body: JSON.stringify({ session_uid, device_id })
	})
		.then(res => res.json())
		.catch(e => Promise.reject(e));
}
