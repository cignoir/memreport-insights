#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// プロジェクトルートディレクトリ
const projectRoot = join(__dirname, '..');

// パッケージ情報を読み込み
const packageJsonPath = join(projectRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// コマンドライン引数を解析
const args = process.argv.slice(2);
let port = 3000;
let openBrowser = true;
let host = 'localhost';

// ヘルプメッセージ
function showHelp() {
  console.log(`
${packageJson.name} v${packageJson.version}
${packageJson.description}

使用方法:
  npx memreport-insights [オプション]

オプション:
  -p, --port <port>     サーバーポート (デフォルト: 3000)
  -h, --host <host>     サーバーホスト (デフォルト: localhost)
  --no-open            ブラウザを自動で開かない
  --help               このヘルプを表示
  --version            バージョンを表示

例:
  npx memreport-insights                    # デフォルト設定で起動
  npx memreport-insights -p 8080           # ポート8080で起動
  npx memreport-insights --no-open         # ブラウザを開かずに起動
`);
}

// バージョン表示
function showVersion() {
  console.log(packageJson.version);
}

// 引数解析
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--help':
      showHelp();
      process.exit(0);
      
    case '--version':
      showVersion();
      process.exit(0);
      
    case '-p':
    case '--port':
      if (i + 1 < args.length) {
        port = parseInt(args[++i]);
        if (isNaN(port) || port < 1 || port > 65535) {
          console.error('❌ エラー: 有効なポート番号を指定してください (1-65535)');
          process.exit(1);
        }
      } else {
        console.error('❌ エラー: --port オプションにはポート番号が必要です');
        process.exit(1);
      }
      break;
      
    case '-h':
    case '--host':
      if (i + 1 < args.length) {
        host = args[++i];
      } else {
        console.error('❌ エラー: --host オプションにはホスト名が必要です');
        process.exit(1);
      }
      break;
      
    case '--no-open':
      openBrowser = false;
      break;
      
    default:
      if (arg.startsWith('-')) {
        console.error(`❌ エラー: 不明なオプション: ${arg}`);
        console.log('--help でヘルプを表示できます');
        process.exit(1);
      }
  }
}

// 必要なファイルの存在確認
const viteConfigPath = join(projectRoot, 'vite.config.ts');
const srcPath = join(projectRoot, 'src');

if (!existsSync(srcPath)) {
  console.error('❌ エラー: プロジェクトファイルが見つかりません');
  console.error('このツールは memreport-insights プロジェクトのルートディレクトリで実行する必要があります');
  process.exit(1);
}

console.log('🚀 Memreport Insights を起動しています...');
console.log(`📍 URL: http://${host}:${port}`);
console.log(`🌐 ホスト: ${host}`);
console.log(`🔌 ポート: ${port}`);
console.log('');

// Vite開発サーバーを起動
const viteArgs = [
  '--host', host,
  '--port', port.toString()
];

if (openBrowser) {
  viteArgs.push('--open');
}

const viteProcess = spawn('npx', ['vite', ...viteArgs], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

// プロセス終了時のクリーンアップ
process.on('SIGINT', () => {
  console.log('\n🛑 サーバーを停止しています...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  viteProcess.kill('SIGTERM');
});

// Viteプロセスのエラーハンドリング
viteProcess.on('error', (error) => {
  if (error.code === 'ENOENT') {
    console.error('❌ エラー: Viteが見つかりません');
    console.error('npm install を実行して依存関係をインストールしてください');
  } else {
    console.error('❌ エラー:', error.message);
  }
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ サーバーが異常終了しました (終了コード: ${code})`);
  }
  process.exit(code || 0);
});