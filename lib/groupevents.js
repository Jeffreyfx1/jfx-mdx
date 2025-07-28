// Give Credit If Using This File ✅ 
// 🔥🔥🔥 JFX MD-X by JEPHTER TECH 🔥🔥🔥
// Official Channel: https://whatsapp.com/channel/0029VbAxkJl0lwgqAOojKI3R

const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363288304618280@newsletter',
            newsletterName: 'JFX MD-X',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `👋 Hey @${userName},\n\n` +
                    `Welcome to *${metadata.subject}*!\n` +
                    `You are member number *${groupMembersCount}* 🎉\n` +
                    `Time joined: *${timestamp}*\n\n` +
                    `📌 *Group Description:*\n${desc}\n\n` +
                    `🛡 Powered by *${config.BOT_NAME}* (JFX MD-X by JEPHTER TECH)\n` +
                    `🔗 Official Channel: https://whatsapp.com/channel/0029VbAxkJl0lwgqAOojKI3R`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = `👋 Goodbye @${userName}.\n` +
                    `You have left *${metadata.subject}*.\n` +
                    `Time: *${timestamp}*\n` +
                    `Remaining members: *${groupMembersCount}* 😭`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `⚠️ *Admin Change Alert*\n\n` +
                          `@${demoter} has demoted @${userName}.\n` +
                          `Time: *${timestamp}*\n` +
                          `👥 Group: *${metadata.subject}*`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `✅ *Admin Change Alert*\n\n` +
                          `@${promoter} has promoted @${userName} to admin.\n` +
                          `Time: *${timestamp}*\n` +
                          `👥 Group: *${metadata.subject}*`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
