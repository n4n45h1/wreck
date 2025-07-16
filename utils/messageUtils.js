const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logMessageSent } = require('./logger');

// Function to send messages
async function sendMessages(interaction, message, mentionType, mentionValue) {
  try {
    let finalMessage = message;
    let allowedMentions = { parse: [] }; // Default: no mentions
    
    // Handle mentions based on the type
    if (mentionType === 'user' && mentionValue) {
      finalMessage = `<@${mentionValue}> ${message}`;
      allowedMentions = { users: [mentionValue] };
    } else if (mentionType === 'here') {
      finalMessage = `@here ${message}`;
      allowedMentions = { parse: ['here'] }; // Allow @here mentions
    } else if (mentionType === 'everyone') {
      finalMessage = `@everyone ${message}`;
      allowedMentions = { parse: ['everyone'] }; // Allow @everyone mentions
    }

    // Send 5 messages with proper error handling
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < 5; i++) {
      try {
        await interaction.followUp({ 
          content: finalMessage,
          allowedMentions: allowedMentions,
          ephemeral: false
        });
        successCount++;
      } catch (messageError) {
        errorCount++;
        console.error(`Error sending message ${i + 1}:`, messageError);
        
        // Handle specific Discord API errors
        if (messageError.code === 10003) {
          console.error('Channel not found or not cached');
        } else if (messageError.code === 50001) {
          console.error('Missing access to channel');
        } else if (messageError.code === 50013) {
          console.error('Missing permissions');
        }
        
        // Continue with other messages even if one fails
      }
    }
    
    // Update the user about the results
    if (successCount > 0) {
      // メッセージ送信をログに記録
      logMessageSent(interaction, message, mentionType, mentionValue, successCount);
      
      await interaction.editReply({ 
        content: `メッセージを${successCount}件送信しました。${errorCount > 0 ? `（${errorCount}件失敗）` : ''}`,
        ephemeral: true
      });
    } else {
      await interaction.editReply({ 
        content: 'メッセージの送信に失敗しました。チャンネルの権限を確認してください。',
        ephemeral: true
      });
    }
    
  } catch (error) {
    console.error('Error in sendMessages function:', error);
    
    try {
      await interaction.editReply({ 
        content: 'メッセージ送信中にエラーが発生しました。',
        ephemeral: true
      });
    } catch (editError) {
      console.error('Error editing reply:', editError);
    }
  }
}

// Function to store a custom message
function storeCustomMessage(client, userId, slot, message, mentionType, mentionValue) {
  if (!client.customMessages[userId]) {
    client.customMessages[userId] = {};
  }

  client.customMessages[userId][slot] = {
    content: message,
    mentionType: mentionType || 'none',
    mentionValue: mentionValue || ''
  };
}

// Function to get a custom message
function getCustomMessage(client, userId, slot) {
  if (!client.customMessages[userId] || !client.customMessages[userId][slot]) {
    return null;
  }
  return client.customMessages[userId][slot];
}

module.exports = {
  sendMessages,
  storeCustomMessage,
  getCustomMessage
};
