<template>
  <div id="app">
    <a-alert @close="onAlertClose" v-if="globalAlert.visible" style="z-index: 1201;position:fixed;width:100%;" type="error" banner closable>
      <template v-slot:message>
        <ul style="padding: 0; margin:0;">
          <li v-html="globalAlert.msg"></li>
          <li v-for="msg in globalAlert.msgList">{{ `${ msg.key }: ${msg.value}` }}</li>
        </ul>
      </template>
    </a-alert>
    <router-view/>
  </div>
</template>

<script>

// import 'ant-design-vue/dist/antd.css'; // or 'ant-design-vue/dist/antd.less'
import {mapMutations, mapState} from 'vuex'

export default {
  computed: {
    ...mapState('common', [
      'globalAlert',
    ]),
  },
  mounted() {
    window.vm.updateCommonState = this.updateCommonState;
  },
  methods: {
    ...mapMutations('common', [
      'updateCommonState',
    ]),
    onAlertClose() {
      this.updateCommonState([{
        key: 'globalAlert.visible',
        value: false
      }]);
    },
  }
}
</script>

