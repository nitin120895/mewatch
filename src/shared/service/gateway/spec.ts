/// <reference path="../types.ts"/>
// Auto-generated, edits will be overwritten
const spec: api.OpenApiSpec = {
	host: 'dev9-webfacing.mewatch.sg:8002',
	schemes: ['https'],
	basePath: '/api',
	contentTypes: [],
	accepts: ['application/json'],
	securityDefinitions: {
		accountAuth: {
			type: 'oauth2',
			description: 'Account JWT token',
			flow: 'password',
			tokenUrl: '/account/authorization',
			scopes: {
				Catalog: 'Access all read only content',
				Commerce: 'Perform account level transactions',
				Settings: 'Modify account settings',
				Playback: 'Allow playback of restricted content'
			}
		},
		profileAuth: {
			type: 'oauth2',
			description: 'Profile JWT token',
			flow: 'password',
			tokenUrl: '/account/profile/authorization',
			scopes: {
				Catalog: 'Modify profile preferences and activity (bookmarks, watch list)',
				Playback: 'Allow playback of restricted content'
			}
		},
		anonymousAuth: {
			type: 'oauth2',
			description: 'Anonymous JWT token',
			flow: 'implicit',
			authorizationUrl: '/authorization/anonymous',
			refreshUrl: '/authorization/refresh',
			scopes: {
				Catalog: 'Modify profile preferences and activity (bookmarks, watch list)'
			}
		},
		resetPasswordAuth: {
			type: 'apiKey',
			name: 'authorization',
			in: 'header'
		},
		verifyEmailAuth: {
			type: 'apiKey',
			name: 'authorization',
			in: 'header'
		},
		accountDeletionAuth: {
			type: 'basic'
		}
	}
};
export default spec;
