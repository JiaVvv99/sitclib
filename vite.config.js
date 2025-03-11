import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  // 配置根目录
  root: __dirname,

  // 开发服务器配置（可选）
  server: {
    // open: "/test/es.html", // sitclib.es.js
    open: "/test/umd.html", // sitclib.umd.js
  },

  // 构建配置
  build: {
    lib: {
      entry: path.resolve(__dirname, "sitc_algorithm/index.js"), // 入口文件
      name: "Sitc", // 全局变量名称
      fileName: (format) => `sitclib.${format}.js`, // 输出文件名
    },
    minify: "terser",
    terserOptions: {
      mangle: {
        keep_classnames: true, // 保留所有类名
        keep_fnames: true, // 保留所有函数名
      },
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖（如 d3 需要用户自己通过 CDN 引入）
      external: ["d3"],
      output: {
        globals: {
          d3: "d3", // 告诉 Rollup d3 的全局变量名是 'd3'
        },
      },
    },
  },
});
