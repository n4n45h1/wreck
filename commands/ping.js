const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botの応答時間を表示します'),
  
  async execute(interaction) {
    try {
      // 現在の時刻を記録
      const sent = await interaction.reply({ 
        content: 'Pinging...', 
        ephemeral: true,
        fetchReply: true 
      });
      
      // レスポンス時間を計算
      const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);
      
      // 結果を編集して表示
      await interaction.editReply({
        content: `🏓 **Pong!**\n\n` +
                `⏱️ **応答時間**: ${timeDiff}ms\n` +
                `🌐 **API レイテンシ**: ${apiLatency}ms`,
        ephemeral: true
      });
      
    } catch (error) {
      console.error('Error executing ping command:', error);
      
      // エラーハンドリング
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ 
            content: 'Pingコマンドの実行中にエラーが発生しました。',
            ephemeral: true
          });
        } else {
          await interaction.reply({ 
            content: 'Pingコマンドの実行中にエラーが発生しました。',
            ephemeral: true
          });
        }
      } catch (responseError) {
        console.error('Error sending error response:', responseError);
      }
    }
  },
};
