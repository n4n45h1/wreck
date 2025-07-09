const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Function to get online users from the guild
async function getOnlineUsers(guild) {
  try {
    // Fetch all members to get their presence
    await guild.members.fetch();
    
    const onlineUsers = guild.members.cache.filter(member => {
      // Filter out bots and get only online users
      return !member.user.bot && 
             member.presence && 
             (member.presence.status === 'online' || 
              member.presence.status === 'idle' || 
              member.presence.status === 'dnd');
    });
    
    return Array.from(onlineUsers.values());
  } catch (error) {
    console.error('Error fetching online users:', error);
    return [];
  }
}

// Function to get a random online user
function getRandomOnlineUser(onlineUsers) {
  if (onlineUsers.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * onlineUsers.length);
  return onlineUsers[randomIndex];
}

// Function to get multiple random online users within message length limit
function getMultipleRandomUsers(onlineUsers, baseMessage) {
  if (onlineUsers.length === 0) return [];
  
  const maxMessageLength = 2000; // Discord message limit
  const baseLength = baseMessage.length + 1; // +1 for space after mentions
  let currentLength = baseLength;
  const selectedUsers = [];
  const availableUsers = [...onlineUsers]; // Copy array to avoid modifying original
  
  // Each mention is approximately <@userID> format, so around 21-22 characters per mention
  while (availableUsers.length > 0 && selectedUsers.length < 20) { // Max 20 mentions to be safe
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    const user = availableUsers[randomIndex];
    const mentionLength = `<@${user.id}> `.length;
    
    // Check if adding this mention would exceed the message limit
    if (currentLength + mentionLength > maxMessageLength) {
      break;
    }
    
    selectedUsers.push(user);
    currentLength += mentionLength;
    availableUsers.splice(randomIndex, 1); // Remove selected user from available pool
  }
  
  return selectedUsers;
}

// Function to send messages
async function sendMessages(interaction, message, mentionType, mentionValue) {
  try {
    let onlineUsers = [];
    
    // Get online users if random mention is selected
    if (mentionType === 'random') {
      onlineUsers = await getOnlineUsers(interaction.guild);
      if (onlineUsers.length === 0) {
        await interaction.editReply({ 
          content: 'オンラインユーザーが見つかりませんでした。通常のメッセージとして送信します。'
        });
        mentionType = 'none'; // Fallback to no mention
      }
    }

    let successCount = 0;
    let errorCount = 0;

    // Send 5 messages with error handling for each
    for (let i = 0; i < 5; i++) {
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
        } else if (mentionType === 'random' && onlineUsers.length > 0) {
          // Get multiple random online users for each message
          const randomUsers = getMultipleRandomUsers(onlineUsers, message);
          if (randomUsers.length > 0) {
            const mentions = randomUsers.map(user => `<@${user.id}>`).join(' ');
            finalMessage = `${mentions} ${message}`;
            allowedMentions = { users: randomUsers.map(user => user.id) };
          }
        }

        await interaction.followUp({ 
          content: finalMessage,
          allowedMentions: allowedMentions,
          ephemeral: false
        });
        successCount++;
      } catch (messageError) {
        console.error(`Error sending message ${i + 1}:`, messageError);
        errorCount++;
      }
    }
    
    // Send completion message
    let completionMessage = `メッセージ送信完了: ${successCount}件成功`;
    if (errorCount > 0) {
      completionMessage += `, ${errorCount}件失敗`;
    }
    if (mentionType === 'random' && onlineUsers.length > 0) {
      completionMessage += `\nランダムメンション: ${onlineUsers.length}人のオンラインユーザーから複数人を選択`;
    }
    
    await interaction.editReply({ content: completionMessage });
    
  } catch (error) {
    console.error('Error in sendMessages function:', error);
    
    // Check if we can still edit the reply
    try {
      await interaction.editReply({ 
        content: 'メッセージ送信中にエラーが発生しました。'
      });
    } catch (editError) {
      console.error('Error editing reply:', editError);
      // If edit fails, try to send a followup
      try {
        await interaction.followUp({ 
          content: 'メッセージ送信中にエラーが発生しました。',
          ephemeral: true
        });
      } catch (followUpError) {
        console.error('Error sending followup:', followUpError);
      }
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
  getCustomMessage,
  getOnlineUsers,
  getRandomOnlineUser,
  getMultipleRandomUsers
};
