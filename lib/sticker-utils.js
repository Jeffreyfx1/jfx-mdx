const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Fetch an image as a buffer from a URL.
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
async function fetchImage(url) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return res.data;
    } catch (err) {
        console.error('[ERROR] Fetching image:', err.message);
        throw new Error('Failed to fetch image.');
    }
}

/**
 * Fetch a GIF as a buffer from a URL.
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
async function fetchGif(url) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return res.data;
    } catch (err) {
        console.error('[ERROR] Fetching GIF:', err.message);
        throw new Error('Failed to fetch GIF.');
    }
}

/**
 * Convert a GIF buffer to WebP (sticker format).
 * @param {Buffer} gifBuffer
 * @returns {Promise<Buffer>}
 */
async function gifToSticker(gifBuffer) {
    const inputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + '.gif');
    const outputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + '.webp');

    fs.writeFileSync(inputPath, gifBuffer);

    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .on('error', reject)
            .on('end', resolve)
            .addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
                '-loop', '0',
                '-preset', 'default',
                '-an',
                '-vsync', '0'
            ])
            .toFormat('webp')
            .save(outputPath);
    });

    const webpBuffer = fs.readFileSync(outputPath);
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return webpBuffer;
}

module.exports = { fetchImage, fetchGif, gifToSticker };
