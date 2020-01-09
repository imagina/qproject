<template>
  <div id="tabProjectComponent" v-if="project">
    <q-card class="shadow-1">
      <!--Content-->
      <q-card-section class="q-pa-none">
        <q-list class="q-pa-sm" separator>
          <!--Title-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>
                <q-icon name="fas fa-laptop-code" class="q-mr-xs"/>
                <label>{{$tr('qproject.layout.label.project')}}</label>
              </q-item-label>
              <q-item-label class="ellipsis" :title="project.title">
                <a class="text-primary" target="_blank"
                   :href="`https://clientes.imaginacolombia.com/imadmin/addonmodules.php?module=project_management&m=view&projectid=${project.id}`">
                  <q-icon name="fas fa-link"/>
                  {{project.title}}
                </a>
              </q-item-label>
            </q-item-section>
          </q-item>
          <!--Status-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.status')}}</q-item-label>
              <q-item-label class="text-center row items-center" style="min-height: 52px">
                <div class="col-12">
                  <!--Status invoice-->
                  <div v-if="!project.invoice" class="text-negative q-mb-xs">
                    <q-icon name="fas fa-exclamation-triangle"/>
                    {{$tr('qproject.layout.message.notInvoice')}}
                  </div>
                  <!--Status name-->
                  <q-chip dense :color="colorStatus[project.status]" text-color="white">
                    {{ project.status }}
                  </q-chip>
                  <!--Status date-->
                  <q-chip dense :color="statusProject(project.dueDate).color"
                          v-if="project.status != 'Completado'"
                          :text-color="statusProject(project.dueDate).textColor"
                          :icon="statusProject(project.dueDate).icon">
                    {{statusProject(project.dueDate).label}}
                  </q-chip>
                </div>
              </q-item-label>
            </q-item-section>
          </q-item>
          <!--Assigned to-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.assignedTo')}}</q-item-label>
              <q-item-label>{{project.admin || '-'}}</q-item-label>
            </q-item-section>
          </q-item>
          <!--Created AT-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.createdAt')}}</q-item-label>
              <q-item-label>{{project.createdAt ? $trd(project.createdAt) : '-'}}</q-item-label>
            </q-item-section>
          </q-item>
          <!--Updated At-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.updatedAt')}}</q-item-label>
              <q-item-label>{{project.updatedAt ? $trd(project.updatedAt) : '-'}}</q-item-label>
            </q-item-section>
          </q-item>
          <!--Due date-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.dueDate')}}</q-item-label>
              <q-item-label>{{project.dueDate ? $trd(project.dueDate) : ''}}</q-item-label>
            </q-item-section>
          </q-item>
          <!--Tasks-->
          <q-item v-if="!readOnly">
            <q-item-section class="q-py-sm">
              <q-item-label caption>
                {{$tr('qproject.layout.label.task')}}
              </q-item-label>
              <q-item-label>
                <div class="ellipsis" :title="project.lastTask">
                  {{project.lastTask || '-'}}
                </div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator/>
      <!--Actions-->
      <q-btn-group spread>
        <!--Button to list tasks-->
        <q-btn unelevated class="text-weight-bold q-py-sm" v-if="project.lastTask && !readOnly"
               @click="$router.push({name : 'qproject.admin.tasks', query : {projectId : project.id}})"
               :label="$tr('qproject.layout.message.listTasks')"/>
        <!--Button create tasks-->
        <q-btn unelevated class="text-weight-bold q-py-sm" :label="$tr('qproject.layout.newTask')"
               @click="$refs.crudTasks.create({projectid : project.id})"
               v-if="$auth.hasAccess('iprojects.tasks.create')"/>
      </q-btn-group>
      <!--CRUD Task-->
      <crud :crud-data="import('@imagina/qproject/_crud/tasks')" type="hide" ref="crudTasks"
            @created="addedTask"/>
    </q-card>
  </div>
</template>
<script>
  export default {
    props: {
      projectData: false,
      readOnly: {type: Boolean, default: false}
    },
    components: {},
    watch: {
      projectData(newValue) {
        this.project = this.$clone(newValue)
      }
    },
    mounted() {
      this.$nextTick(function () {
        this.project = this.$clone(this.projectData)
      })
    },
    data() {
      return {
        project: false
      }
    },
    computed: {
      colorStatus() {
        return {
          'Abandonado': 'blue-grey',
          'Completado': 'teal',
          'En espera de Cliente': 'deep-orange-4',
          'En progreso': 'cyan',
          'Pendiente': 'warning'
        }
      },
    },
    methods: {
      //Get status project
      statusProject(dueDate) {
        let daysLeft = this.$date.getDiff(new Date(), dueDate).days
        return {
          label: daysLeft ?
            `${daysLeft} ${this.$tr('qproject.layout.message.daysLeft')}` : this.$tr('ui.label.expired'),
          color: daysLeft ? 'grey-4' : 'negative',
          textColor: daysLeft ? 'grey-9' : 'white',
          icon: daysLeft ? 'fas fa-clock' : 'fas fa-exclamation-triangle'
        }
      },
      //addedTask
      addedTask(task) {
        if (this.project.tasks) this.project.tasks.unshift({...task, title: task.task})
        this.$emit('created')
      }
    }
  }
</script>
<style lang="stylus">
  #tabProjectComponent
    .q-card
      .q-item
        padding 5px

        .q-item__section
          padding 0
</style>
