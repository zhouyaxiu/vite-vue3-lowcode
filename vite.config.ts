import { ConfigEnv, loadEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'
import ViteComponents, { ElementPlusResolver, VantResolver } from 'vite-plugin-components'
import WindiCSS from 'vite-plugin-windicss'
import VitePluginElementPlus from 'vite-plugin-element-plus'

const CWD = process.cwd()

const prefix = `monaco-editor/esm/vs`

// https://cn.vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  // 环境变量
  const { VITE_BASE_URL } = loadEnv(mode, CWD)
  return {
    base: VITE_BASE_URL, // 设置打包路径
    css: {
      modules: {
        localsConvention: 'camelCase' // 默认只支持驼峰，修改为同时支持横线和驼峰
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      WindiCSS(),
      legacy({
        targets: ['defaults', 'not IE 11']
      }),
      ViteComponents({
        globalComponentsDeclaration: true,
        // 自动导入组件（还不够完善，可能会有样式丢失）
        // valid file extensions for components.
        extensions: ['vue', 'tsx', 'js'],
        customComponentResolvers: [ElementPlusResolver(), VantResolver()]
      }),
      VitePluginElementPlus({
        // 如果你需要使用 [component name].scss 源文件，你需要把下面的注释取消掉。
        // 对于所有的 API 你可以参考 https://github.com/element-plus/vite-plugin-element-plus
        // 的文档注释
        // useSource: true
        format: mode === 'development' ? 'esm' : 'cjs'
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src') // 设置 `@` 指向 `src` 目录
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          preview: resolve(__dirname, 'preview/index.html')
        },
        output: {
          manualChunks: {
            jsonWorker: [`${prefix}/language/json/json.worker`],
            cssWorker: [`${prefix}/language/css/css.worker`],
            htmlWorker: [`${prefix}/language/html/html.worker`],
            tsWorker: [`${prefix}/language/typescript/ts.worker`],
            editorWorker: [`${prefix}/editor/editor.worker`]
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'element-plus',
        'vant',
        'lodash',
        'vuedraggable'
      ],
      exclude: ['vue-demi']
    },
    server: {
      host: '0.0.0.0',
      port: 10086, // 设置服务启动端口号
      open: false, // 设置服务启动时是否自动打开浏览器
      cors: true, // 允许跨域

      // 设置代理，根据项目实际情况配置
      proxy: {
        '/api': {
          target: 'http://29135jo738.zicp.vip/api/v1',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/', '/')
        }
      }
    }
  }
}
