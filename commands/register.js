const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const { storeCustomMessage } = require('../utils/messageUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('カスタムメッセージを登録する')
    .addIntegerOption(option => 
      option.setName('slot')
        .setDescription('登録するスロット番号 (1-5)')
        .setRequired(true)
        .addChoices(
          { name: '1', value: 1 },
          { name: '2', value: 2 },
          { name: '3', value: 3 },
          { name: '4', value: 4 },
          { name: '5', value: 5 },
        )),
  
  async execute(interaction) {
    const slot = interaction.options.getInteger('slot');

    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId(`registerModal_${slot}`)
      .setTitle(`カスタムメッセージ登録 (スロット ${slot})`);

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
    const modalId = interaction.customId;
    const slot = parseInt(modalId.replace('registerModal_', ''));

    // Get the data from the modal
    const message = interaction.fields.getTextInputValue('messageContent');
    const mentionType = interaction.fields.getTextInputValue('mentionType').toLowerCase() || 'none';
    const mentionValue = interaction.fields.getTextInputValue('mentionValue');

    // Store the custom message
    storeCustomMessage(interaction.client, interaction.user.id, slot, message, mentionType, mentionValue);

    // Acknowledge the submission
    await interaction.reply({ 
      content: `スロット ${slot} にカスタムメッセージが登録されました。/custom-message${slot} で送信できます。`,
      ephemeral: true 
    });
  }
};
