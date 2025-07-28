const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    const messageContent =
        mek.message?.conversation ||
        mek.message?.extendedTextMessage?.text ||
        'Unknown content';

    deleteInfo += `\n\n*Content:* ${messageContent}`;

    await conn.sendMessage(
        jid,
        {
            text: deleteInfo,
            contextInfo: {
                mentionedJid: isGroup
                    ? [update.key.participant, mek.key.participant]
                    : [update.key.remoteJid],
            },
        },
        { quoted: mek },
    );
};

const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
    let antideletedmek;

    // Use structuredClone if available; fallback if not
    try {
        antideletedmek = structuredClone(mek.message);
    } catch {
        antideletedmek = JSON.parse(JSON.stringify(mek.message));
    }

    const messageType = Object.keys(antideletedmek)[0];

    if (antideletedmek[messageType]) {
        antideletedmek[messageType].contextInfo = {
            stanzaId: mek.key.id,
            participant: mek.sender,
            quotedMessage: mek.message,
        };
    }

    if (['imageMessage', 'videoMessage'].includes(messageType)) {
        antideletedmek[messageType].caption = deleteInfo;
    } else if (['audioMessage', 'documentMessage'].includes(messageType)) {
        await conn.sendMessage(jid, {
            text: `*🚨 Delete Detected!*\n\n${deleteInfo}`
        }, { quoted: mek });
    }

    await conn.relayMessage(jid, antideletedmek, {});
};

const AntiDelete = async (conn, updates) => {
    for (const update of updates) {
        if (update.update.message === null) {
            const store = await loadMessage(update.key.id);
            if (!store || !store.message) continue;

            const mek = store.message;
            const isGroup = isJidGroup(store.jid);
            const antiDeleteType = isGroup ? 'gc' : 'dm';
            const antiDeleteStatus = await getAnti(antiDeleteType);
            if (!antiDeleteStatus) continue;

            const deleteTime = new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            let deleteInfo, jid;

            if (isGroup) {
                const metadata = await conn.groupMetadata(store.jid);
                const groupName = metadata?.subject || 'Unknown Group';
                const sender = mek.key.participant?.split('@')[0] || 'unknown';
                const deleter = update.key.participant?.split('@')[0] || 'unknown';

                deleteInfo = `*AntiDelete Detected*\n\n*Time:* ${deleteTime}\n*Group:* ${groupName}\n*Deleted by:* @${deleter}\n*Sender:* @${sender}`;
                jid = config.ANTI_DEL_PATH === "log" ? conn.user.id : store.jid;
            } else {
                const senderNumber = mek.key.remoteJid?.split('@')[0] || 'unknown';
                const deleterNumber = update.key.remoteJid?.split('@')[0] || 'unknown';

                deleteInfo = `*-- AntiDelete Detected --*\n\n*Time:* ${deleteTime}\n*Deleted by:* @${deleterNumber}\n*Sender:* @${senderNumber}`;
                jid = config.ANTI_DEL_PATH === "log" ? conn.user.id : update.key.remoteJid;
            }

            if (mek.message?.conversation || mek.message?.extendedTextMessage) {
                await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
            } else {
                await DeletedMedia(conn, mek, jid, deleteInfo);
            }
        }
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
};
