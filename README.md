[TOC]



### Babel7

​		Babel 处理代码过程分为 `parse(@babel/parser)` 生成 `ast`、 `tranform(@babel/traverse)` 遍历源码生成的 `ast` 调用处理代码的插件 `plugin` 、 `generate(@babel/generator)`  将处理后的 `ast` 生成目标代码。

​		在 `transform` 阶段，我们可以使用 `plugin` 去帮我们对代码做一些细粒度的处理，例如将箭头函数转换为普通函数，不同的功能处理被细分为不同的 `plugin`。

​		当我们在开发时，往往无法清晰的知晓哪些代码需要做处理才能在目标环境正常运行，也很难理清到底需要添加哪些 `plugin`，于是 `Babel` 提供了一组  `plugin` 的集合组成的预设 `@babel/preset-*`，例如 `@babel/preset-typescript`，针对 `ts` 做处理；而针对 `js` 兼容性转换的预设为 `@babel/preset-env `，去帮助开发者将源代码处理为目标环境支持的代码 （`targets` 选项指定）。

​		 `@babel/preset-env ` 默认只转换新的 `syntax `，不处理新的特性，新的特性例如新增的数据结构（`Set`、`Map`）、全局对象上新增的方法（`Array.from`）等，新的特性一般都需要利用现有的基础语法去模拟实现（`polyfill` 填充）。 如果要转换特性，需要开启 `useBuiltIns` 和` corejs` 选项配置。

​	配置文件执行顺序：`presets` 从右到左执行，`plugins` 从左到右执行，` plugins` 在 `presets` 之前执行；

#### 1 常见问题

1. `@babel/core` 和 `core-js` 名称相似，分不清楚？

   `@babel/core` 是 ` Babel` 编译的核心，读取配置、调用其他工具对源代码解析处理等核心工作；而 `core-js` 是做 `polyfill` 用的，新的 `Babel` 版本已经弃用了 `@babel/polyfill` 改为使用 `core-js`， `core-js` 有 2、3 两个版本，目前 2 已经不推荐使用，3 是正在维护的版本。

2.  `@babe/plugin-transform-runtime` 是什么？

   它的作用主要有两个：

   - 避免  `polyfill` 的全局污染（使用` _interopRequireDefault` 包裹 `polyfill` ）
   - 避免 `helper` 函数在需要被转换的文件中多次重复引入，以减少代码体积（不在源码文件中多次注入函数，将重复的功能统一指向 `@babel/runtime` 中同一函数）

3. `@babel/runtime` 是什么？

   和 `@babe/plugin-transform-runtime` 搭配使用的，包含 `Babel` 的 `helper` 、`core-js`、`regenerator-runtime`（用来转换 `async` 、`generator`），当使用  `@babe/plugin-transform-runtime`  做引入优化时， `@babe/plugin-transform-runtime` 引用的就是 `@babel/runtime`  里的相关方法。

​		也可以见到这两个包，`@babel/runtime-corejs2` 、`@babel/runtime-corejs2`，当在 `@babe/plugin-transform-runtime` 中配置 `corejs` 选项不同（2，3，false），依赖的的 `@babel/runtime` 不同。

| `corejs` option | Install command                             |
| --------------- | ------------------------------------------- |
| `false`         | `npm install --save @babel/runtime`         |
| `2`             | `npm install --save @babel/runtime-corejs2` |
| `3`             | `npm install --save @babel/runtime-corejs3` |

