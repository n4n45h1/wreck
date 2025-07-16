const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getRecentLogs, getLogStats, clearLogs, logCommandUsage } = require('../utils/logger');

// 管理者チェック機能
function isAdmin(userId) {
  const adminIds = process.env.ADMIN_USER_IDS ? process.env.ADMIN_USER_IDS.split(',').map(id => id.trim()) : [];
  return adminIds.includes(userId);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('ログを表示・管理します')
    .addSubcommand(subcommand =>
      subcommand
        .setName('recent')
        .setDescription('最近のログを表示')
        .addIntegerOption(option =>
          option.setName('limit')
            .setDescription('表示する件数 (0で全件表示、デフォルト: 10)')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(1000)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('ログの統計情報を表示')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('ログをクリア（管理者のみ）')
    ),
  
  async execute(interaction) {
    try {
      // 管理者チェック
      if (!isAdmin(interaction.user.id)) {
        await interaction.reply({
          content: '❌ このコマンドは管理者のみが使用できます。',
          ephemeral: true
        });
        return;
      }

      const subcommand = interaction.options.getSubcommand();
      
      if (subcommand === 'recent') {
        const limit = interaction.options.getInteger('limit');
        const actualLimit = limit === 0 ? 10000 : (limit || 10); // 0の場合は10000件（実質全件）
        const logs = getRecentLogs('command', actualLimit);
        
        if (logs.length === 0) {
          await interaction.reply({
            content: '📝 ログが見つかりませんでした。',
            ephemeral: true
          });
          return;
        }
        
        const embed = new EmbedBuilder()
          .setTitle(`📝 最近のログ ${limit === 0 ? '(全件)' : `(${actualLimit}件)`}`)
          .setColor(0x0099FF)
          .setTimestamp();
        
        const logText = logs.map(log => {
          const timestamp = new Date(log.timestamp).toLocaleString('ja-JP');
          const action = log.action || log.commandName || 'unknown';
          const content = log.messageContent ? 
            `"${log.messageContent.substring(0, 30)}${log.messageContent.length > 30 ? '...' : ''}"`
            : '';
          
          return `**${timestamp}** - ${log.username} が **${action}** を実行 ${content}`;
        }).join('\n');
        
        embed.setDescription(logText.length > 4000 ? 
          logText.substring(0, 4000) + '...' : logText);
        
        await interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
        
      } else if (subcommand === 'stats') {
        const stats = getLogStats();
        
        if (!stats) {
          await interaction.reply({
            content: '📊 統計情報の取得に失敗しました。',
            ephemeral: true
          });
          return;
        }
        
        // 管理者チェック
        if (!isAdmin(interaction.user.id)) {
          await interaction.reply({
            content: '❌ このコマンドは管理者のみが使用できます。',
            ephemeral: true
          });
          return;
        }
        
        const embed = new EmbedBuilder()
          .setTitle('📊 ログ統計')
          .setColor(0x00FF00)
          .setTimestamp();
        
        embed.addFields(
          { name: '総コマンド数', value: stats.totalCommands.toString(), inline: true },
          { name: 'ユニークユーザー数', value: stats.uniqueUsers.toString(), inline: true },
          { name: '\u200B', value: '\u200B', inline: true }
        );
        
        if (Object.keys(stats.commandCounts).length > 0) {
          const topCommands = Object.entries(stats.commandCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cmd, count]) => `**${cmd}**: ${count}回`)
            .join('\n');
          
          embed.addFields({
            name: '人気コマンド TOP5',
            value: topCommands,
            inline: true
          });
        }
        
        if (Object.keys(stats.userCounts).length > 0) {
          const topUsers = Object.entries(stats.userCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([user, count]) => `**${user}**: ${count}回`)
            .join('\n');
          
          embed.addFields({
            name: 'アクティブユーザー TOP5',
            value: topUsers,
            inline: true
          });
        }
        
        await interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
        
      } else if (subcommand === 'clear') {
        // 管理者権限チェック
        if (!isAdmin(interaction.user.id)) {
          await interaction.reply({
            content: '❌ このコマンドは管理者のみが使用できます。',
            ephemeral: true
          });
          return;
        }
        
        clearLogs('command');
        clearLogs('error');
        
        await interaction.reply({
          content: '✅ ログをクリアしました。',
          ephemeral: true
        });
      }
      
    } catch (error) {
      console.error('Error executing logs command:', error);
      await interaction.reply({
        content: 'ログコマンドの実行中にエラーが発生しました。',
        ephemeral: true
      });
    }
  },
};
