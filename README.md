# MCModeOrganizer
> 一个用于区分 Mod 为服务端可用还是客户端可用的工具。支持 Forge 和 Fabric。Deno 开发，全平台适配。

### 特点
- 支持 Forge 和 Fabric 模组。
- 基于 Deno 开发，并打包为可执行文件，全平台可用。

### 使用
1. 前往 [Releases](https://github.com/PayaHai/MCModeOrganizer/releases) 页面下载适用您系统的最新版可执行文件。
2. 执行可执行文件。
> 工具会自动读取当前目前下的 `mods` 文件夹中的模组，并将支持服务端运行的 Mod 置于 `mods_server` 文件夹中，支持客户端运行的 Mod 置于 `mods_client` 文件夹中。