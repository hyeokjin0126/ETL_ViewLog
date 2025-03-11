const express = require('express');
const AWS = require('aws-sdk');
require('dotenv').config();


// 
const router = express.Router();
router.get('/', async (req, res) => { res.sendFile("watch.html", { root: "views/" }) })


// AWS S3 SDK
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

router.post('/', async (req, res) => {
    const { v } = req.query;
    try {
        // S3 /videos/ 경로에 있는 .mp4 가져오기기
        const videos = (await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: 'videos/' }).promise()).Contents
            .filter(item => item.Key.endsWith('.mp4'))
            .map(item => ({
                title: item.Key.split('/').pop().replace('.mp4', ''),
                ETag: item.ETag.replace(/"/g, ''),
                url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
            }));
        // v가 Etag인 .mp4 찾기
        const video = videos.find(vid => vid.ETag === v);
        if (!video) return res.redirect("/");
        //
        res.json({title: video.title, url: video.url});

    } catch (error) {
        console.log("/routes/watch.js", error)
        res.status(500).send("Error fetching videos");
    }
});


// AWS Kiness SDK
const kinesis = new AWS.Kinesis({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

router.post('/track', async (req, res) => {
    try {
        const { video_id, video_name, video_time, watched_time, status } = req.body;
        if (!video_id || !video_name || !video_time || !watched_time || !status) { return res.status(400).json({ error: "Missing data" }); }
        // 
        const PartitionKey = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`
        const payload = {
            id: PartitionKey,
            user_account: "12345",
            view_date: new Date().toISOString().replace('Z', ''),
            video_id, video_name, video_time, watched_time, status
        };
        // Kinesis
        await kinesis.putRecord({
                StreamName: process.env.KINESIS_STREAM,
                PartitionKey,
                Data: Buffer.from(JSON.stringify(payload)),
            }).promise();
        // 
        console.log(payload)
    } 
    catch (error) {
        console.log("/routes/watch.js", error)
    }
});


module.exports = router;