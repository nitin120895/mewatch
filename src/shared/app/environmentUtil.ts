import { getItem, setItem } from 'shared/util/localStorage';

const CLIENT_CURRENT_SERVICE = 'curEnv';
let availableServices: ClientService[];
let clientService = getItem(CLIENT_CURRENT_SERVICE) || {
	rocket: process.env.CLIENT_SERVICE_URL,
	rocketCDN: process.env.CLIENT_SERVICE_CDN_URL
};

export function getAvailableServices() {
	return availableServices;
}

export function setClientService(newService: ClientService) {
	return setItem(CLIENT_CURRENT_SERVICE, newService);
}

export function getClientService() {
	return clientService;
}

export function loadServices() {
	return fetch(_DISCOVER_)
		.then(res => res.json())
		.then(json => setAvailableService(json))
		.catch(e => setAvailableService());
}

function setAvailableService(services?: { [key: string]: ClientService[] }) {
	if (services) {
		availableServices = services.available;
		return;
	}
	const service = getClientService();
	availableServices = [service];
}
