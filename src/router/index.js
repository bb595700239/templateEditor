import Vue from 'vue'
import Router from 'vue-router'

import index from '@/view/index'


Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '',
      redirect: '/index',
      hidden: true
    },
    {
      path: '/index',
      component: index,
      name: '文件模版编辑器',

    }
  ]
})
