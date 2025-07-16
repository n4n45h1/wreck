const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('ボットの使い方を表示'),
  
  async execute(interaction) {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('ボットの使い方')
      .setDescription('このボットのコマンド一覧と説明')
      .addFields(
        { name: '/spam', value: '複数回（5回）メッセージを送信します。メッセージ内容やメンション設定ができます。' },
        { name: '/register', value: 'カスタムメッセージを登録します。スロット1～5に保存できます。' },
        { name: '/custom-message1 ～ /custom-message5', value: '登録したカスタムメッセージを送信します。' },
        { name: '/ping', value: 'ボットの応答時間とAPIレイテンシを表示します。' },
        { name: '/logs', value: 'ログの表示・管理を行います。（recent, stats, clear）' },
        { name: '/help', value: 'このヘルプメッセージを表示します。' }
      )
      .setFooter({ text: 'メンションタイプは user, here, everyone, none が利用可能です。' });

    await interaction.reply({ 
      embeds: [helpEmbed],
      ephemeral: true 
    });
  }
};
