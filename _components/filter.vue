<template>
  <div id="filterComponentProjects">
    <div class="shadow-1 bg-white q-pa-md">
      <div class="text-h5 text-primary">
        <q-icon name="fas fa-filter"/>
        {{$trp('ui.label.filter')}}
      </div>
      <!--Search-->
      <q-input clearable v-model="filter.search" dense outlined debounce="800"
               :placeholder="`${$tr('ui.label.search',{capitalize : true})}...`"
               @input="emit.filter()" class="q-mt-md">
        <template v-slot:append>
          <q-icon name="search"/>
        </template>
      </q-input>
      <!--filter by user-->
      <q-select v-model="filter.adminId" :options="users.options" dense outlined emit-value use-input map-options
                @filter="(val, update)=>update(()=>{users.options = $helper.filterOptions(val,users.rootOptions,filter.adminId)})"
                :loading="users.loading" :label="$tr('ui.label.user')" @input="emit.filter()"
                class="q-mt-md" clearable behavior="menu" v-if="users.rootOptions.length >= 2"/>
      <!--filter by Project-->
      <q-select v-model="filter.projectId" v-if="filterTasks && projects.rootOptions.length >= 2" behavior="menu"
                :options="projects.options" dense outlined emit-value map-options class="q-mt-md" clearable
                use-input :loading="projects.loading" :label="$tr('qproject.layout.label.project')"
                @input="emit.filter()"
                @filter="(val, update)=>update(()=>{projects.options = $helper.filterOptions(val,projects.rootOptions,filter.adminId)})"/>
      <!--Change View-->
      <q-select v-model="filter.grid" :options="options.view" map-options emit-value outlined dense
                :label="$tr('ui.label.view')" class="q-mt-md" behavior="menu"/>
      <q-separator class="q-my-md"/>
      <!--filter by status-->
      <q-select v-model="filter.status" :options="filterTasks ? options.status : status.options" multiple use-chips
                dense outlined emit-value :loading="status.loading" map-options behavior="menu"
                :label="$tr('ui.form.status')"/>
      <!--Order by-->
      <q-select v-model="filter.order.field" :options="options.orderFields" dense outlined
                emit-value behavior="menu" :label="$tr('ui.form.orderBy')" class="q-mt-md" map-options/>
      <!--Order way-->
      <q-select v-model="filter.order.way" :options="options.orderWay" dense outlined emit-value
                :label="$tr('ui.form.orderWay')" class="q-mt-md" map-options behavior="menu"/>
      <!--Buttons-->
      <div class="text-right q-mt-md q-gutter-x-sm">
        <q-btn icon="fas fa-sync" size="12px" :label="$tr('ui.label.refresh')"
               color="primary" @click="emit.refresh()"/>
        <q-btn icon="fas fa-search" size="12px" :label="$tr('ui.label.search')"
               color="primary" @click="emit.filter()"/>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      filterTasks: {type: Boolean, default: false}
    },
    components: {},
    watch: {
      filter: {
        handler() {
          this.emit.input()
        },
        deep: true
      }
    },
    mounted() {
      this.$nextTick(function () {
        this.init()
      })
    },
    data() {
      return {
        users: {
          loading: false,
          rootOptions: [],
          options: []
        },
        projects: {
          loading: false,
          rootOptions: [],
          options: []
        },
        status: {
          loading: false,
          options: []
        },
        filter: {
          search: '',
          status: this.filterTasks ? [0] : ['En espera de Cliente', 'En progreso', 'Pendiente'],
          adminId: this.$store.state.quserAuth.userData.idOld,
          projectId: this.filterTasks ? (parseInt(this.$route.query.projectId) || null) : null,
          grid: false,
          order: {
            field: 'duedate',
            way: 'asc'
          },
        }
      }
    },
    computed: {
      options() {
        let response = {
          view: [
            {label: this.$tr('ui.label.grid'), value: true},
            {label: this.$tr('ui.label.table'), value: false},
          ],
          orderFields: [
            {label: this.$tr('ui.form.createdAt'), value: 'created'},
            {label: this.$tr('ui.form.dueDate'), value: 'duedate'},
          ],
          orderWay: [
            {label: 'Desc', value: 'desc'},
            {label: 'Asc', value: 'asc'},
          ],
          status: [
            {label: this.$tr('ui.label.completed'), value: 1},
            {label: this.$tr('ui.label.pending'), value: 0},
          ]
        }

        //Validate type filter
        if (!this.filterTasks) response.orderFields.push({label: this.$tr('ui.form.updatedAt'), value: 'lastmodified'},)

        return response
      },
      emit() {
        return {
          input: () => this.$emit('input', this.filter),
          filter: () => this.$emit('filter', this.filter),
          refresh: () => this.$emit('refresh', this.filter),
        }
      }
    },
    methods: {
      init() {
        this.getUsers()
        if (this.filterTasks) this.getProjects()
        this.getProjectStatus()
        this.emit.input()
      },
      //get Users
      getUsers() {
        return new Promise((resolve, reject) => {
          this.users.loading = true
          let requestParams = {params: {filter: {}}}
          let selectedRole = parseInt(this.$store.state.quserAuth.selectedRoleId)
          //Remove filter if is admin
          if ((selectedRole == 15) || (selectedRole == 16))
            requestParams.params.filter.getUsersByDepartment = true

          //Request
          this.$crud.index('apiRoutes.quser.users', requestParams).then(response => {
            let options = this.$array.select(response.data, {label: 'fullName', id: 'idOld'})
            this.users.rootOptions = options
            this.users.options = options
            this.users.loading = false
          }).catch(error => this.users.loading = false)
        })
      },
      //get Projects
      getProjects() {
        return new Promise((resolve, reject) => {
          this.projects.loading = true
          //Request
          this.$crud.index('apiRoutes.qproject.projects').then(response => {
            let options = this.$array.select(response.data)
            this.projects.rootOptions = options
            this.projects.options = options
            this.projects.loading = false
          }).catch(error => this.projects.loading = false)
        })
      },
      //get projects status
      getProjectStatus() {
        return new Promise((resolve, reject) => {
          this.status.loading = true
          //Request
          this.$crud.index('apiRoutes.qproject.projectStatus').then(response => {
            this.status.options = response.data
            this.status.loading = false
          }).catch(error => this.status.loading = false)
        })
      },
    }
  }
</script>
<style lang="stylus">
</style>
