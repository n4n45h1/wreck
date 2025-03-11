const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

    // Send 5 messages
    for (let i = 0; i < 5; i++) {
      await interaction.followUp({ 
        content: finalMessage,
        allowedMentions: allowedMentions,
        ephemeral: false
      });
    }
  } catch (error) {
    console.error('Error sending messages:', error);
    await interaction.followUp({ 
      content: 'メッセージ送信中にエラーが発生しました。',
      ephemeral: true
    });
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
