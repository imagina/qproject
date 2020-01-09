export default {
  projects: {
    permission: 'iprojects.projects.manage',
    activated: true,
    authenticated: true,
    path: '/projects',
    name: 'qproject.admin.projects',
    page: () => import('@imagina/qproject/_pages/admin/projects/index'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'qproject.sidebar.adminProjects',
    icon: 'fas fa-laptop-code',
  },
  tasks: {
    permission: 'iprojects.tasks.manage',
    activated: true,
    authenticated: true,
    path: '/projects/tasks',
    name: 'qproject.admin.tasks',
    page: () => import('@imagina/qproject/_pages/admin/tasks/index'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'qproject.sidebar.adminTasks',
    icon: 'fas fa-sticky-note',
  },
}
