import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    username: localStorage.getItem('admin_username') || '',
    nickname: localStorage.getItem('admin_nickname') || ''
  }),

  actions: {
    setUser(data) {
      this.token = data.token || ''
      this.username = data.username || ''
      this.nickname = data.nickname || ''

      localStorage.setItem('admin_token', this.token)
      localStorage.setItem('admin_username', this.username)
      localStorage.setItem('admin_nickname', this.nickname)
    },

    logout() {
      this.token = ''
      this.username = ''
      this.nickname = ''

      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_username')
      localStorage.removeItem('admin_nickname')
    }
  }
})
