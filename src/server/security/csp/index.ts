import * as log from '../../logger';

const CSP_ENABLED: boolean = _SSR_ && process.env.FF_CSP === 'true';

if (_SSR_) log.info(`${CSP_ENABLED ? '🔒' : '🔓'}  Content Security Policy is ${CSP_ENABLED ? 'enabled' : 'disabled'}`);

export default CSP_ENABLED;
