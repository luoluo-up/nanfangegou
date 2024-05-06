/**
 * 添加拦截器:
 *   拦截 request 请求
 *   拦截 uploadFile 文件上传
 *
 * TODO:
 *   1. 非 http 开头需拼接地址
 *   2. 请求超时
 *   3. 添加小程序端请求头标识
 *   4. 添加 token 请求头标识
 */
import { useMemberStore } from "@/stores"
const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'

// 添加拦截器
const httpInterceptor = {
    invoke(options: Uni.RequestOption) {
        // 1.非http开头需拼接地址
        if (!options.url.startsWith('http')) {
            options.url = baseURL + options.url
        }
        // 2.请求超时
        options.timeout = 10000
        // 3.添加小程序端请求头标识
        options.header = {
            ...options.header,
            'source-client': 'miniapp'
        }
        // 4.添加 token 请求头标识
        const memberStore = useMemberStore()
        if (memberStore.profile?.token) {
            options.header!.Authorization = memberStore.profile.token
        }
    }
}

uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

/**
 * 请求函数
 * @param  UniApp.RequestOptions
 * @returns Promise
 *  1. 返回 Promise 对象
 *  2. 获取数据成功
 *    2.1 提取核心数据 res.data
 *    2.2 添加类型，支持泛型
 *  3. 获取数据失败
 *    3.1 401错误  -> 清理用户信息，跳转到登录页
 *    3.2 其他错误 -> 根据后端错误信息轻提示
 *    3.3 网络错误 -> 提示用户换网络
 */

interface Data<T> {
    code: string,
    msg: string,
    result: T
}

// 2.2添加类型 支持泛型
export const http = <T>(options: UniApp.RequestOptions) => {
    // 返回promise对象
    return new Promise<Data<T>>((resolve, reject) => {
        uni.request({
            ...options,
            // 请求成功
            success(res){
                // 状态码 2xx， axios 就是这样设计的
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // 2.1 提取核心数据
                    resolve(res.data as Data<T>)
                }else if(res.statusCode === 401){
                    // 401 跳转到登录页 清理用户信息
                    const memberStore = useMemberStore()
                    memberStore.clearProfile()
                    uni.navigateTo({
                        url: '/pages/login/login'
                    })
                    reject(res)
                } else {
                    // 其他错误 根据后端信息轻提示
                    uni.showToast({
                        title: (res.data as Data<T>).msg || '请求错误',
                        icon: 'none'
                    })
                    reject(res)
                }
            }
            // 请求失败
            ,fail(err){
                uni.showToast({
                    title: '网络错误,请求失败',
                    icon: 'none'
                })
                reject(err)
            }
        })
    })
}