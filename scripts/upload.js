const ci = require('miniprogram-ci');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const APPID = 'wxd04e2101ec83912f';

const version = process.argv[2] || '1.1.1';
const desc = process.argv[3] || '连续打卡计数 + 成就徽章 + CI部署';

(async () => {
  const project = new ci.Project({
    appid: APPID,
    type: 'miniProgram',
    projectPath: PROJECT_ROOT,
    privateKeyPath: path.join(PROJECT_ROOT, `private.${APPID}.key`),
    ignores: ['node_modules/**/*'],
  });

  console.log(`正在上传代码: v${version}`);
  console.log(`描述: ${desc}`);

  const uploadResult = await ci.upload({
    project,
    version,
    desc,
    setting: {
      es6: true,
      enhance: true,
      postcss: true,
      minified: true,
      minifyWXML: true,
      minifyWXSS: true,
    },
    robot: 1,
  });

  console.log('上传成功！');
  if (uploadResult.subPackageInfo) {
    for (const pkg of uploadResult.subPackageInfo) {
      console.log(`  ${pkg.name}: ${(pkg.size / 1024).toFixed(1)} KB`);
    }
  }
})().catch(err => {
  console.error('上传失败:', err.message || err);
  process.exit(1);
});
