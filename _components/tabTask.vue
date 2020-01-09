<template>
  <div id="tabTaskComponent" v-if="task">
    <!--== Content ==-->
    <q-card class="shadow-1">
      <!--Content-->
      <q-card-section class="q-pa-none">
        <q-list class="q-pa-sm" separator>
          <!--Title-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>
                <q-icon name="fas fa-sticky-note" />
                {{$tr('qproject.layout.label.task')}}
              </q-item-label>
              <q-item-label class="ellipsis" :title="task.title">
                {{task.title}}
              </q-item-label>
            </q-item-section>
          </q-item>
          <!--Status-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.status')}}</q-item-label>
              <q-item-label class="text-center row items-center" style="min-height: 52px">
                <div class="col-12">
                  <!--Status name-->
                  <q-chip dense text-color="white" :color="task.status ? 'teal' : 'warning'">
                    {{ task.status ? $tr('ui.label.completed') : $tr('ui.label.pending') }}
                  </q-chip>
                  <!--Status date-->
                  <q-chip dense :color="statusTask(task.dueDate).color" v-if="!task.status"
                          :text-color="statusTask(task.dueDate).textColor"
                          :icon="statusTask(task.dueDate).icon">
                    {{statusTask(task.dueDate).label}}
                  </q-chip>
                </div>
              </q-item-label>
            </q-item-section>
          </q-item>
          <!--Assigned to-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.assignedTo')}}</q-item-label>
              <q-item-label>{{task.admin || '-'}}</q-item-label>
            </q-item-section>
          </q-item>
          <!--Project-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>
                <q-icon name="fas fa-laptop-code" class="q-mr-xs"/>
                <label>{{$tr('qproject.layout.label.project')}}</label>
              </q-item-label>
              <q-item-label class="ellipsis" :title="task.project">
                <a class="text-primary" target="_blank"
                   :href="`https://clientes.imaginacolombia.com/imadmin/addonmodules.php?module=project_management&m=view&projectid=${task.projectId}`">
                  <q-icon name="fas fa-link"/>
                  {{task.project}}
                </a>
              </q-item-label>
            </q-item-section>
          </q-item>
          <!--Parent id-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.parent')}}</q-item-label>
              <q-item-label>{{task.parent ? task.parent.title : '-'}}</q-item-label>
            </q-item-section>
          </q-item>
          <!--Created AT-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.createdAt')}}</q-item-label>
              <q-item-label>{{task.createdAt ? $trd(task.createdAt) : '-'}}</q-item-label>
            </q-item-section>
          </q-item>
          <!--Due date-->
          <q-item>
            <q-item-section class="q-py-sm">
              <q-item-label caption>{{$tr('ui.form.dueDate')}}</q-item-label>
              <q-item-label>{{task.dueDate ? $trd(task.dueDate) : '-'}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator/>
      <!--Actions-->
      <q-btn-group spread>
        <!--Button to list tasks-->
        <q-btn unelevated class="text-weight-bold q-py-sm" :label="$tr('qproject.layout.message.listTracking')"
               @click="$refs.modalTracking.open(task)"/>
        <!--Button create tasks-->
        <q-btn unelevated class="text-weight-bold q-py-sm" :label="$tr('qproject.layout.newTracking')"
               @click="$refs.crudTracking.create({projectid : task.projectId, taskid: task.id})"/>
      </q-btn-group>
      <q-separator/>
    </q-card>

    <!--== Modal Tracking ==-->
    <modal-tracking ref="modalTracking" />

    <!--== Crud tracking ==-->
    <crud :crud-data="import('@imagina/qproject/_crud/tracking')" type="hide" ref="crudTracking"/>
  </div>
</template>
<script>
  //Components
  import modalTracking from '@imagina/qproject/_components/modalTracking'

  export default {
    props: {
      taskData: false
    },
    components: {modalTracking},
    watch: {
      taskData(newValue) {
        this.task = this.$clone(newValue)
      }
    },
    mounted() {
      this.$nextTick(function () {
        this.task = this.$clone(this.taskData)
      })
    },
    data() {
      return {
        task: false,
      }
    },
    computed: {},
    methods: {
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
  #tabTaskComponent
    .q-card
      .q-item
        padding 5px

        .q-item__section
          padding 0
</style>
