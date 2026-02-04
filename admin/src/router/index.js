import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '数据概览' }
        },
        {
          path: 'survey',
          name: 'survey',
          component: () => import('@/views/survey/List.vue'),
          meta: { title: '问卷管理' }
        },
        {
          path: 'question',
          name: 'question',
          component: () => import('@/views/question/List.vue'),
          meta: { title: '题目管理' }
        },
        {
          path: 'result',
          name: 'result',
          component: () => import('@/views/result/List.vue'),
          meta: { title: '结果模板' }
        },
        {
          path: 'password',
          name: 'password',
          component: () => import('@/views/password/List.vue'),
          meta: { title: '密码管理' }
        },
        {
          path: 'answer',
          name: 'answer',
          component: () => import('@/views/answer/List.vue'),
          meta: { title: '答题记录' }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + ' - 小红书问卷管理系统'
  }

  // 简单的登录验证（生产环境需要完善）
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
