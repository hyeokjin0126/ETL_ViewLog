const express = require('express');
const AWS = require('aws-sdk');
require('dotenv').config();


// 
const router = express.Router();
router.get('/', async (req, res) => { res.sendFile("index.html", { root: "views/" }) })


// AWS S3 SDK
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

router.get('/api/videos', async (req, res) => {
    try {
        const videos = (await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: 'videos/' }).promise()).Contents
            .filter(item => item.Key.endsWith('.mp4'))
            .map(item => ({
                title: item.Key.split('/').pop().replace('.mp4', ''),
                ETag: item.ETag.replace(/"/g, ''),
                url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
                tumb: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/tumbs/${item.ETag.replace(/"/g, '')}.png`,
            }));
        // 
        res.json(videos);
    } 
    catch (error) {
        console.log("/routes/index.js", error)
        res.status(500).json({ error: 'Failed to fetch video data' });
    }
});


module.exports = router;