4. 有了  `@babel/preset-env ` ，还需要  `@babe/plugin-transform-runtime`  吗？新的版本中，这两个包都支持配置 `corejs` 提供 `polyfill` 功能，有什么区别呢，当配置其中一个包时，可以抛弃另一个配置吗？

   ```js
   // ------------- 测试代码---------------
   // 测试 syntax
   const arr = [1,2,3]
   const func = () => {}
   
   // 测试 polyfill
   new Set()
   
   
   // 测试 regenerator-runtime
   async function asfunc () {}
   ```

   

   - 单独配置   `@babe/plugin-transform-runtime`  是没有任何作用的 ，即便配置了 `polyfill` 相关选项；

     ```js
     module.exports = {
         "plugins": [
            [
                 "@babel/plugin-transform-runtime",
                 {
                     "helpers": true,
                     "corejs": "3",
                     "regenerator": true
                 }
            ],
         ]
     }
     ```

     

   - 单独配置 `@babel/preset-env ` ，当未指定 `corejs`、`useBuildIns`（默认为 false） 时，只会转换基本的 `syntax`，包括用于处理 `async` 、`generator` 函数的 `regenerator-runtime`，但不包含任何 `polyfill`；

     ```js
     module.exports = {
         "presets": [
             [
                 "@babel/preset-env",
                 {
                     "targets": ["ie 11"],
                 },
             ]
         ],
     }
     ```

     

   -   `@babel/preset-env ` 也提供了`polyfill` 功能，配置  `corejs`、`useBuildIns` (不为 false) 选项后，可以确保源代码全部处理为目标环境可执行的代码，填充新特性的 `corejs` 以及基本语法的转换；

     ```
     module.exports = {
         "presets": [
             [
                 "@babel/preset-env",
                 {
                     "targets": ["ie 11"],
                     // or 'entery'，需要入口引入 import 'core-js/stable'
                     "useBuiltIns": 'usage', 
                     "corejs": "3"
                 },
             ]
         ],
     }
     ```

     

   - 当  `@babel/preset-env ` 的 `useBuildIns`  配置为 `usage` 时，会按需自动引入目标环境的 `polyfill` ；

     问题：helper 函数和 polyfill 在每个文件会重复注入。

   - 当  `@babel/preset-env ` 的 `useBuildIns`  配置为 `entry` 时，需要手动在入口文件引入 `polyfill` ：`import 'core-js/stable'`，此时会引入全部目标环境的 `polyfill`；

     问题：helper 函数会在每个文件重复注入。

   - **为了解决 helper 函数重复引入，导致编译出来的文件体积过大的问题**，需要引入  `@babe/plugin-transform-runtime` 。注意使用 `@babe/plugin-transform-runtime`  需要同时安装 `@babel/runtime`, 此时无需区分  `@babel/runtime` 版本。此时重复的 helper 函数不再重复注入，而是在页面中通过引用被链接到同一个目标文件；

     ```
     module.exports = {
         "presets": [
             [
                 "@babel/preset-env",
                 {
                     "targets": ["ie 11"],
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
     ```

   - 同时使用  `@babel/preset-env `  引入 `polyfill` 会存在**全局环境污染**的问题，此时填充的方法会被直接`require` 到源代码中执行，会直接当前环境的在全局对象上添加方法等，如果源码处理不当，可能会将某些 ` polyfill` 覆盖掉，此时使用 `@babe/plugin-transform-runtime`  也可以解决这个问题，使用方式如下：

     ```
     module.exports = {
         "presets": [
             [
                 "@babel/preset-env",
                 {
                     "targets": ["ie 11"], 
                     // 此时不要在 env 中配置 polyfill 功能
                 },
             ]
         ],
         "plugins": [
            [
                 "@babel/plugin-transform-runtime",
                 {
                     "helpers": true, // 默认为 true，同时优化了 helper 函数
                     "regenerator": true, // 默认为 true
                     "corejs": "3" // 默认为 false
                 }
            ],
         ]
     }
     ```



#### 2 推荐配置

1. **方式一**：库开发，避免helper函数重复引入的问题、按需引入 polyfill、可避免polyfill全局污染;

   ```js
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
   ```

2. **方式二**：项目开发，确保 node_module 中的js在执行过程中未被目标环境支持，同时避免helper函数重复引入的问题，不可避免polyfill全局污染。

   ```js
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
   
   // 必要：入口文件引入 import 'core-js/stable'
   ```

3. **方式三**：项目开发，不care node_modules 中的内容，按需引入、避免helper函数重复引入的问题，不可避免polyfill全局污染。

   ```js
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
   ```

   

