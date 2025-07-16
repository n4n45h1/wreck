const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spam')
    .setDescription('spamを送信する'),
  
  async execute(interaction) {
    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId('spamModal')
      .setTitle('メッセージ送信');

    // Create the text input components
    const messageInput = new TextInputBuilder()
      .setCustomId('messageContent')
      .setLabel('メッセージ内容')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const mentionTypeInput = new TextInputBuilder()
      .setCustomId('mentionType')
      .setLabel('メンションタイプ (user, here, everyone, none)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('none')
      .setRequired(false);

    const mentionValueInput = new TextInputBuilder()
      .setCustomId('mentionValue')
      .setLabel('ユーザーID (userタイプの場合に入力)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    // Add inputs to the modal
    const firstActionRow = new ActionRowBuilder().addComponents(messageInput);
    const secondActionRow = new ActionRowBuilder().addComponents(mentionTypeInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(mentionValueInput);

    // Add inputs to the modal
    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    // Show the modal to the user
    await interaction.showModal(modal);
  },

  async handleModal(interaction) {
    // Get the data from the modal
    const message = interaction.fields.getTextInputValue('messageContent');
    const mentionType = interaction.fields.getTextInputValue('mentionType').toLowerCase() || 'none';
    const mentionValue = interaction.fields.getTextInputValue('mentionValue');

    // Create button ID with encoded data
    // Format: send_msg_type_[value]_content
    let buttonId = 'send_msg_';
    
    // Add mention type code to the ID
    switch(mentionType) {
      case 'user': 
        buttonId += 'u_' + mentionValue + '_';
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
    
    // Add message content to the ID (truncate if needed - Discord has a 100 char limit for custom IDs)
    // We'll use a max of 80 chars for the message content part to stay well under the limit
    let truncatedMessage = message;
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
    let previewMessage = `**送信準備完了**\n\n**内容**: ${message}\n**メンションタイプ**: ${mentionType}`;
    if (mentionType === 'user' && mentionValue) {
      previewMessage += `\n**メンション対象**: <@${mentionValue}>`;
    }
    previewMessage += '\n\n以下の「開始」ボタンをクリックすると、メッセージの送信が開始されます。';
    
    // Add a note if the message was truncated
    if (truncatedMessage !== message) {
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
