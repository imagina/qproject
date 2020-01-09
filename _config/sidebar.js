const pages = config('pages') // Get Pages from config

//Blog
export default [
  {
    title: 'qproject.sidebar.adminGroup',
    icon: 'fas fa-copy',
    children: [
      pages.qproject.projects, // projects
      pages.qproject.tasks, // tasks
    ]
  },
]
