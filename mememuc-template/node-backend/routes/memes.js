/**
 * References:
 * help from Xueru Zheng, Group 070
 * https://www.bezkoder.com/node-js-upload-store-images-mongodb/
 * https://stackoverflow.com/questions/54979632/get-formdata-values-on-backend-side
 *
 * Query:
 * https://codesandbox.io/s/requests-yctc5?file=/src/index.js
 * https://www.youtube.com/watch?v=-NBNF2yURm8
 * https://www.mongodb.com/docs/manual/reference/operator/query/gt/
 *
 * */

var express = require("express");
var router = express.Router();
const path = require('path');
const fs = require("fs");
const multer = require("multer");
const ONE_DAY_MILLISECS = 1000 * 60 * 60 * 24;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/memes/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg");
    },
});

const upload = multer({storage: storage});
const memeModel = require("../models/meme");
const commentModel = require("../models/comment");

const dotenvPath = path.join(__dirname, '../.env');
console.log("🔍 [AI Agent 路径检查] .env 文件的绝对路径指向 ➔", dotenvPath);
require('dotenv').config({ path: dotenvPath });

const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
});

console.log("🤖 [AI Agent] 正在通过 Launcher 检查密钥状态:", process.env.DEEPSEEK_API_KEY ? "✅ 密钥已成功锁定！" : "❌ 未找到密钥，请检查 node-backend/.env 文件！");

router.post("/upload-meme", upload.single("file"), async (req, res) => {
    console.log(req.file);
    console.log('form data: ', req.body);

    const meme = new memeModel({
        title: req.body.title,
        url: req.body.url,
        img: `http://localhost:3002/memes/${req.file.filename}`,
        date: Date.now(),
        author: req.body.author,
        permission: req.body.permission
    });

    try {
        await meme.save();
        res.send({status: "ok"});
    } catch (error) {
        res.send({status: "error"});
    }
});

router.post("/store-meme-locally", upload.single("file"), async (req, res) => {
    console.log('local meme: ', req.file, ', ', req.body);
});

router.get("/get-memes", async function (req, res, next) {
    console.log('Get request for all memes');
    if (req.query.username) {
        const param = req.query.username;
        console.log('Param', param);

        memeModel.find({author: param.toString()})
            .then((data) => {
                console.log('Memes by param.toString(): ', data);
                res.send(data);
            })
            .catch((error) => {
                res.status(500).send(error);
            });
    } else {
        memeModel.find()
            .then((data) => {
                console.log('All memes: ', data);
                res.send(data);
            })
            .catch((error) => {
                res.status(500).send(error);
            });
    }
});

router.get("/get-public-memes", async function (req, res) {
    memeModel.find({permission: 'public'})
        .then((data) => {
            console.log('Data after sorting by default: ', data);
            res.send(data);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});

router.get("/get-public-memes-sort-by-date", async function (req, res) {
    memeModel.find({permission: 'public'}).sort({date: -1})
        .then((data) => {
            console.log('Data after sorting by date: ', data);
            res.send(data);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});

router.get("/get-public-memes-sort-by-title", async function (req, res) {
    memeModel.find({permission: 'public'}).sort({title: 1})
        .then((data) => {
            console.log('Data after sorting by title: ', data);
            res.send(data);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});

router.get("/get-public-memes-sort-by-date-in-one-day", async function (req, res) {
    memeModel.find({permission: 'public', date: { $gt: Date.now() - ONE_DAY_MILLISECS }}).sort({date: -1})
        .then((data) => {
            console.log('Data after sorting by date in a day: ', data);
            res.send(data);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});

router.post("/upload-comment", async function (req, res) {
    console.log('comment data: ', req.body);
    const comment = new commentModel({
        url: req.body.url,
        from: req.body.from,
        to: req.body.to,
        content: req.body.comment,
        date: Date.now(),
    });

    try {
        await comment.save();
        res.send({status: "ok"});
    } catch (error) {
        res.send({status: "error"});
    }
});

router.get("/get-comments-for-a-meme-sort-by-date", async function (req, res, next) {
    console.log('Get comments for a certain meme');
    if (req.query.url) {
        const param = req.query.url;
        console.log('Meme url: ', param);

        commentModel.find({url: param.toString()}).sort({date: -1})
            .then((data) => {
                console.log(`Comments by meme using url=${param}, sorting by date: ${data}`);
                res.send(data);
            })
            .catch((error) => {
                res.status(500).send(error);
            });
    }
});

router.get("/get-comments-for-a-meme", async function (req, res, next) {
    console.log('Get comments for a certain meme');
    if (req.query.url) {
        const param = req.query.url;

        commentModel.find({url: param.toString()})
            .then((data) => {
                console.log(`Comments by meme using url=${param}: ${data}`);
                res.send(data);
            })
            .catch((error) => {
                res.status(500).send(error);
            });
    }
});

router.post('/ai-agent-generate', async (req, res, next) => {
    const { templateName, currentTopText, currentMiddleText, currentBottomText } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: "deepseek-v4-pro",
            response_format: { type: "json_object" }, // 强制模型返回 JSON 字符串
            messages: [
                {
                    role: "system",
                    content: `你是一个精通网络热梗的表情包创意 Agent。请结合用户选择的表情包模板和想法，生成一组爆款热梗文字，分别填入表情包的 top（上部）、middle（中部）、bottom（下部）区域，并为此图拟定一个社交标题 title。必须严格返回 JSON：{"title": "...", "top": "...", "middle": "...", "bottom": "..."}`
                },
                {
                    role: "user",
                    content: `当前模板: "${templateName}"。现有文字：上部:"${currentTopText || ''}", 中部:"${currentMiddleText || ''}", 下部:"${currentBottomText || ''}"。请帮他升华或盲推热梗。`
                }
            ],
            temperature: 1.2,
        });

        const aiResult = JSON.parse(response.choices[0].message.content);
        res.json({
            success: true,
            memeConfig: aiResult
        });

    } catch (error) {
        console.error("OpenAI Agent 异常:", error);
        // 触发你的防御性降级逻辑：如果大模型挂了，后端主动给一套本地硬编码的搞笑段子，保证前端不报错
        res.json({
            success: true,
            memeConfig: {
                title: "代码崩溃现场",
                top: "后端接口",
                middle: "突然疯狂报错",
                bottom: "幸好 AI 触发了自动降级"
            }
        });
    }
});

module.exports = router;
