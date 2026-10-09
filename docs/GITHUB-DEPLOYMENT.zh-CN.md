# GitHub 同步与独立网站部署

更新日期：2026-10-09。

## 当前状态

- GitHub 仓库（已公开）：https://github.com/k6gm4yfb5m-droid/lisbon-maru-memorial
- 独立公开网站：https://lisbon-maru-memorial.kwnwh7pg2p.workers.dev/?lang=zh
- 原公开网站：https://lisbon-maru-remembrance-lizh.gsmgwt7ywg.chatgpt.site/
- 新托管：Cloudflare Workers 已部署成功，D1 数据库和 R2 图片桶已绑定；访客无需登录 OpenAI。当前使用默认域名，尚未绑定自有域名。
- 已实测线上首页、8 个脚本/样式资源、地图、无文字图片留言保存、附件读取、本人删除及附件清理；他人删除与跨站删除被拒绝。验证产生的测试留言和附件已清理。原站首页仍返回 HTTP 200。
- 原站的页面、样式、分页、花海、全屏、时间轴和地球仪代码没有因这次部署准备而修改。

## 代码与网站的关系

GitHub 保存代码和修改记录；独立托管平台负责运行网站。仓库可以保持私有，网站仍然对公众开放。

当前流程：在 Codex 修改 → 本地验证 → 提交到 GitHub 的 `main` → Cloudflare Git 集成自动构建和部署 → 同一公开网址显示新版。GitHub Actions 同时运行独立验证；它的部署任务保持关闭。Cloudflare 构建目前不等待 Actions 结果，因此提交前必须完成本地检查。编辑器中保存文件本身不等于已经同步；需要完成 GitHub 提交。以后在本项目中完成修改时，Codex 应一并同步仓库，并报告结果。原 OpenAI 站点的发布仍由原 Sites 流程单独完成。

GitHub Pages 只托管静态文件，无法单独运行现有留言、上传、删除和纪念记录 API。因此本方案不把现有网站强行导出成失去功能的静态网站。

## 大陆、香港、澳门访问

独立版本不需要访问 OpenAI，不要求访客登录 ChatGPT。页面、地图数据和互动代码使用同一站点内的资源；史料链接是读者主动打开的外部链接，其可达性由对应网站决定。

**“不依赖 OpenAI”与“所有地区都一定可访问”是两件事。** GitHub Pages、Cloudflare 的默认域名及普通境外线路都不能作为大陆访问保证。新域名上线后，必须使用大陆不同运营商和香港、澳门的真实网络测试首页、图片和 API；当前没有完成这些地区的实测。

部署选择：

1. **当前独立版本**：Cloudflare Workers + D1 + R2 已上线，可再绑定自己的域名。已完成本地完整 API 测试与线上附件流程验证，仍需区域访问实测。
2. **大陆访问优先**：评估大陆云服务器/CDN，并按服务商要求办理 ICP；或者先评估香港服务器和实际跨境线路。迁往普通服务器时还需要适配现有 D1/R2 接口、持久存储和备份，当前 Cloudflare 构建不能直接当成通用服务器镜像使用。

不要在区域验证完成前宣称“大陆、香港、澳门均可稳定访问”。

## 当前 Cloudflare Git 自动部署配置

在 Workers & Pages → `lisbon-maru-memorial` → Settings → Builds 中维护：

| 配置 | 当前值 |
| --- | --- |
| Git 仓库 / 生产分支 | `k6gm4yfb5m-droid/lisbon-maru-memorial` / `main` |
| 根目录 | `/`，代码就在仓库根目录，不要填写本地文件夹名称 |
| 构建命令 | `npm run build:cloudflare` |
| 部署命令 | `npm run db:migrate:cloudflare && npm run deploy:cloudflare` |
| 构建变量 `NODE_VERSION` | `22.22.0` |
| 构建变量 `MEMORIAL_DB_ID` | `1223f837-a148-4962-b743-0b5d6cb0bced` |
| D1 绑定 | `DB` → `lisbon-maru-memorial` |
| R2 绑定 | `BUCKET` → `lisbon-maru-attachments` |

部署凭据由 Cloudflare 构建配置保存，不写入仓库。R2 桶的直接公开访问关闭，附件通过网站 API 读取。R2 已经用户授权开通，用量超过免费额度可能收费。

GitHub 的 `CLOUDFLARE_DEPLOY_ENABLED` 保持未设置或 `false`，避免与 Cloudflare Git 集成重复部署；无需为当前流程另建 GitHub 部署 Secrets。GitHub 已保存同名 `MEMORIAL_DB_ID` Variable，但 Cloudflare 构建使用自身设置中的变量。

## 备选：改用 GitHub Actions 部署

以下仅用于以后替换当前 Git 集成。先停用 Cloudflare Git 自动部署，再配置 Actions；不要同时启用两套部署。首次迁入另一个账号时还需创建对应资源。

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

当前已使用前述 Cloudflare 官方 Git 集成，不需要执行这套 Actions 部署设置。

## 现有数据迁移

GitHub 不保存访客留言、上传图片、纪念次数及浏览器身份 cookie。本次新 D1/R2 从空库开始，未迁移旧访客数据；两站留言和纪念记录独立保存，原站及原数据保留。

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
