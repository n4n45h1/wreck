const fs = require('fs');
const path = require('path');

// ログディレクトリの作成
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ログファイルのパス
const commandLogPath = path.join(logDir, 'command_usage.log');
const errorLogPath = path.join(logDir, 'errors.log');

// 日付フォーマット関数
function formatDate(date = new Date()) {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

// コマンド使用ログ（spamとcustom-messageのみ）
function logCommandUsage(interaction, commandName, additionalData = {}) {
  // spamとcustom-messageコマンドのみをログに記録
  const allowedCommands = ['spam', 'spam_modal', 'custom-message1', 'custom-message2', 'custom-message3', 'custom-message4', 'custom-message5'];
  
  if (!allowedCommands.includes(commandName)) {
    return; // ログに記録しない
  }

  const logEntry = {
    timestamp: formatDate(),
    userId: interaction.user.id,
    username: interaction.user.username,
    displayName: interaction.user.displayName || interaction.user.username,
    discriminator: interaction.user.discriminator,
    commandName: commandName,
    channelId: interaction.channelId,
    guildId: interaction.guildId,
    guildName: interaction.guild?.name || 'DM',
    ...additionalData
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  
  try {
    fs.appendFileSync(commandLogPath, logLine);
    console.log(`[COMMAND LOG] ${logEntry.username} used /${commandName} in ${logEntry.guildName}`);
  } catch (error) {
    console.error('Error writing command log:', error);
  }
}

// メッセージ送信ログ
function logMessageSent(interaction, messageContent, mentionType, mentionValue, messageCount = 1) {
  const logEntry = {
    timestamp: formatDate(),
    userId: interaction.user.id,
    username: interaction.user.username,
    displayName: interaction.user.displayName || interaction.user.username,
    action: 'MESSAGE_SENT',
    messageContent: messageContent,
    mentionType: mentionType || 'none',
    mentionValue: mentionValue || '',
    messageCount: messageCount,
    channelId: interaction.channelId,
    guildId: interaction.guildId,
    guildName: interaction.guild?.name || 'DM'
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  
  try {
    fs.appendFileSync(commandLogPath, logLine);
    console.log(`[MESSAGE LOG] ${logEntry.username} sent ${messageCount} messages: "${messageContent.substring(0, 50)}..."`);
  } catch (error) {
    console.error('Error writing message log:', error);
  }
}

// エラーログ
function logError(error, context = {}) {
  const logEntry = {
    timestamp: formatDate(),
    error: error.message,
    stack: error.stack,
    context: context
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  
  try {
    fs.appendFileSync(errorLogPath, logLine);
    console.error(`[ERROR LOG] ${error.message}`);
  } catch (logError) {
    console.error('Error writing error log:', logError);
  }
}

// ログファイルの読み取り（最新N件）
function getRecentLogs(logType = 'command', limit = 100) {
  const logPath = logType === 'error' ? errorLogPath : commandLogPath;
  
  try {
    if (!fs.existsSync(logPath)) {
      return [];
    }

    const logContent = fs.readFileSync(logPath, 'utf-8');
    const lines = logContent.trim().split('\n').filter(line => line.length > 0);
    
    const logs = lines.slice(-limit).map(line => {
      try {
        return JSON.parse(line);
      } catch (parseError) {
        return { error: 'Failed to parse log line', line: line };
      }
    });

    return logs.reverse(); // 最新順に
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
}

// ログファイルをクリア
function clearLogs(logType = 'command') {
  const logPath = logType === 'error' ? errorLogPath : commandLogPath;
  
  try {
    if (fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, '');
      console.log(`[LOG] Cleared ${logType} logs`);
    }
  } catch (error) {
    console.error('Error clearing logs:', error);
  }
}

// 統計情報を取得
function getLogStats() {
  try {
    const logs = getRecentLogs('command', 1000);
    const stats = {
      totalCommands: logs.length,
      uniqueUsers: new Set(logs.map(log => log.userId)).size,
      commandCounts: {},
      userCounts: {},
      recentActivity: logs.slice(0, 10)
    };

    logs.forEach(log => {
      if (log.commandName) {
        stats.commandCounts[log.commandName] = (stats.commandCounts[log.commandName] || 0) + 1;
      }
      if (log.username) {
        stats.userCounts[log.username] = (stats.userCounts[log.username] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting log stats:', error);
    return null;
  }
}

module.exports = {
  logCommandUsage,
  logMessageSent,
  logError,
  getRecentLogs,
  clearLogs,
  getLogStats
};
