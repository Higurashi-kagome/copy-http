# Copy HTTP Extension

[Chrome][aihjaemhdhnklanahidclalbdeilkleo]

这是一个用于复制 HTTP 请求和响应数据的浏览器扩展。通过设置规则，可以自动复制请求头、响应头、URL、请求体和请求参数等内容到剪贴板。

> 图标来自 [iconfont | sshhaa][iconfont]。

## 功能

- 复制请求头
- 复制响应头
- 复制 URL
- 复制请求体
- 复制请求参数

## 开发

首先，clone 代码并安装依赖，然后运行开发服务器：

```bash
pnpm dev
# or
npm run dev
```

打开浏览器并加载相应的开发构建。例如，如果正在为 Chrome 浏览器开发，使用 manifest v3，请使用：`build/chrome-mv3-dev`。

扩展基于 [Plasmo](https://docs.plasmo.com/) 搭建的脚手架，详情参考官方文档。

## 生成生产构建

运行以下命令：

```bash
pnpm build
# or
npm run build
```

这将为扩展创建一个生产包，准备好压缩并发布到商店。

[aihjaemhdhnklanahidclalbdeilkleo]: https://chromewebstore.google.com/detail/copy-http/aihjaemhdhnklanahidclalbdeilkleo
[iconfont]: https://www.iconfont.cn/user/detail?uid=43820&nid=Tm5ezG3YNRej