/**
 * Application routes with its version
 * https://github.com/Sairyss/backend-best-practices#api-versioning
 */
const apiRoot = '/api';
const webRoot = '';

export const routesV1 = {
  version: 'v1',
  api: {
    root: apiRoot,
    servers: `${apiRoot}/:project`,
    server: `${apiRoot}/:project/:server`,
    boss: `${apiRoot}/:project/:server/:raidBoss`,
  },
  web: {
    index: webRoot,
    asterios: `${webRoot}/asterios`,
    notify: `${webRoot}/admin/notify`,
    config: `${webRoot}/admin/config`,
    users: `${webRoot}/admin/users`
  },
};
