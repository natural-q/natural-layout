// 处理路径
const  path = require('path')
function resolve(dir) {
    return path.join(__dirname, '../../../' + dir)
}

module.exports = {
    PORT: 9528,
    IE8: true,
    PAGES: "_pages",
    CDN: "/",
    MODULES: "*",
    COPYDIR_IGNORE: "**",
    RESOLVE_ALIAS: {},
    EXTERNALS: {
        jquery: 'window.$',
        $: 'window.$',
        seajs: 'window.seajs',
    }
};