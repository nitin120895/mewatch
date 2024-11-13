if (process.env.NODE_ENV === 'production') return;

require('shelljs/global');

exec('npm run setup:env');
