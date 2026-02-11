import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Vant UI
import 'vant/lib/index.css'
import vant from 'vant'
import { Lazyload } from 'vant'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vant)
app.use(Lazyload)
app.mount('#app')
