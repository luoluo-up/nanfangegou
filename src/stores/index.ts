import { createPinia } from 'pinia'
// 导入持久化插件
import persist from 'pinia-plugin-persistedstate'
// 创建pinia实例
const pinia = createPinia()
// 使用持久化插件
pinia.use(persist)

//默认导出 给main.ts使用
export default pinia

// 模块统一导出
export *  from './modules/member'
