const moduleName = 'iprojects';
const moduleVersion = 'v1';
const urlBase = `/${moduleName}/${moduleVersion}`


export default {
  urlBase : urlBase,
  version: moduleVersion,
  projects: `${urlBase}/projects`,
  projectStatus: `${urlBase}/projects/status`,
  tasks: `${urlBase}/tasks`,
  tracking: `${urlBase}/tracking`,
  users: `${urlBase}/users`,
}
