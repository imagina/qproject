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
          apiRoute: 'apiRoutes.qproject.tracking',
          permission: null,
          create: {
            title: this.$tr('qproject.layout.newTracking'),
          },
          read: false,
          update: false,
          delete: false,
          formLeft: {
            id: {value: ''},
            projectid: {value: ''},
            taskid: {value: ''},
            adminid: {value: this.$store.state.quserAuth.userData.idOld},
            start: {
              value: this.$moment().format('YYYY/MM/DD'),
              type: 'date',
              props: {
                label: `${this.$tr('ui.form.startDate')}`,
                options: (date) => date <= this.$moment().format('YYYY/MM/DD'),
                rules: ['date']
              }
            },
            hoursworked: {
              value: null,
              type: 'input',
              props: {
                label: this.$tr('qproject.layout.label.workedHours'),
                type: 'number',
                rules: [
                  val => this.validateTime || this.$tr('ui.message.fieldRequired')
                ]
              }
            },
            minutesworked: {
              value: null,
              type: 'input',
              props: {
                label: this.$tr('qproject.layout.label.workedMinutes'),
                type: 'number',
                rules: [
                  val => this.validateTime || this.$tr('ui.message.fieldRequired')
                ]
              }
            },
            comment: {
              value: '',
              type: 'input',
              props: {
                label: `${this.$tr('ui.form.comment')}`,
                type: 'textarea',
                rows: "3",
              },
            },
          },
        }
      },
      //Crud info
      crudInfo() {
        return this.$store.state.qcrudComponent.component[this.crudId] || {}
      },
      //Validate rules
      validateTime() {
        return (this.crudInfo.minutesworked || this.crudInfo.hoursworked) ? true : false
      },
    },
  }
</script>
