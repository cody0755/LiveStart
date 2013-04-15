## `liveStart` 是什么

`liveStart`是一套基于 [Node.js](http://www.nodejs.org) 的前端工程项目开发环境。

目前是0.0.2版，实现了基本的模块化开发功能，之后将继续增加更多的功能与完善用户体验，作为一个node.js的初学者，欢迎各位多多提意见。

## `liveStart` 的安装与升级

安装`liveStart`最简单的方式是通过 [Node.js](http://www.nodejs.org) 提供的包管理工具`npm`来安装：

    npm -g install livestart
    
    # Mac 和 Linux 环境下可能需要 sudo 权限
    # 注意：Windows 平台下请使用原生命令行环境，不要在 Cygwin 下安装。

    npm -g update livestart
    
    # 升级livestart到最新版
    
	
## `liveStart` 的使用

初始化项目目录：

    livestart init

生成前端项目目录：

    liveStart项目
        - build
			- DEMO-20130407
        - src
            - pages
            - mods
            - widgets
        - tests
		- docs
		- tools
        - .livestart
            - project.json
			- json

    # src:      项目源文件，包含html、模板、样式、脚本、图片、swf等;
    # tests:    项目测试脚本;
    # build:    项目编译打包目录;
    # docs:     项目文档存放目录；
    # tools:    项目工具目录
    # .livestart:    项目元信息，project.json 为项目配置文件。
    
    # .livestart为项目元信息目录
    # 我们主要工作目录位于src，其中src又细分为pages、mods、widgets，其中pages存放静态页面资源、mods存放页面模块、widgets存放组件
	

调试模式：

    livestart debug
    
    # http://127.0.0.1:8000 作为项目调试地址，调试过程中显示效果与输出效果基本保持一致
    # http://127.0.0.1:8001 作为项目可视化配置后台，可以根据项目需要进行配置、调试、打包


调试模式：

    livestart build
    
    # 最终页面打包，文件输出在build目录里


## 模块化开发规则

### HTML部分模块化

我们开发时的页面放于 `pages` 目录，css、images这些静态资源放置于 `pages` 。 `pages` 目录也适合放layout框架页。

切页面时产生公共模块，使用频繁的模块，应该做成模块放置于 `mods` 目录，用以下方法在 `pages` 里页面引用模块，url为引用的相对路径（引用的模块也可以是在`pages` 里的页面，兼容原来系统的语法）：

    <!--#include "url"-->

    <!--#include file="url"-->

    <!--#include virtual="url"-->

参考：http://www.iamued.com/qianduan/1998.html

### CSS部分模块化

比如页面头部我们只引用那一个样式，style.css，但是文件内容改成下面的：


    /**
     * xxx页面入口样式文件style.css
     */

    @import './utils/base.css';

    /*页面基础框架（骨架）*/
    @import './mods/layout.css';

    @import './mods/header.css';
    @import './mods/nav.css';

    /*首页焦点图*/
    @import './mods/flash-pic.css';

    ………这里省略诸多模块………

    @import './mods/footer.css';


参考：https://github.com/daxingplay/css-combo

### JS部分模块化

目前是希望使用sea.js或者require.js实现

### 最终合并

最终build命令系统会把HTML、CSS、JS的模块进行合并输出到build目录，这个过程考虑加进一些其它的可选选项，比如CSS、JS压缩，注释文档输出等

	
## `liveStart` 更多方法

以下变量作为模板变量放于文档的合适地址：

    ${firebug-js}
    
    # 调用Firebug-lite for IE

	
	${reload-js}
	
	# F5自动刷新

	
	${relativeUrl}
	
	# 根目录相对路径
