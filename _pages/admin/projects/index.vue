<template>
  <div id="projectsPage">
    <div class="content row q-col-gutter-x-md relative-position">
      <!--== Filters ==-->
      <filter-component class="col-12 col-md-3" v-model="filter"
                        @refresh="getProjects(true)" @filter="getProjects()"/>

      <!--== Content ==-->
      <div class="col-12 col-md-9">
        <!--== Title ==-->
        <div class="text-primary text-h5 text-center">
          <q-icon :name="$route.meta.icon" class="q-mr-md"/>
          {{projects.length}} {{$trp('qproject.layout.label.project')}}
        </div>
        <q-separator class="q-my-md"/>

        <!--== Dashboard ==-->
        <div class="dashboard text-center">
          <q-chip square v-for="(item, key) in dashBoard" :key="key">
            <q-avatar :color="item.color" text-color="white">{{item.quantity}}</q-avatar>
            {{item.label}}
          </q-chip>
        </div>
        <q-separator class="q-my-md"/>

        <!--== Projects ==-->
        <q-scroll-area :delay="1200" style="height: calc(100vh - 324px)">
          <!--Table-->
          <q-table :data="projects" :columns="columns" row-key="name" :grid="filter.grid"
                   :pagination.sync="pagination" v-if="projects.length">
            <!--Custom grid-->
            <template v-slot:item="props">
              <div class="q-pa-md col-12 col-lg-6 col-xl-4 grid-style-transition">
                <tab-project :project-data="props.row"/>
              </div>
            </template>
            <!--Custom Columns-->
            <template v-slot:body-cell-tasks="props">
              <q-td :props="props">
                <q-btn unelevated class="btn-small" v-if="$auth.hasAccess('iprojects.tasks.create')"
                       @click="$refs.crudTasks.create({projectid : props.row.id})"
                       :label="$tr('ui.label.add')" color="cyan"/>
                <div class="q-my-xs"></div>
                <q-btn unelevated class="btn-small" v-if="props.row.lastTask"
                       :to="{name : 'qproject.admin.tasks', query : {projectId : props.row.id}}"
                       :label="$tr('ui.label.all')" color="teal"/>
              </q-td>
            </template>
            <template v-slot:body-cell-title="props">
              <q-td :props="props" style="max-width: 180px" class="ellipsis">
                <!--title-->
                <a class="text-primary" target="_blank"
                   :href="`https://clientes.imaginacolombia.com/imadmin/addonmodules.php?module=project_management&m=view&projectid=${props.row.id}`">
                  <q-icon name="fas fa-link"/>
                  {{props.value}}
                </a>
                <!--Last task-->
                <div class="text-caption">
                  {{props.row.lastTask}}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <!--Status invoice-->
                <div v-if="!props.row.invoice" class="text-negative q-mb-xs">
                  <q-icon name="fas fa-exclamation-triangle"/>
                  {{$tr('qproject.layout.message.notInvoice')}}
                </div>
                <q-chip dense :color="colorStatus[props.value]" text-color="white">{{props.value}}</q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-dueDate="props">
              <q-td :props="props">
                <div>{{$trd(props.value)}}</div>
                <!--Status date-->
                <q-chip dense :color="statusProject(props.value).color"
                        v-if="props.row.status != 'Completado'"
                        :text-color="statusProject(props.value).textColor"
                        :icon="statusProject(props.value).icon">
                  {{statusProject(props.value).label}}
                </q-chip>
              </q-td>
            </template>
          </q-table>
          <!--== Not results ==-->
          <not-result class="text-center q-pt-xl" v-else/>
        </q-scroll-area>
      </div>

      <!--CRUD Task-->
      <crud :crud-data="import('@imagina/qproject/_crud/tasks')"
            type="hide" ref="crudTasks" @created="getProjects(true)"/>

      <!--Inner loading-->
      <inner-loading :visible="loading"/>
    </div>
  </div>
</template>
<script>
  //Components
  import filterComponent from '@imagina/qproject/_components/filter'
  import tabProject from '@imagina/qproject/_components/tabProject'

  export default {
    props: {},
    components: {filterComponent, tabProject},
    mounted() {
      this.$nextTick(function () {
        this.init()
      })
    },
    data() {
      return {
        loading: false,
        projects: [],
        filter: {},
        pagination: {
          page: 1,
          rowsPerPage: 15,
        },
      }
    },
    computed: {
      columns() {
        return [
          {
            name: 'tasks', align: 'left',
            label: this.$trp('qproject.layout.label.task'),
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
            field: 'admin', format: val => val || '-'
          },
          {
            name: 'dueDate', align: 'center',
            label: this.$tr('ui.form.dueDate'),
            field: 'dueDate'
          },
          {
            name: 'createdAt', align: 'right',
            label: this.$tr('ui.form.createdAt'),
            format: val => val ? this.$trd(val) : '-',
            field: 'createdAt'
          },
          {
            name: 'updatedAt', align: 'right',
            label: this.$tr('ui.form.updatedAt'),
            format: val => val ? this.$trd(val) : '-',
            field: 'updatedAt'
          },
        ]
      },
      colorStatus() {
        return {
          'Completado': 'teal',
          'En progreso': 'cyan',
          'En espera de Cliente': 'deep-orange-4',
          'Pendiente': 'warning',
          'Abandonado': 'blue-grey',
        }
      },
      dashBoard() {
        let projects = this.$clone(this.projects)
        let response = {}

        //Get status
        Object.keys(this.colorStatus).forEach(statusName => {
          response[statusName] = {
            label: statusName,
            quantity: projects.filter(project => project.status == statusName).length,
            color: this.colorStatus[statusName]
          }
        })

        //Get expired projects
        response[this.$tr('ui.label.expired')] = {
          label: this.$tr('ui.label.expired'),
          color: 'negative',
          quantity: projects.filter(project => {
            let daysLeft = this.$date.getDiff(new Date(), project.dueDate).days
            return ((project.status == 'Completado') || daysLeft) ? false : true
          }).length,
        }

        //Get projects without invoice
        response[this.$tr('qproject.layout.message.notInvoice')] = {
          label: this.$tr('qproject.layout.message.notInvoice'),
          color: 'negative',
          quantity: projects.filter(project => !project.invoice).length,
        }

        return response
      }
    },
    methods: {
      init() {
        this.getProjects()
      },
      //Get projects
      getProjects(refresh = false) {
        return new Promise((resolve, reject) => {
          this.loading = true
          let requestParams = {
            refresh: refresh,
            params: {
              filter: this.filter,
              include: 'tasks'
            },
          }

          //Request
          this.$crud.index('apiRoutes.qproject.projects', requestParams).then(response => {
            this.projects = response.data
            this.loading = false
          }).catch(error => this.loading = false)
        })
      },
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
