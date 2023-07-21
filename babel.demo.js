// 使用 @babel/plugin-transform-runtime 需同时安装 @babel/runtime
// 如果 tranform-runtime 的corejs指定为 2或 3，则安装的是 @babel/runtime-corejs3（2 或 3）；默认为false，则需安装@babel/runtime


// 方式一：库开发，可避免polyfill全局污染、避免helper函数重复引入的问题、按需引入 polyfill、同时保证 syntax、api等被转换
module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                // 使用 defaults 关键字可以获取 browserlist 的标准配置
                // 想测试兼容性可以改这里的目标环境，例如 ie9 等
                "targets": ["defaults", "not ie 11"], 
            },
        ]
    ],
    "plugins": [
       [
            "@babel/plugin-transform-runtime",
            {
                "helpers": true, // 默认为 true
                "regenerator": true, // 默认为 true
                "corejs": "3" // 默认为 false
            }
       ],
    ]
}

// 方式二：项目开发，确保 node_module 中的js在执行过程中未被目标环境支持，同时避免helper函数重复引入的问题，此时 polyfill 是不会被优化引入的
// 必要：入口文件引入 import 'core-js/stable', 不需要再 import 'regenerator-runtime/runtime', 使用 preset-env 会自动引入（无需额外配置）
module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": ["defaults", "not ie 11"],
                "useBuiltIns": 'entry',
                "corejs": "3"
            },
        ]
    ],
    "plugins": [
       [
            "@babel/plugin-transform-runtime",
            {
                "helpers": true,
            }
       ],
    ]
}

// 方式三：项目开发，不care node_modules 中的内容，按需引入、避免helper函数重复引入的问题、此时 polyfill 是不会被优化引入的
module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": ["defaults", "not ie 11"],
                "useBuiltIns": 'usage',
                "corejs": "3"
            },
        ]
    ],
    "plugins": [
       [
            "@babel/plugin-transform-runtime",
            {
                "helpers": true,
            }
       ],
    ]
}