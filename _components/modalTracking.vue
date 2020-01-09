<template>
  <!--== Dialog Traking ==-->
  <q-dialog v-model="modal.show">
    <q-card class="bg-white" style="max-width: 600px">
      <!--title-->
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title class="ellipsis">
          {{task.title}}
        </q-toolbar-title>
        <q-btn icon="fas fa-times" v-close-popup flat/>
      </q-toolbar>
      <!--content-->
      <q-card-section class="relative-position q-px-sm" style="max-height: 442px; overflow-y: scroll">
        <!--Not result-->
        <not-result v-if="!tracking.length"/>
        <!--List tracking-->
        <q-list separator>
          <q-item v-for="(track, key) in tracking" :key="key" class="q-px-none">
            <q-item-section avatar class="q-pa-none text-center" style="min-width: max-content"
                            v-if="canDeleteTracking(track)">
              <q-btn icon="fas fa-trash-alt" flat color="negative" size="xs" outlined unelevated
                     class="q-my-xs q-mr-sm" @click="deleteTracking(track.id)">
                <q-tooltip>{{$tr('ui.label.delete')}}</q-tooltip>
              </q-btn>
            </q-item-section>
            <!--admin and commet-->
            <q-item-section>
              <q-item-label>{{track.id}} - {{track.admin}}</q-item-label>
              <q-item-label caption>{{track.comment}}</q-item-label>
            </q-item-section>
            <!--Data and action-->
            <q-item-section side top>
              <q-item-label caption class="q-mb-xs">{{$trd(track.createdAt)}}</q-item-label>
              <q-item-label caption>{{getDiffHours(track.createdAt, track.endAt)}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <!--inner loading-->
        <inner-loading :visible="modal.loading"/>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script>
  export default {
    props: {},
    components: {},
    watch: {},
    mounted() {
      this.$nextTick(function () {
      })
    },
    data() {
      return {
        task: false,
        tracking: [],
        modal: {
          loading: true,
          show: false
        }
      }
    },
    computed: {},
    methods: {
      //open tracking
      open(task = false) {
        return new Promise((resolve, reject) => {
          if (task) this.task = task
          this.modal.loading = true
          this.modal.show = true
          //request params
          let requestParams = {refresh: true, params: {filter: {taskId: this.task.id}}}

          //Request
          this.$crud.index('apiRoutes.qproject.tracking', requestParams).then(response => {
            this.tracking = response.data
            this.modal.loading = false
          }).catch(error => this.modal.loading = false)
        })
      },
      //Get difference bettewn to dates
      getDiffHours(startDate, endDate) {
        var duration = this.$moment.duration(this.$moment(endDate).diff(this.$moment(startDate)));
        return duration.humanize();
      },
      //Delete tracking
      deleteTracking(idTracking) {
        this.modal.loading = true
        //Request
        this.$crud.delete('apiRoutes.qproject.tracking', idTracking).then(response => {
          this.open()
        }).catch(error => this.modal.loading = false)
      },
      //Validate if can delete tracking
      canDeleteTracking(tracking){
        let response = true
        if(tracking.adminId != this.$store.state.quserAuth.userData.idOld) response = false
        return response
      }
    }
  }
</script>
<style lang="stylus">
</style>
