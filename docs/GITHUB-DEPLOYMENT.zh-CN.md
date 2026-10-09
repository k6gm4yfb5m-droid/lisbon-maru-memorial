# GitHub 同步与独立网站部署

更新日期：2026-10-09。

## 当前状态

- GitHub 仓库：https://github.com/k6gm4yfb5m-droid/lisbon-maru-memorial
- 原公开网站：https://lisbon-maru-remembrance-lizh.gsmgwt7ywg.chatgpt.site/
- 新托管：已准备 Cloudflare Workers 全栈构建、D1/R2 绑定、数据库迁移及 GitHub Actions。尚未配置用户的托管账号和域名，因此没有新的公开网址。
- 原站的页面、样式、分页、花海、全屏、时间轴和地球仪代码没有因这次部署准备而修改。

## 代码与网站的关系

GitHub 保存代码和修改记录；独立托管平台负责运行网站。仓库可以保持私有，网站仍然对公众开放。

预期流程：在 Codex 修改 → 验证 → 提交到 GitHub 的 `main` → Actions 自动验证 → 部署到自己的托管账号 → 同一公开网址显示新版。编辑器中保存文件本身不等于已经同步；需要完成 GitHub 提交。以后在本项目中完成修改时，Codex 应一并同步仓库，并报告结果。

GitHub Pages 只托管静态文件，无法单独运行现有留言、上传、删除和纪念记录 API。因此本方案不把现有网站强行导出成失去功能的静态网站。

## 大陆、香港、澳门访问

独立版本不需要访问 OpenAI，不要求访客登录 ChatGPT。页面、地图数据和互动代码使用同一站点内的资源；史料链接是读者主动打开的外部链接，其可达性由对应网站决定。

**“不依赖 OpenAI”与“所有地区都一定可访问”是两件事。** GitHub Pages、Cloudflare 的默认域名及普通境外线路都不能作为大陆访问保证。新域名上线后，必须使用大陆不同运营商和香港、澳门的真实网络测试首页、图片和 API；当前没有完成这些地区的实测。

部署选择：

1. **先完成独立版本**：自己的域名 + Cloudflare Workers + D1 + R2。最贴近现有技术结构，当前代码已准备并做本地完整 API 测试。该方案仍需区域访问验证。
2. **大陆访问优先**：评估大陆云服务器/CDN，并按服务商要求办理 ICP；或者先评估香港服务器和实际跨境线路。迁往普通服务器时还需要适配现有 D1/R2 接口、持久存储和备份，当前 Cloudflare 构建不能直接当成通用服务器镜像使用。

不要在区域验证完成前宣称“大陆、香港、澳门均可稳定访问”。

## 首次部署所需

用户需在自己的账号中完成：

1. 注册/登录 Cloudflare，确认可使用 Workers、D1 和 R2；涉及付费或账单设置时由用户自行确认。
2. 如需正式公开域名，购买自己的域名并接入 Cloudflare。没有域名可先得到 `workers.dev` 测试链接，但它不代表大陆可达。
3. 创建 D1 数据库 `lisbon-maru-memorial` 和 R2 桶 `lisbon-maru-attachments`，记录数据库 ID。名称可自定义，变量中保持一致。
4. 在 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置下表；密钥只放 Secrets，不发到聊天或写入代码。

| 类型 | 名称 | 内容 |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | 限定到自己的账号及此部署所需 Workers、D1、R2 权限的部署 token；配置自定义域名时还需对应域名权限 |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账号 ID |
| Variable | `MEMORIAL_DB_ID` | 自己的 D1 数据库 UUID，必填 |
| Variable | `MEMORIAL_DB_NAME` | 默认 `lisbon-maru-memorial` |
| Variable | `MEMORIAL_BUCKET_NAME` | 默认 `lisbon-maru-attachments` |
| Variable | `MEMORIAL_WORKER_NAME` | 默认 `lisbon-maru-memorial` |
| Variable | `MEMORIAL_DOMAIN` | 如 `memorial.your-domain.com`，不带协议或路径；留空使用测试域名 |
| Variable | `CLOUDFLARE_DEPLOY_ENABLED` | 准备完成后设为 `true`，才会启用线上部署 |

