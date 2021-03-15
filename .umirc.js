const path = require('path');
// ref: https://umijs.org/config/

const { REACT_ENV } = process.env;

export default {
  treeShaking: true,
  define: {
    "process.env.REACT_ENV": REACT_ENV,
  },
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: false,
      dynamicImport: {
        webpackChunkName: true,
        level: 1
      },
      title: 'extensions',
      dll: false,

      routes: {
        exclude: [
          /components\//,
        ],
      },
      // chunks: ['vendors', 'umi']
    }],
  ],
  // externals: {
  //   'react': 'window.React',
  //   'react-dom': 'window.ReactDOM',
  // },
  outputPath: 'app',
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
