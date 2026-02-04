import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'password-verify',
      component: () => import('@/views/PasswordVerify.vue'),
      meta: { title: '密码验证' }
    },
    {
      path: '/intro',
      name: 'survey-intro',
      component: () => import('@/views/SurveyIntro.vue'),
      meta: { title: '测试介绍' }
    },
    {
      path: '/question',
      name: 'question',
      component: () => import('@/views/Question.vue'),
      meta: { title: '答题' }
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('@/views/Result.vue'),
      meta: { title: '测试结果' }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
