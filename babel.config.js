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