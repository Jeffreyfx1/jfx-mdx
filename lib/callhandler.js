// lib/callhandler.js
const settingsManager = require('./settingsmanager');

/**
 * Auto-rejects WhatsApp calls and warns users based on ANTICALL setting.
 * @param {import('@whiskeysockets/baileys').WASocket} conn
 */
module.exports = (conn) => {
    conn.ev.on('call', async (calls) => {
        if (!settingsManager.getSetting('ANTICALL')) {
            console.log("[ANTICALL] Call received but feature is OFF.");
            return;
        }

        for (const call of calls) {
            if (call.status === 'offer') {
                try {
                    const callerId = call.from;

                    // Reject the incoming call
                    await conn.rejectCall(call.id, callerId);

                    // Warn the user via message
                    await conn.sendMessage(callerId, {
                        text: `🚫 *Auto Call Rejection!*\n\nThis bot does not accept calls.\nCalling may result in you being *blocked*.`,
                    });

                    console.log(`[ANTICALL] Rejected and warned caller: ${callerId}`);
                } catch (err) {
                    console.error("[ANTICALL ERROR]", err);
                }
            }
        }
    });

    console.log("[ANTICALL] Handler initialized.");
};
