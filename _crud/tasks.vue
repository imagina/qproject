<template></template>
<script>
  export default {
    data() {
      return {
        crudId: this.$uid()
      }
    },
    computed: {
      crudData() {
        return {
          crudId: this.crudId,
          apiRoute: 'apiRoutes.qproject.tasks',
          permission: 'iprojects.tasks',
          create: {
            title: this.$tr('qproject.layout.newTask'),
          },
          read: {
            columns: [],
          },
          update: {
            title: this.$tr('qproject.layout.updateTask'),
          },
          delete: true,
          formLeft: {
            id: {value: ''},
            projectid: {value: ''},
            task: {
              value: '',
              type: 'input',
              props: {
                label: `${this.$tr('ui.form.title')}*`,
                rules: [
                  val => !!val || this.$tr('ui.message.fieldRequired')
                ],
              },
            },
            adminid: {
              value: '',
              type: 'select',
              props: {
                label: `${this.$tr('ui.form.assignedTo')}*`,
                rules: [
                  val => !!val || this.$tr('ui.message.fieldRequired')
                ],
              },
              loadOptions: {
                apiRoute: 'apiRoutes.quser.users',
                select: {label: 'fullName', id: 'idOld'}
              }
            },
            duedate: {
              value: '',
              type: 'date',
              props: {
                label: `${this.$tr('ui.form.dueDate')}*`,
                rules: [
                  val => !!val || this.$tr('ui.message.fieldRequired')
                ],
                options: (date) => date > this.$moment().format('YYYY/MM/DD')
              },
            },
            parentid: {
              value: 0,
              type: 'select',
              props: {
                label: `${this.$tr('ui.form.parent')}*`,
                rules: [
                  val => !!val || this.$tr('ui.message.fieldRequired')
                ],
              },
              loadOptions: {
                apiRoute: 'apiRoutes.qproject.tasks',
                requestParams: {filter: {projectId: this.crudInfo.projectid}}
              }
            },
          },
        }
      },
      //Crud info
      crudInfo() {
        return this.$store.state.qcrudComponent.component[this.crudId] || {}
      },
    },
  }
</script>
