module.exports = {

    // mode: 'production',
    mode: 'development',
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: `./src/index.js`,
   
    // ファイルの出力設定
    output: {
      //  出力ファイルのディレクトリ名
      path: `${__dirname}/dist`,
      // 出力ファイル名
      filename: 'main.js'
    },
  };
  