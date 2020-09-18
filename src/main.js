import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import i18n from './lang' // internationalization
import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

// markdown 相关配置
import VueMarkdownEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
// vuepress 主题
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
VueMarkdownEditor.use(vuepressTheme)

// 直接按需引入 prism 的语言包即可，此处以 json 为例
import 'prismjs/components/prism-json'

// import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
// VueMarkdownEditor.use(githubTheme, {
//   extend(md, hljs) {
//     // md为 markdown-it 实例，可以在此处进行修改配置,并使用 plugin 进行语法扩展
//     // md.set(option).use(plugin);
//     // 注册语言包
//     hljs.registerLanguage('json', json);
//   },
// });
// 快速辅助代码
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index'
VueMarkdownEditor.use(createCopyCodePlugin())
// 代码行号
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index'
VueMarkdownEditor.use(createLineNumbertPlugin())

Vue.use(VueMarkdownEditor)

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
