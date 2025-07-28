const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Convert a video/GIF buffer to WebP (WhatsApp sticker format).
 * @param {Buffer} videoBuffer - Input video or GIF buffer.
 * @returns {Promise<Buffer>} - WebP sticker buffer.
 */
async function videoToWebp(videoBuffer) {
    const inputName = Crypto.randomBytes(6).toString('hex');
    const inputPath = path.join(tmpdir(), `${inputName}.mp4`);
    const outputPath = path.join(tmpdir(), `${inputName}.webp`);

    try {
        fs.writeFileSync(inputPath, videoBuffer);

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .on('error', reject)
                .on('end', resolve)
                .addOutputOptions([
                    '-vcodec', 'libwebp',
                    '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
                    '-loop', '0',
                    '-ss', '00:00:00',
                    '-t', '00:00:05',
                    '-preset', 'default',
                    '-an',
                    '-vsync', '0'
                ])
                .toFormat('webp')
                .save(outputPath);
        });

        return fs.readFileSync(outputPath);

    } catch (err) {
        console.error('[videoToWebp ERROR]', err);
        throw new Error('Failed to convert video to WebP');

    } finally {
        // Clean up files even if an error occurs
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
}

module.exports = { videoToWebp };
