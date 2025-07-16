const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { sendMessages } = require('../utils/messageUtils');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Handle Chat Input Commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
        } else {
          await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
        }
      }
    } 
    // Handle Modal Submissions
    else if (interaction.isModalSubmit()) {
      const modalId = interaction.customId;
      
      // Handle spam modal submission
      if (modalId === 'spamModal') {
        const commandName = 'spam';
        const command = interaction.client.commands.get(commandName);
        
        if (command) {
          try {
            await command.handleModal(interaction);
          } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ content: 'モーダル処理中にエラーが発生しました。', ephemeral: true });
            } else {
              await interaction.reply({ content: 'モーダル処理中にエラーが発生しました。', ephemeral: true });
            }
          }
        }
      } 
      // Handle register modal submissions
      else if (modalId.startsWith('registerModal_')) {
        const commandName = 'register';
        const command = interaction.client.commands.get(commandName);
        
        if (command) {
          try {
            await command.handleModal(interaction);
          } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ content: 'モーダル処理中にエラーが発生しました。', ephemeral: true });
            } else {
              await interaction.reply({ content: 'モーダル処理中にエラーが発生しました。', ephemeral: true });
            }
          }
        }
      }
    }
    // Handle Button Interactions
    else if (interaction.isButton()) {
      const buttonId = interaction.customId;
      
      if (buttonId.startsWith('send_msg_')) {
        try {
          // Parse the data from the button ID
          // Format: send_msg_type_value_content
          // Where type is 'n' (none), 'u' (user), 'h' (here), 'e' (everyone)
          const parts = buttonId.split('_');
          
          if (parts.length >= 3) {
            let mentionType = 'none';
            let mentionValue = '';
            let messageStart = 3; // Default start position for message content
            
            // Parse the mention type
            switch (parts[2]) {
              case 'u': 
                mentionType = 'user'; 
                // Next part is the user ID
                if (parts.length >= 4) {
                  mentionValue = parts[3];
                  messageStart = 4; // Skip the user ID part for the message
                }
                break;
              case 'h': mentionType = 'here'; break;
              case 'e': mentionType = 'everyone'; break;
              default: mentionType = 'none';
            }
            
            // Reconstruct the message content (everything after the prefix and mention info)
            const content = parts.slice(messageStart).join('_');
            
            // Defer the reply to show "Bot is thinking..." then edit later
            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply({ content: 'メッセージを送信しています...', ephemeral: true });
            
            // Send the messages
            await sendMessages(
              interaction,
              content,
              mentionType,
              mentionValue
            );
            
            // Disable the button to prevent multiple clicks
            const disabledButton = ButtonBuilder.from(interaction.message.components[0].components[0]).setDisabled(true);
            const disabledRow = new ActionRowBuilder().addComponents(disabledButton);
            
            // Update the original message with disabled button
            await interaction.message.edit({
              content: interaction.message.content,
              components: [disabledRow]
            });
          } else {
            throw new Error('Invalid button ID format');
          }
          
        } catch (error) {
          console.error('Error handling button interaction:', error);
          await interaction.reply({ 
            content: 'ボタン処理中にエラーが発生しました。',
            ephemeral: true
          });
        }
      }
    }
  },
};
