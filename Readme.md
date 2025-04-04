# Wreck(discord raid bot)
![Version](https://img.shields.io/badge/バージョン-1.0.0-blue)
![License](https://img.shields.io/badge/ライセンス-MIT-green)
![Node](https://img.shields.io/badge/Node.js-16.9.0+-brightgreen)

アプリ連携だけで使える荒らしボット
## コマンド一覧
```md
/spam
```
メッセージを連続して送信することができます。このコマンドを打つとフォームが開き、メッセージ内容やメンション設定ができます。
```md
/register slot:[1-5]
```
カスタムメッセージを登録します。スロット1～5に保存できます。
```md
/custom_message[1-5]
```
登録したカスタムメッセージを送信します。
```md
/help
```
コマンドの使い方などを表示します。

## メリット、デメリット一覧
### メリット
* **@everyone**,**@here**などのメンションが使える。(大半のサーバーは無理)
* アプリ連携のみで使え、サーバー導入が不必要。
* ボットがメッセージを送るので、匿名化。
* 外部アプリの使用はデフォルトで許可されているため、大半のサーバーで荒らしは可能。

### デメリット
* APIの性質上、一回のリクエストにつき6件までしかメッセージを送れない。
* アカウントをバンされるとメッセージが消える。

## メモ
* 荒らしをする際は、サーバーに入ってから最低でも1日以上経ってから荒らすことを推奨。(サーバーに入ってからすぐ荒らしてしまうとバンされる可能性があるため。)
* 荒らしをする際は、ステータスをオフライン。(誰がコマンドを打ったのかを隠すため。)
* 荒らしをする際には**自己責任**で、お願いします。

## 参考
* CtkpのLexion

## セットアップ

### 必要条件

- Node.js 16.9.0以上
- Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications)から取得)
### インストール手順
このリポジトリをクローンし、wreckへディレクトリに移動
```bash
git clone https://github.com/n4n45h1/wreck.git
cd wreck
```
npmを使用する場合
```bash
npm install
npm start
```
yarnを使用する場合
```bash
yarn install
yarn start
```


## License

[MIT](https://choosealicense.com/licenses/mit/)
