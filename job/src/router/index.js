import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '@/views/Login'
import Home from '@/views/Home'
import User from '@/views/User'
import CreatePage from '@/views/CreatePage'
import Test from '@/views/Test'

const routes = [
  {
    path: '/',
    name: 'Login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: import('@/views/Login.vue')
    component: Login
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: 'user',
        component: User
      },
      {
        path: 'create-page',
        component: CreatePage
      },
    ]
  },
  {
    path: '/test',
    component: Test
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
