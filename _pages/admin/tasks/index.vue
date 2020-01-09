<template>
  <div id="projectsPage">
    <div class="content row q-col-gutter-x-lg relative-position">
      <!--== Left actions ==-->
      <div class="col-12 col-md-3">
        <!--Filter-->
        <filter-component class="col-12 col-md-3 q-mb-md" v-model="filter" filter-tasks
                          @refresh="getTasks(true)" @filter="getTasks()"/>

        <!--Tab project-->
        <tab-project read-only :project-data="project" v-if="project && filter.projectId" @created="getTasks(true)"/>
      </div>

      <!--== Content ==-->
      <div class="col-12 col-md-9">
        <!--== Title ==-->
        <div class="text-primary text-h5 text-center">
          <q-icon :name="$route.meta.icon" class="q-mr-md"/>
          {{tasks.length}} {{$trp('qproject.layout.label.task')}}
        </div>
        <q-separator class="q-my-md"/>

        <!--== Dashboard ==-->
        <div class="dashboard text-center" v-if="dashBoard">
          <q-chip square v-for="(item, key) in dashBoard" :key="key">
            <q-avatar :color="item.color" text-color="white">{{item.quantity}}</q-avatar>
            {{item.label}}
          </q-chip>
        </div>
        <q-separator class="q-my-md"/>

        <!--== Tasks ==-->
        <q-scroll-area :delay="1200" style="height: calc(100vh - 300px)">
          <!--Table-->
          <q-table :data="tasks" :columns="columns" row-key="name" :grid="filter.grid"
                   :pagination.sync="pagination" v-if="tasks.length">
            <!--Custom grid-->
            <template v-slot:item="props">
              <div class="q-pa-md col-12 col-lg-6 col-xl-4 grid-style-transition">
                <tab-task :task-data="props.row"/>
              </div>
            </template>
            <!--Custom Columns-->
            <template v-slot:body-cell-tracking="props">
              <q-td :props="props">
                <q-btn unelevated class="btn-small"
                       @click="$refs.crudTracking.create({projectid : props.row.project.id, taskid: props.row.id})"
                       :label="$tr('ui.label.add')" color="cyan"/>
                <div class="q-my-xs"></div>
                <q-btn unelevated class="btn-small" :label="$tr('ui.label.all')" color="teal"
                       @click="$refs.modalTracking.open(props.row)"/>
              </q-td>
            </template>
            <template v-slot:body-cell-title="props">
              <q-td :props="props" style="max-width: 180px" class="ellipsis">
                <!--title-->
                <div class="text-caption">
                  <q-icon name="far fa-sticky-note"/>
                  {{props.value}}
                </div>
                <!--Project-->
                <a class="text-primary" target="_blank"
                   :href="`https://clientes.imaginacolombia.com/imadmin/addonmodules.php?module=project_management&m=view&projectid=${props.row.project.id}`">
                  <q-icon name="fas fa-link"/>
                  {{props.row.project}}
                </a>
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip dense text-color="white" :color="props.value ? 'teal' : 'warning'">
                  {{ props.value ? $tr('ui.label.completed') : $tr('ui.label.pending') }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-dueDate="props">
              <q-td :props="props">
                <div>{{props.value ? $trd(props.value) : '-'}}</div>
                <!--Status date-->
                <q-chip dense :color="statusTask(props.value).color" v-if="!props.row.status"
                        :text-color="statusTask(props.value).textColor"
                        :icon="statusTask(props.value).icon">
                  {{statusTask(props.value).label}}
                </q-chip>
              </q-td>
            </template>
          </q-table>
          <!--== Not results ==-->
          <not-result class="text-center q-pt-xl" v-else/>
        </q-scroll-area>
      </div>

      <!--== Modal Tracking ==-->
      <modal-tracking ref="modalTracking"/>

      <!--== Crud tracking ==-->
      <crud :crud-data="import('@imagina/qproject/_crud/tracking')" type="hide" ref="crudTracking"/>

      <!--Inner loading-->
      <inner-loading :visible="loading"/>
    </div>
  </div>
</template>
<script>
  //Components
  import tabProject from '@imagina/qproject/_components/tabProject'
  import tabTask from '@imagina/qproject/_components/tabTask'
  import filterComponent from '@imagina/qproject/_components/filter'
  import modalTracking from '@imagina/qproject/_components/modalTracking'

  export default {
    props: {},
    components: {tabProject, tabTask, filterComponent, modalTracking},
    watch: {},
    mounted() {
      this.$nextTick(function () {
        this.init()
      })
    },
    data() {
      return {
        loading: false,
        filter: {},
        project: false,
        tasks: [],
        pagination: {
          page: 1,
          rowsPerPage: 15
        }
      }
    },
    computed: {
      columns() {
        return [
          {
            name: 'tracking', align: 'left',
            label: this.$trp('qproject.layout.label.tracking'),
            field: 'tasks'
          },
          {
            name: 'title', align: 'left',
            label: this.$tr('ui.form.title'),
            field: 'title'
          },
          {
            name: 'status', align: 'center',
            label: this.$tr('ui.form.status'),
            field: 'status'
          },
          {
            name: 'assignedTo', align: 'center',
            label: this.$tr('qproject.layout.label.assignedTo'),
            field: 'admin'
          },
          {
            name: 'dueDate', align: 'center',
            label: this.$tr('ui.form.dueDate'),
            field: 'dueDate'
          },
          {
            name: 'parent', align: 'center',
            label: this.$tr('ui.form.parent'),
            field: 'parent'
          },
          {
            name: 'createdAt', align: 'center',
            label: this.$tr('ui.form.createdAt'),
            format: val => val ? this.$trd(val) : '-',
            field: 'createdAt'
          },
        ]
      },
      dashBoard() {
        let tasks = this.$clone(this.tasks)
        let response = {}
        let status = [
          {label: this.$tr('ui.label.completed'), id: 1, color: 'teal'},
          {label: this.$tr('ui.label.pending'), id: 0, color: 'warning'}
        ]

        //Get status
        status.forEach(status => {
          response[status.label] = {
            label: status.label,
            quantity: tasks.filter(task => parseInt(task.status) == parseInt(status.id)).length,
            color: status.color
          }
        })

        //Get expired tasks
        response[this.$tr('ui.label.expired')] = {
          label: this.$tr('ui.label.expired'),
          color: 'negative',
          quantity: tasks.filter(task => {
            let daysLeft = this.$date.getDiff(new Date(), task.dueDate).days
            return ((task.status == 1) || daysLeft) ? false : true
          }).length,
        }

        return response
      }
    },
    methods: {
      init() {
        this.getTasks()
      },
      //Get projects
      getTasks(refresh = false) {
        return new Promise((resolve, reject) => {
          this.loading = true
          let requestParams = {
            refresh: refresh,
            params: {filter: this.filter},
          }

          //Request
          this.$crud.index('apiRoutes.qproject.tasks', requestParams).then(response => {
            this.tasks = response.data
            this.project = response.data[0].project
            this.loading = false
          }).catch(error => this.loading = false)
        })
      },
      //Get status task
      statusTask(dueDate) {
        let daysLeft = this.$date.getDiff(new Date(), dueDate).days
        return {
          label: daysLeft ?
            `${daysLeft} ${this.$tr('qproject.layout.message.daysLeft')}` : this.$tr('ui.label.expired'),
          color: daysLeft ? 'grey-4' : 'negative',
          textColor: daysLeft ? 'grey-9' : 'white',
          icon: daysLeft ? 'fas fa-clock' : 'fas fa-exclamation-triangle'
        }
      },
    }
  }
</script>
<style lang="stylus">
  #projectsPage
    .q-card
      .due-project
        background-color $negative
        color white

        .q-item__section, .q-item__label
          color white
</style>
