const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getCustomMessage } = require('../utils/messageUtils');
const { logCommandUsage } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('custom-message3')
    .setDescription('登録済みカスタムメッセージ3を送信'),
  
  async execute(interaction) {
    const slot = 3;
    
    // コマンド使用をログに記録
    logCommandUsage(interaction, 'custom-message3', { slot: slot });
    
    const customMessage = getCustomMessage(interaction.client, interaction.user.id, slot);

    if (!customMessage) {
      await interaction.reply({ 
        content: `スロット ${slot} にカスタムメッセージが登録されていません。/register コマンドで登録してください。`,
        ephemeral: true 
      });
      return;
    }

    // Create button ID with encoded data
    // Format: send_msg_type_[value]_content
    let buttonId = 'send_msg_';
    
    // Add mention type code to the ID
    switch(customMessage.mentionType) {
      case 'user': 
        buttonId += 'u_' + customMessage.mentionValue + '_';
        break;
      case 'here': 
        buttonId += 'h_';
        break;
      case 'everyone': 
        buttonId += 'e_';
        break;
      default:
        buttonId += 'n_'; // none
    }
    
    // Add message content to the ID (truncate if needed)
    let truncatedMessage = customMessage.content;
    const maxButtonIdLength = 100;
    const availableSpace = maxButtonIdLength - buttonId.length;
    
    if (truncatedMessage.length > availableSpace) {
      truncatedMessage = truncatedMessage.substring(0, availableSpace);
    }
    
    buttonId += truncatedMessage;

    // Create the button
    const button = new ButtonBuilder()
      .setCustomId(buttonId)
      .setLabel('開始')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    // Preview of the message
    let previewMessage = `**カスタムメッセージ ${slot} 送信準備完了**\n\n**内容**: ${customMessage.content}\n**メンションタイプ**: ${customMessage.mentionType}`;
    if (customMessage.mentionType === 'user' && customMessage.mentionValue) {
      previewMessage += `\n**メンション対象**: <@${customMessage.mentionValue}>`;
    }
    previewMessage += '\n\n以下の「開始」ボタンをクリックすると、メッセージの送信が開始されます。';
    
    // Add a note if the message was truncated
    if (truncatedMessage !== customMessage.content) {
      previewMessage += '\n\n**注意**: メッセージが長いため、一部のみが送信されます。';
    }

    // Reply with the button
    await interaction.reply({
      content: previewMessage,
      components: [row],
      ephemeral: true
    });
  }
};