`CLOUDFLARE_DEPLOY_ENABLED` 必须配置为仓库级 Variable，因为工作流在启动部署任务前读取它。其余部署值也可以放在 GitHub `production` Environment 的 Secrets/Variables 中。CI 检查不需要线上密钥。

5. 在 Actions 中运行 `Check and deploy independent website`，确认 `check` 和 `deploy` 都成功。真实访问链接取自成功的 Cloudflare 部署结果，不能根据仓库名猜测。
6. 打开新网址，验证公开访问及功能；完成地区实测后再将它作为正式入口。

也可以使用 Cloudflare 官方 Git 集成，但与 Actions 应二选一，避免重复部署。Git 集成中构建命令用 `npm run build:cloudflare`，部署命令用 `npm run db:migrate:cloudflare && npm run deploy:cloudflare`，并配置同样的变量。

## 现有数据迁移

GitHub 不保存访客留言、上传图片、纪念次数及浏览器身份 cookie。新 D1/R2 默认是空的；原站不会被清空。

正式切换前，先备份并导出原站数据库、附件元数据及 R2 文件，再导入自己的 D1/R2，并核对附件数量和抽样下载。不要通过公开留言 API 抓取数据来代替所有者授权的数据导出。原 Sites 资源的导出权限或工具若不可用，需要通过平台支持取得导出。

原站匿名 cookie 绑定原域名，不能自动跨域携带；此前登录身份也不是独立版本的登录系统。旧留言的内容可以迁移，但旧留言的删除归属需要单独设计安全迁移/管理方案。独立版新留言可在保存时使用的同一浏览器中删除，无需 OpenAI 登录。

## 本地命令

Node.js 22.13 或以上；使用仓库现有 `package-lock.json`。

```sh
npm run install:ci
npx tsc --noEmit
npm run build:cloudflare
npm run test:cloudflare
```

独立开发预览：`npm run dev:cloudflare`，地址 `http://127.0.0.1:5174`。它使用本地数据库/文件存储，不连接线上资源。

部署前将上述变量放在当前终端的环境变量中，再执行：

```sh
npm run check:cloudflare
npm run build:cloudflare
npm run db:migrate:cloudflare
npm run deploy:cloudflare
```

`check:cloudflare` 会拒绝示例数据库 ID；`deploy:cloudflare` 会拒绝错用原 Sites 的构建产物。两种构建目前都输出到 `dist`，切换托管目标前必须重新构建。日常原站的 `npm run dev` 和 `npm run build` 保留原行为。

## 维护与回滚

- 每次更新先通过类型检查、构建和本地独立 Worker 测试。测试覆盖无文字图片留言、附件读取、他人不可删除、跨站请求拒绝、本人删除及重复献花去重。
- 不把 `.env`、token、数据库导出、上传文件、`node_modules` 或 `dist` 提交到 GitHub。
- 部署失败时保留上一线上版本；在 Cloudflare 中可选择上一 Worker 版本回滚。代码回滚不会自动撤销数据库迁移，修改数据结构前另做备份。
- GitHub 上的首次导入采用源码快照。原 Sites 历史与 GitHub 历史不同，不要强制推送覆盖任一方历史；后续可通过 GitHub 连接提交变更。

## 官方参考

- [GitHub Pages 的静态托管范围](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Cloudflare Workers Git 自动构建](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Cloudflare Wrangler 配置](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Cloudflare 中国网络的独立订阅及接入要求](https://developers.cloudflare.com/china-network/)
- [阿里云网站 ICP 适用情形](https://www.alibabacloud.com/help/en/icp-filing/basic-icp-service/product-overview/icp-filing-requirements-for-a-regular-website)
