const ci = require('miniprogram-ci');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const APPID = 'wxd04e2101ec83912f';
const ENV = 'cloud1-7g3zbpz88e9c4fd4';

// 从命令行参数获取函数名，默认 habitApi
const funcName = process.argv[2] || 'habitApi';

(async () => {
  const project = new ci.Project({
    appid: APPID,
    type: 'miniProgram',
    projectPath: PROJECT_ROOT,
    privateKeyPath: path.join(PROJECT_ROOT, `private.${APPID}.key`),
    ignores: ['node_modules/**/*'],
  });

  console.log(`正在部署云函数: ${funcName} → 环境: ${ENV}`);

  await ci.cloud.uploadFunction({
    project,
    env: ENV,
    name: funcName,
    path: path.join(PROJECT_ROOT, 'cloudfunctions', funcName),
    remoteNpmInstall: true,
  });

  console.log(`${funcName} 部署成功！`);
})().catch(err => {
  console.error(`部署失败:`, err.message || err);
  process.exit(1);
});
