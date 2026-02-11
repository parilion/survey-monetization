module.exports = {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      viewportWidth: 375,        // 设计稿宽度（当前页面基于 375px 设计）
      unitPrecision: 5,          // 转换精度，保留5位小数
      viewportUnit: 'vw',        // 转换目标单位
      selectorBlackList: [],     // 不转换的选择器
      minPixelValue: 1,          // 最小转换值，1px 及以上都转换
      mediaQuery: false,         // 不转换媒体查询中的 px
      exclude: [/node_modules\/(?!vant)/],  // 排除第三方库(Vant除外)
    },
  },
}
