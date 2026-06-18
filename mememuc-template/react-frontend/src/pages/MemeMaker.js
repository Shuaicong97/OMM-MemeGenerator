/**
 * References:
 * https://react-bootstrap.github.io/components/modal/
 * Basic skeleton:
 * https://www.youtube.com/watch?v=rtQKP1we-Dk
 * https://codesandbox.io/s/loving-pare-ifwr1?file=/src/App.js:445-842
 * Issues fixed:
 * https://stackoverflow.com/questions/43992427/how-to-display-a-image-selected-from-input-type-file-in-reactjs
 * https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas
 * https://stackoverflow.com/questions/29334416/bootstrap-modal-dialog-center-image-in-body
 * Get image data on the canvas (Tainted canvases may not be exported):
 * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
 * Download meme:
 * https://www.youtube.com/watch?v=wsGrRrWe86A
 * Random id:
 * https://www.geeksforgeeks.org/generate-random-alpha-numeric-string-in-javascript/
 * Radio button:
 * help from Xueru Zheng, Group 070
 * https://www.javascripttutorial.net/javascript-dom/javascript-radio-button/
 * Upload meme(info) to MongoDB (especially image part):
 * help from Xueru Zheng, Group 070
 * https://stackoverflow.com/questions/12168909/blob-from-dataurl
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now
 * Redirect to dynamic URLs (Single View URL):
 * https://medium.com/@s.alexis/using-react-router-useparams-to-fetch-data-dynamically-13288e24ed1
 * The idea that adding an image does not change the current image on the canvas, i.e. continuously append pictures, using an array:
 * help from Xueru Zheng, Group 070
 * Upload by provided image URL:
 * https://codepen.io/kallil-belmonte/pen/KKKRoyx
 * https://www.w3schools.com/jsref/prop_style_bordercolor.asp
 * Upload by drawing:
 * https://www.npmjs.com/package/react-canvas-draw
 * https://codesandbox.io/s/react-canvas-draw-example-forked-5vkkxo?file=/src/index.js:932-1094
 * Make texts on canvas movable (draggable, not working!):
 * http://jsfiddle.net/RWCH/Lg2xagjo/
 * Make texts on canvas movable (by buttons):
 * https://erikonarheim.com/posts/canvas-text-metrics/
 * https://stackoverflow.com/questions/4032179/how-do-i-get-the-width-and-height-of-a-html5-canvas
 * https://stackoverflow.com/questions/15700452/jquery-functionevent-event-target-id-is-blank-when-clicking-linked-text
 * Change font size and color:
 * https://uiwjs.github.io/react-color/#/chrome
 * https://www.npmjs.com/package/reactjs-popup
 * https://stackoverflow.com/questions/18092753/change-font-size-of-canvas-without-knowing-font-family
 * https://stackoverflow.com/questions/1874560/how-to-use-javascript-to-change-div-backgroundcolor
 * Icons:
 * https://react-icons.github.io/react-icons/icons?name=bs
 * Local stuff:
 * https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_input_type_checkbox
 * https://stackoverflow.com/questions/9887360/how-can-i-check-if-a-checkbox-is-checked
 * https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_style_visibility
 * */

import React, {useEffect, useRef, useState} from "react";
import "../styles/mememaker.css"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {saveAs} from 'file-saver';
import {Link} from 'react-router-dom';
import CanvasDraw from "react-canvas-draw";
import Chrome from '@uiw/react-color-chrome';
import {GithubPlacement} from '@uiw/react-color-github';
import Popup from 'reactjs-popup';
import {
    BsFillArrowDownLeftSquareFill,
    BsFillArrowDownRightSquareFill,
    BsFillArrowDownSquareFill,
    BsFillArrowLeftSquareFill,
    BsFillArrowRightSquareFill,
    BsFillArrowUpLeftSquareFill,
    BsFillArrowUpRightSquareFill,
    BsFillArrowUpSquareFill
} from "react-icons/bs";

const LINK_MEME_PREFIX = 'http://localhost:3000/m/';

const Meme = ({template, onClick}) => {
    return (
        <img
            className="row"
            src={template.url}
            alt={template.name}
            onClick={onClick}/>
    );
}

function MemeMaker() {

    const [templates, setTemplates] = useState([]);
    const [template, setTemplate] = useState(null);
    const [title, setTitle] = useState('');

    const [topText, setTopText] = useState('');
    const [topTextSize, setTopTextSize] = useState('50');
    const [middleText, setMiddleText] = useState('');
    const [middleTextSize, setMiddleTextSize] = useState('50');
    const [bottomText, setBottomText] = useState('');
    const [bottomTextSize, setBottomTextSize] = useState('50');

    const [topTextPosX, setTopTextPosX] = useState(0);
    const [topTextPosY, setTopTextPosY] = useState(0);
    const [middleTextPosX, setMiddleTextPosX] = useState(0);
    const [middleTextPosY, setMiddleTextPosY] = useState(0);
    const [bottomTextPosX, setBottomTextPosX] = useState(0);
    const [bottomTextPosY, setBottomTextPosY] = useState(0);

    const [image, setImage] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const canvasRef = useRef(null);
    const [meme, setMeme] = useState(null);
    const [showGenerate, setShowGenerate] = useState(false);
    const [done, setDone] = useState('');
    const [filename, setFilename] = useState('');
    const [caption, setCaption] = useState('');
    const [id, setId] = useState('');
    const [permission, setPermission] = useState('public');

    const [showAddImage, setShowAddImage] = useState(false);
    const [addImage, setAddImage] = useState(null);
    const [append, setAppend] = useState('undefined');
    const [added, setAdded] = useState(false);
    const [addedImages, setAddedImages] = useState([]);

    const [uploadURL, setUploadURL] = useState('');
    const [showDraw, setShowDraw] = useState(false);
    const canvasDrawRef = useRef(null);

    const texts = [];
    const [hexTop, setHexTop] = useState("#000000");
    const [hexMiddle, setHexMiddle] = useState("#000000");
    const [hexBottom, setHexBottom] = useState("#000000");
    const [first, setFirst] = useState(true);

    const [local, setLocal] = useState(false);
    const [showGenerateLocal, setShowGenerateLocal] = useState(false);
    const [doneLocal, setDoneLocal] = useState('');

    // 新增：AI Agent 相关的状态控制
    const [aiLoading, setAiLoading] = useState(false);

    const handleAIAgentHelp = async () => {
        setAiLoading(true);

        // 构造发送给 Agent 的上下文
        const payload = {
            templateName: caption || "未知模板",
            currentTopText: topText,
            currentMiddleText: middleText,
            currentBottomText: bottomText
        };

        try {
            const response = await fetch("http://localhost:3002/memes/ai-agent-generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Agent 响应异常");
            const data = await response.json();

            // 成功拿到 Agent 的结构化决策数据后，批量更新 Canvas 的 State
            if (data && data.success) {
                const { title: aiTitle, top, middle, bottom } = data.memeConfig;

                if (aiTitle) setTitle(aiTitle);
                setTopText(top || '');
                setMiddleText(middle || '');
                setBottomText(bottom || '');

                // 触发重绘标志（跟你原有的 Canvas 刷新机制对齐）
                setFirst(true);
            } else {
                alert("AI Agent 思考失败，请重试");
            }
        } catch (error) {
            console.error("Agent 交互错误:", error);
            alert("网络异常，AI 降级，请手动输入");
        } finally {
            setAiLoading(false);
        }
    };

    const handleCloseDraw = () => {
        setShowDraw(false);
        setImage(null);
    }

    const handleConfirmDraw = () => {
        const canvas = canvasDrawRef.current;
        const data = canvas.getDataURL();
        setImage(data);
        setShowDraw(false);
        setFilename('drawing');
    }

    const handleCloseUpload = () => {
        setShowUpload(false);
        setImage(null);
    };

    const handleShowUpload = () => {
        setShowUpload(true);
        setImage(null);
        setUploadURL('');
    };

    const handleShowDraw = () => {
        setShowDraw(true);
        setImage(null);
    }

    const handleUpload = () => {
        if (image != null) {
            const memeImage = new Image();
            setShowUpload(false);
            setTemplate(null);
            //setImage(image);
            memeImage.crossOrigin = "anonymous"
            memeImage.src = image.toString();
            setMeme(memeImage);
            setCaption(filename);
            setTitle('');
            setAdded(false);
            setAddedImages([]);
            setFirst(true);
        } else {
            alert('Invalid image URL!');
        }

    };

    const handleCloseGenerate = () => {
        setShowGenerate(false);
    }

    const handleShowGenerate = () => {
        const canvas = canvasRef.current;
        if (meme != null && canvas.width !== 0) {
            if (!title) {
                setTitle(caption);
            }

            setShowGenerate(true);
            const dataURL = canvas.toDataURL();
            setDone(dataURL);
        }
        uploadMeme(permission);
    }

    const handleDownload = () => {
        const doneImg = document.getElementById("done");
        let imgPath = doneImg.getAttribute('src');
        let fileName = getFileName(imgPath);
        saveAs(imgPath, fileName)
    };

    const handlePermission = (e) => {
        setPermission(e.target.value);
    }

    function uploadMeme(permission) {
        // upload meme to db
        const formData = new FormData();

        const dataURL = canvasRef.current.toDataURL();
        const date = Date.now();
        const url = LINK_MEME_PREFIX + date;
        setId(date.toString());
        if (title) {
            formData.append("title", title);
        } else {
            formData.append("title", caption);
        }

        formData.append("url", url);
        formData.append("file", convertDataToBlob(dataURL));

        const loggedUsername = localStorage.getItem("loggedUsername");
        if (loggedUsername === "") {
            formData.append("author", 'x');
        } else {
            formData.append("author", loggedUsername);
        }

        formData.append("permission", permission);

        fetch(" http://localhost:3002/memes/upload-meme", {
            method: "POST",
            body: formData,
        }).then((res) => res.json())
            .then((data) => {
                console.log(data, "uploadMeme");
            });
    }

    function convertDataToBlob(dataURL) {
        const byteString = atob(dataURL.split(",")[1]);
        const array = [];
        for (let i = 0; i < byteString.length; i++) {
            array.push(byteString.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: "image/png"});
    }

    function getFileName(str) {
        return str.substring(str.length - 20);
    }

    useEffect(() => {
        fetch("https://api.imgflip.com/get_memes").then(x =>
            x.json().then(response => {
                    setTemplates(response.data.memes);
                    handleRandom(response.data.memes);
                    setAddedImages([]);
                }
            ))
    }, []);

    const handleRandom = (memes) => {
        const index = Math.floor(Math.random() * memes.length);
        setImage(null);
        setTemplate(memes[index]);
        const memeImage = new Image();
        memeImage.crossOrigin = "anonymous"
        memeImage.src = memes[index].url.toString();
        setMeme(memeImage);
        setCaption(memes[index].name);
        setTitle('');
        setFirst(true);
    }

    function draw(canvas) {
        const myCanvas = canvasRef.current;

        // assume that at this moment there is a pic on the canvas
        if (meme.width !== 0) {
            myCanvas.width = meme.width;
            myCanvas.height = meme.height;

            const ctx = canvas.current.getContext("2d");
            ctx.fillStyle = "white";
            ctx.drawImage(meme, 0, 0, myCanvas.width, myCanvas.height);

            // store previous status of canvas
            const oldCanvas = document.createElement('canvas');
            const oldCanvasCtx = oldCanvas.getContext('2d');

            for (let i = 0; i < addedImages.length; i++) {
                const imgUrl = addedImages[i].imgUrl;
                const pos = addedImages[i].pos;

                oldCanvas.width = myCanvas.width;
                oldCanvas.height = myCanvas.height;
                oldCanvasCtx.drawImage(myCanvas, 0, 0);

                if (pos === 'left') {
                    const addedImage = alignImage(myCanvas, imgUrl, 'horizontal');
                    myCanvas.width = myCanvas.width + addedImage.width;
                    ctx.drawImage(addedImage, 0, 0, addedImage.width, addedImage.height);
                    ctx.drawImage(oldCanvas, addedImage.width, 0, oldCanvas.width, oldCanvas.height);
                } else if (pos === 'right') {
                    const addedImage = alignImage(myCanvas, imgUrl, 'horizontal');
                    myCanvas.width = myCanvas.width + addedImage.width;
                    ctx.drawImage(oldCanvas, 0, 0, oldCanvas.width, oldCanvas.height);
                    ctx.drawImage(addedImage, oldCanvas.width, 0, addedImage.width, addedImage.height);
                } else if (pos === 'above') {
                    const addedImage = alignImage(myCanvas, imgUrl, 'vertical');
                    myCanvas.height = myCanvas.height + addedImage.height;
                    ctx.drawImage(addedImage, 0, 0, addedImage.width, addedImage.height);
                    ctx.drawImage(oldCanvas, 0, addedImage.height, oldCanvas.width, oldCanvas.height);
                } else if (pos === 'below') {
                    const addedImage = alignImage(myCanvas, imgUrl, 'vertical');
                    myCanvas.height = myCanvas.height + addedImage.height;
                    ctx.drawImage(oldCanvas, 0, 0, oldCanvas.width, oldCanvas.height);
                    ctx.drawImage(addedImage, 0, oldCanvas.height, addedImage.width, addedImage.height);
                }
            }

            ctx.font = "50px Comic Sans MS";
            ctx.fillStyle = "green";
            ctx.textAlign = "center";

            if (first) {
                texts.push({text: topText, x: myCanvas.width / 2, y: 100});
                texts.push({text: middleText, x: myCanvas.width / 2, y: myCanvas.height / 2});
                texts.push({text: bottomText, x: myCanvas.width / 2, y: myCanvas.height - 100});
                setFirst(false);
                setTopTextPosX(myCanvas.width / 2);
                setTopTextPosY(100);
                setMiddleTextPosX(myCanvas.width / 2);
                setMiddleTextPosY(myCanvas.height / 2);
                setBottomTextPosX(myCanvas.width / 2);
                setBottomTextPosY(myCanvas.height - 100);
            } else {
                texts.push({text: topText, x: topTextPosX, y: topTextPosY});
                texts.push({text: middleText, x: middleTextPosX, y: middleTextPosY});
                texts.push({text: bottomText, x: bottomTextPosX, y: bottomTextPosY});
            }

            // style width in canvas
            const styleCanvasWidth = myCanvas.getBoundingClientRect().width;
            const styleCanvasHeight = myCanvas.getBoundingClientRect().height;

            for (let i = 0; i < texts.length; i++) {
                const text = texts[i];
                const match = /(?<value>\d+\.?\d*)/;

                if (i === 0) {
                    ctx.font = ctx.font.replace(match, topTextSize);
                    ctx.fillStyle = hexTop;
                }
                if (i === 1) {
                    ctx.font = ctx.font.replace(match, middleTextSize);
                    ctx.fillStyle = hexMiddle;
                }
                if (i === 2) {
                    ctx.font = ctx.font.replace(match, bottomTextSize);
                    ctx.fillStyle = hexBottom;
                }

                text.width = ctx.measureText(text.text).width;
                const metrics = ctx.measureText(text.text);
                text.height = Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);

                ctx.fillText(text.text, text.x, text.y, myCanvas.width);
                ctx.fill();

                text.styleTextWidth = text.width / myCanvas.width * styleCanvasWidth;
                text.styleTextHeight = text.height / myCanvas.height * styleCanvasHeight;
                text.canvasWidth = myCanvas.width;
                text.canvasHeight = myCanvas.height;
            }

        } else {
            myCanvas.width = 0;
            myCanvas.height = 0;
        }
    }

    const alignImage = (myCanvas, imgUrl, pos) => {
        const addedImage = new Image();
        addedImage.src = imgUrl.toString();
        let ratio = 1;
        if (pos === 'horizontal')
            ratio = myCanvas.height / addedImage.height;
        if (pos === 'vertical')
            ratio = myCanvas.width / addedImage.width;

        addedImage.height = addedImage.height * ratio;
        addedImage.width = addedImage.width * ratio;

        return addedImage;
    }

    const resizeImage = (x) => {
        let width = x.width;
        let height = x.height;
        console.log(`before resized image width: ${x.width}, height: ${x.height}`);

        if (width > 200 || height > 200) {
            const ratio = Math.min(200 / width, 200 / height);
            x.width = x.width * ratio;
            x.height = x.height * ratio;
        }
        console.log(`resized image width: ${x.width}, height: ${x.height}`);
    }

    const onImageChangeByFile = e => {
        if (e.target.files && e.target.files[0]) {
            setImage(URL.createObjectURL(e.target.files[0]));
        }
        const fileName = e.target.files[0].name;
        const targetName = fileName.substring(0, fileName.indexOf('.'));

        setFilename(targetName);
    };

    const onImageChangeByURL = e => {
        const url = e.target.value;
        setUploadURL(url);

        checkIfImageExists(url, (exists) => {
            if (exists) {
                setImage(url);
                setFilename(url.substring(url.toString().length - 5));
            } else {
                document.getElementById('image-url').style.borderColor = 'red';
                setImage(null);
            }
        });
    }

    function clear() {
        const myCanvas = canvasRef.current;

        setTopText('');
        setTopTextSize('50');
        setTopTextPosX(myCanvas.width / 2);
        setTopTextPosY(100);
        setHexTop("#000000");
        document.getElementById('top-text-color').style.backgroundColor = "#000000";

        setMiddleText('');
        setMiddleTextSize('50');
        setMiddleTextPosX(myCanvas.width / 2);
        setMiddleTextPosY(myCanvas.height / 2);
        setHexMiddle("#000000");
        document.getElementById('middle-text-color').style.backgroundColor = "#000000";

        setBottomText('');
        setBottomTextSize('50');
        setBottomTextPosX(myCanvas.width / 2);
        setBottomTextPosY(myCanvas.height - 100);
        setHexBottom("#000000");
        document.getElementById('bottom-text-color').style.backgroundColor = "#000000";
    }

    function handleLink() {
        localStorage.setItem("memeFrom", "MemeMaker");
        localStorage.setItem("sort", 'default');
        if (permission === 'unlisted') {
            localStorage.setItem("isPublic", "false");
        }
        if (permission === 'public') {
            localStorage.setItem("isPublic", "true");
        }
    }

    const handleAddImage = () => {
        setShowAddImage(true);
        setAppend('undefined');
        setAddImage(null);
        setAdded(false);
    }

    const handleCloseAddImage = () => {
        setShowAddImage(false);
        setAddImage(null);
        setAdded(false);
    }

    const onAddImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAddImage(URL.createObjectURL(e.target.files[0]));
        }
    }

    const handleAddedImageUpload = () => {
        setShowAddImage(false);
        setTemplate(null);
        setImage(null);
        setAdded(true);
        appendImage(addImage, append);
    }

    const handleAppend = (e) => {
        setAppend(e.target.value);
    }

    const appendImage = (imgUrl, pos) => {
        addedImages.push({
            imgUrl: imgUrl,
            pos: pos
        });
    }

    function checkIfImageExists(url, callback) {
        const img = new Image();
        img.src = url;

        if (img.complete) {
            callback(true);
        } else {
            img.onload = () => {
                callback(true);
            };

            img.onerror = () => {
                callback(false);
            };
        }
    }

    function handleTopTextSizeChange(e) {
        if (e.target.value > 100) {
            setTopTextSize("100");
        } else if (e.target.value < 1) {
            setTopTextSize("1");
        } else {
            setTopTextSize(e.target.value)
        }
    }

    function handleMiddleTextSizeChange(e) {
        if (e.target.value > 100) {
            setMiddleTextSize("100");
        } else if (e.target.value < 1) {
            setMiddleTextSize("1");
        } else {
            setMiddleTextSize(e.target.value)
        }
    }

    function handleBottomTextSizeChange(e) {
        if (e.target.value > 100) {
            setBottomTextSize("100");
        } else if (e.target.value < 1) {
            setBottomTextSize("1");
        } else {
            setBottomTextSize(e.target.value)
        }
    }

    const handleTopTextColorChange = (color) => {
        const topTextColorDiv = document.getElementById('top-text-color');
        setHexTop(color.hexa);
        topTextColorDiv.style.backgroundColor = color.hexa;
    }

    const handleMiddleTextColorChange = (color) => {
        const middleTextColorDiv = document.getElementById('middle-text-color');
        setHexMiddle(color.hexa);
        middleTextColorDiv.style.backgroundColor = color.hexa;
    }

    const handleBottomTextColorChange = (color) => {
        const bottomTextColorDiv = document.getElementById('bottom-text-color');
        setHexBottom(color.hexa);
        bottomTextColorDiv.style.backgroundColor = color.hexa;
    }

    const handleTextUp = (e) => {
        if (e.currentTarget.id === 'top-text-up' && topTextPosY > texts[0].styleTextHeight) {
            setTopTextPosY(texts[0].y -= 5);
        }
        if (e.currentTarget.id === 'middle-text-up' && middleTextPosY > texts[1].styleTextHeight) {
            setMiddleTextPosY(texts[1].y -= 5);
        }
        if (e.currentTarget.id === 'bottom-text-up' && bottomTextPosY > texts[2].styleTextHeight) {
            setBottomTextPosY(texts[2].y -= 5);
        }
    }

    const handleTextDown = (e) => {
        if (e.currentTarget.id === 'top-text-down' && topTextPosY < texts[0].canvasHeight) {
            setTopTextPosY(texts[0].y += 5);
        }
        if (e.currentTarget.id === 'middle-text-down' && middleTextPosY < texts[1].canvasHeight) {
            setMiddleTextPosY(texts[1].y += 5);
        }
        if (e.currentTarget.id === 'bottom-text-down' && bottomTextPosY < texts[2].canvasHeight) {
            setBottomTextPosY(texts[2].y += 5);
        }
    }

    const handleTextLeft = (e) => {
        if (e.currentTarget.id === 'top-text-left' && topTextPosX > texts[0].styleTextWidth) {
            setTopTextPosX(texts[0].x -= 5);
        }
        if (e.currentTarget.id === 'middle-text-left' && middleTextPosX > texts[1].styleTextWidth) {
            setMiddleTextPosX(texts[1].x -= 5);
        }
        if (e.currentTarget.id === 'bottom-text-left' && bottomTextPosX > texts[2].styleTextWidth) {
            setBottomTextPosX(texts[2].x -= 5);
        }
    }

    const handleTextRight = (e) => {
        if (e.currentTarget.id === 'top-text-right' && topTextPosX < texts[0].canvasWidth - texts[0].styleTextWidth) {
            setTopTextPosX(texts[0].x += 5);
        }
        if (e.currentTarget.id === 'middle-text-right' && middleTextPosX < texts[1].canvasWidth - texts[1].styleTextWidth) {
            setMiddleTextPosX(texts[1].x += 5);
        }
        if (e.currentTarget.id === 'bottom-text-right' && bottomTextPosX < texts[2].canvasWidth - texts[2].styleTextWidth) {
            setBottomTextPosX(texts[2].x += 5);
        }
    }

    const handleTextUpLeft = (e) => {
        if (e.currentTarget.id === 'top-text-up-left' &&
            topTextPosY > texts[0].styleTextHeight && topTextPosX > texts[0].styleTextWidth) {
            setTopTextPosY(texts[0].y -= 5);
            setTopTextPosX(texts[0].x -= 5);
        }
        if (e.currentTarget.id === 'middle-text-up-left' &&
            middleTextPosY > texts[1].styleTextHeight && middleTextPosX > texts[1].styleTextWidth) {
            setMiddleTextPosY(texts[1].y -= 5);
            setMiddleTextPosX(texts[1].x -= 5);
        }
        if (e.currentTarget.id === 'bottom-text-up-left' &&
            bottomTextPosY > texts[2].styleTextHeight && bottomTextPosX > texts[2].styleTextWidth) {
            setBottomTextPosY(texts[2].y -= 5);
            setBottomTextPosX(texts[2].x -= 5);
        }
    }

    const handleTextUpRight = (e) => {
        if (e.currentTarget.id === 'top-text-up-right' &&
            topTextPosY > texts[0].styleTextHeight && topTextPosX < texts[0].canvasWidth - texts[0].styleTextWidth) {
            setTopTextPosY(texts[0].y -= 5);
            setTopTextPosX(texts[0].x += 5);
        }
        if (e.currentTarget.id === 'middle-text-up-right' &&
            middleTextPosY > texts[1].styleTextHeight && middleTextPosX < texts[1].canvasWidth - texts[1].styleTextWidth) {
            setMiddleTextPosY(texts[1].y -= 5);
            setMiddleTextPosX(texts[1].x += 5);
        }
        if (e.currentTarget.id === 'bottom-text-up-right' &&
            bottomTextPosY > texts[2].styleTextHeight && bottomTextPosX < texts[2].canvasWidth - texts[2].styleTextWidth) {
            setBottomTextPosY(texts[2].y -= 5);
            setBottomTextPosX(texts[2].x += 5);
        }
    }

    const handleTextDownLeft = (e) => {
        if (e.currentTarget.id === 'top-text-down-left' &&
            topTextPosY < texts[0].canvasHeight && topTextPosX > texts[0].styleTextWidth) {
            setTopTextPosY(texts[0].y += 5);
            setTopTextPosX(texts[0].x -= 5);
        }
        if (e.currentTarget.id === 'middle-text-down-left' &&
            middleTextPosY < texts[1].canvasHeight && middleTextPosX > texts[1].styleTextWidth) {
            setMiddleTextPosY(texts[1].y += 5);
            setMiddleTextPosX(texts[1].x -= 5);
        }
        if (e.currentTarget.id === 'bottom-text-down-left' &&
            bottomTextPosY < texts[2].canvasHeight && bottomTextPosX > texts[2].styleTextWidth) {
            setBottomTextPosY(texts[2].y += 5);
            setBottomTextPosX(texts[2].x -= 5);
        }
    }

    const handleTextDownRight = (e) => {
        if (e.currentTarget.id === 'top-text-down-right' &&
            topTextPosY < texts[0].canvasHeight && topTextPosX < texts[0].canvasWidth - texts[0].styleTextWidth) {
            setTopTextPosY(texts[0].y += 5);
            setTopTextPosX(texts[0].x += 5);
        }
        if (e.currentTarget.id === 'middle-text-down-right' &&
            middleTextPosY < texts[1].canvasHeight && middleTextPosX < texts[1].canvasWidth - texts[1].styleTextWidth) {
            setMiddleTextPosY(texts[1].y += 5);
            setMiddleTextPosX(texts[1].x += 5);
        }
        if (e.currentTarget.id === 'bottom-text-down-right' &&
            bottomTextPosY < texts[2].canvasHeight && bottomTextPosX < texts[2].canvasWidth - texts[2].styleTextWidth) {
            setBottomTextPosY(texts[2].y += 5);
            setBottomTextPosX(texts[2].x += 5);
        }
    }

    const handleLocalCheck = () => {
        if (document.getElementById("local").checked) {
            setLocal(true);
        } else {
            setLocal(false);
        }
    }

    const handleShowGenerateLocal = () => {
        const canvas = canvasRef.current;
        if (meme != null && canvas.width !== 0) {
            if (!title) {
                setTitle(caption);
            }

            setShowGenerateLocal(true);
            const dataURL = canvas.toDataURL();
            setDoneLocal(dataURL);
        }
        storeMemeLocally();
    }

    const storeMemeLocally = () => {
        // store meme locally, not to db
        const formData = new FormData();
        const dataURL = canvasRef.current.toDataURL();
        formData.append("file", convertDataToBlob(dataURL));

        fetch(" http://localhost:3002/memes/store-meme-locally", {
            method: "POST",
            body: formData,
        }).then((res) => res.json())
            .then((data) => {
                console.log(data, " ,storeMemeLocally");
            });
    }

    const handleCloseGenerateLocal = () => {
        setShowGenerateLocal(false);
    }

    const handleDownloadLocal = () => {
        const doneImg = document.getElementById("done-local");
        let imgPath = doneImg.getAttribute('src');
        let fileName = getFileName(imgPath);
        saveAs(imgPath, fileName)
    }

    return (
        <div>
            <div className="template-area">
                {templates.map(template => {
                    return (<Meme key={template.id}
                                  template={template}
                                  onClick={() => {
                                      setImage(null);
                                      setTemplate(template);
                                      const memeImage = new Image();
                                      memeImage.crossOrigin = "anonymous"
                                      memeImage.src = template.url.toString();
                                      setMeme(memeImage);
                                      setCaption(template.name);
                                      setFirst(true);
                                      setTitle('');
                                      setAdded(false);
                                      setAddedImages([]);
                                  }}
                    />)
                })}
            </div>
            <div>
                <form onSubmit={async e => {
                    // Blocking page bounces
                    e.preventDefault();
                }}
                >
                    <Button variant="primary" onClick={handleShowUpload}>
                        Upload a new template
                    </Button>
                    <br/>
                    * After choosing/uploading a template, it won't show immediately. You should add text or click
                    again to see it on canvas.<br/>
                    * After adding (too many) images, the canvas content is sometimes displayed incorrectly. Try to
                    modify the texts or click move buttons.

                    <div className="parent-div">
                        <div className="left-div">
                            <div className="options">
                                <Button type="submit" onClick={handleAddImage}>Add image</Button>
                            </div>
                            <canvas id="meme-canvas" className="meme-canvas" ref={canvasRef} width="0" height="0">
                                {meme && draw(canvasRef)}
                            </canvas>
                            <p>{caption}</p>
                            <br/>
                        </div>
                        <div className="right-div">
                            {/* 新增：AI 一键整活按钮 */}
                            <div className="ai-agent-panel" style={{ marginBottom: '15px', padding: '10px', background: '#f0f4f8', borderRadius: '8px' }}>
                                <Button
                                    variant="success"
                                    onClick={handleAIAgentHelp}
                                    disabled={aiLoading}
                                    style={{ width: '100%', fontWeight: 'bold' }}
                                >
                                    {aiLoading ? '✨ AI Agent 正在脑暴热梗...' : '🚀 AI Agent 一键智能带梗'}
                                </Button>
                                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                    提示：选择好模板后，输入任何碎碎念，点击上方按钮让 AI 自动为你匹配最优配文和标题。
                                </small>
                            </div>
                            Name a title
                            <input
                                type="text"
                                placeholder={'name it'}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                            <div className="text-area">
                                <input
                                    placeholder="top text"
                                    value={topText}
                                    onChange={e => setTopText(e.target.value)}
                                />
                                <Popup trigger={<div id="top-text-color" className="color-picker"/>}
                                       position="bottom center">
                                    <div><Chrome
                                        color={hexTop}
                                        style={{float: 'left'}}
                                        placement={GithubPlacement.Right}
                                        onChange={handleTopTextColorChange}
                                    /></div>
                                </Popup>
                            </div>
                            Max font size (px)
                            <input
                                type="number"
                                style={{'width': '50px'}}
                                placeholder="50"
                                value={topTextSize}
                                onChange={handleTopTextSizeChange}
                            />
                            <br/>
                            Click to move text
                            <BsFillArrowUpSquareFill id="top-text-up" className="move-arrow" onClick={handleTextUp}/>
                            <BsFillArrowDownSquareFill id="top-text-down" className="move-arrow"
                                                       onClick={handleTextDown}/>
                            <BsFillArrowLeftSquareFill id="top-text-left" className="move-arrow"
                                                       onClick={handleTextLeft}/>
                            <BsFillArrowRightSquareFill id="top-text-right" className="move-arrow"
                                                        onClick={handleTextRight}/>
                            <BsFillArrowUpLeftSquareFill id="top-text-up-left" className="move-arrow"
                                                         onClick={handleTextUpLeft}/>
                            <BsFillArrowUpRightSquareFill id="top-text-up-right" className="move-arrow"
                                                          onClick={handleTextUpRight}/>
                            <BsFillArrowDownLeftSquareFill id="top-text-down-left" className="move-arrow"
                                                           onClick={handleTextDownLeft}/>
                            <BsFillArrowDownRightSquareFill id="top-text-down-right" className="move-arrow"
                                                            onClick={handleTextDownRight}/>

                            <div className="text-area">
                                <input
                                    placeholder="middle text"
                                    value={middleText}
                                    onChange={e => setMiddleText(e.target.value)}
                                />
                                <Popup trigger={<div id="middle-text-color" className="color-picker"/>}
                                       position="bottom center">
                                    <div><Chrome
                                        color={hexMiddle}
                                        style={{float: 'left'}}
                                        placement={GithubPlacement.Right}
                                        onChange={handleMiddleTextColorChange}
                                    /></div>
                                </Popup>
                            </div>
                            Max font size (px)
                            <input
                                type="number"
                                style={{'width': '50px'}}
                                placeholder="50"
                                value={middleTextSize}
                                onChange={handleMiddleTextSizeChange}
                            />
                            <br/>
                            Click to move text
                            <BsFillArrowUpSquareFill id="middle-text-up" className="move-arrow" onClick={handleTextUp}/>
                            <BsFillArrowDownSquareFill id="middle-text-down" className="move-arrow"
                                                       onClick={handleTextDown}/>
                            <BsFillArrowLeftSquareFill id="middle-text-left" className="move-arrow"
                                                       onClick={handleTextLeft}/>
                            <BsFillArrowRightSquareFill id="middle-text-right" className="move-arrow"
                                                        onClick={handleTextRight}/>
                            <BsFillArrowUpLeftSquareFill id="middle-text-up-left" className="move-arrow"
                                                         onClick={handleTextUpLeft}/>
                            <BsFillArrowUpRightSquareFill id="middle-text-up-right" className="move-arrow"
                                                          onClick={handleTextUpRight}/>
                            <BsFillArrowDownLeftSquareFill id="middle-text-down-left" className="move-arrow"
                                                           onClick={handleTextDownLeft}/>
                            <BsFillArrowDownRightSquareFill id="middle-text-down-right" className="move-arrow"
                                                            onClick={handleTextDownRight}/>

                            <div className="text-area">
                                <input
                                    placeholder="bottom text"
                                    value={bottomText}
                                    onChange={e => setBottomText(e.target.value)}
                                />
                                <Popup trigger={<div id="bottom-text-color" className="color-picker"/>}
                                       position="bottom center">
                                    <div><Chrome
                                        color={hexBottom}
                                        style={{float: 'left'}}
                                        placement={GithubPlacement.Right}
                                        onChange={handleBottomTextColorChange}
                                    /></div>
                                </Popup>

                            </div>
                            Max font size (px)
                            <input
                                type="number"
                                style={{'width': '50px'}}
                                placeholder="50"
                                value={bottomTextSize}
                                onChange={handleBottomTextSizeChange}
                            />
                            <br/>
                            Click to move text
                            <BsFillArrowUpSquareFill id="bottom-text-up" className="move-arrow" onClick={handleTextUp}/>
                            <BsFillArrowDownSquareFill id="bottom-text-down" className="move-arrow"
                                                       onClick={handleTextDown}/>
                            <BsFillArrowLeftSquareFill id="bottom-text-left" className="move-arrow"
                                                       onClick={handleTextLeft}/>
                            <BsFillArrowRightSquareFill id="bottom-text-right" className="move-arrow"
                                                        onClick={handleTextRight}/>
                            <BsFillArrowUpLeftSquareFill id="bottom-text-up-left" className="move-arrow"
                                                         onClick={handleTextUpLeft}/>
                            <BsFillArrowUpRightSquareFill id="bottom-text-up-right" className="move-arrow"
                                                          onClick={handleTextUpRight}/>
                            <BsFillArrowDownLeftSquareFill id="bottom-text-down-left" className="move-arrow"
                                                           onClick={handleTextDownLeft}/>
                            <BsFillArrowDownRightSquareFill id="bottom-text-down-right" className="move-arrow"
                                                            onClick={handleTextDownRight}/>
                            <br/>
                            <Button onClick={clear}>Clear</Button>
                            <br/>

                            Make meme locally stored
                            <input type="checkbox" id="local" name="local" value="local"
                                   onChange={handleLocalCheck}/>
                            {local === true &&
                                <div>
                                    <Button id="generate-local" type="submit" onClick={handleShowGenerateLocal}>Generate
                                        meme</Button> </div>}

                            {local === false &&
                                <div>
                                    <div id="permission-setting">
                                        Set meme's permission
                                        <div>
                                            <input type="radio" name="privacy" value="public" id="public"
                                                   checked={permission === "public"} onChange={handlePermission}/>
                                            <label htmlFor="public">Public <span style={{'fontSize': '12px'}}>(Provide single view link, show on Overview)</span></label>
                                        </div>
                                        <div>
                                            <input type="radio" name="privacy" value="unlisted" id="unlisted"
                                                   checked={permission === "unlisted"} onChange={handlePermission}/>
                                            <label htmlFor="unlisted">Unlisted <span style={{'fontSize': '12px'}}>(Provide single view link, doesn't show on Overview)</span></label>
                                        </div>
                                        <div>
                                            <input type="radio" name="privacy" value="private" id="private"
                                                   checked={permission === "private"} onChange={handlePermission}/>
                                            <label htmlFor="private">Private <span style={{'fontSize': '12px'}}>(Only for download, and visible to the creator after login)</span></label>
                                        </div>
                                    </div>
                                    <Button id="generate" type="submit" onClick={handleShowGenerate}>Generate
                                        meme</Button>
                                </div>
                            }
                        </div>
                    </div>
                </form>

            </div>

            <Modal show={showUpload} onHide={handleCloseUpload}>
                <Modal.Header closeButton>
                    <Modal.Title>Choose a way to upload</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="file" onChange={onImageChangeByFile}/>
                    <p className="center-p">OR</p>
                    <input
                        id="image-url"
                        type="text" className="upload-url"
                        placeholder="Paste an image URL"
                        value={uploadURL}
                        onChange={onImageChangeByURL}/>
                    <p className="center-p">OR</p>
                    <Button onClick={handleShowDraw}>Click to draw a template</Button>
                    <div>
                        {image && <img id="thumbnail" className="thumbnail" src={image} alt={"image"}/>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleUpload}>
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDraw} onHide={handleCloseDraw}>
                <Modal.Header closeButton>
                    <Modal.Title>Draw a template</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CanvasDraw
                        ref={canvasDrawRef}
                        id="canvas-draw"
                        className="draw-canvas"
                        brushColor={"black"}
                        brushRadius={3}
                        gridColor={"rgba(0,0,0,0.5)"}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleConfirmDraw}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showGenerate} onHide={handleCloseGenerate}>
                <Modal.Header closeButton>
                    <Modal.Title>Result</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{title}</p>
                    <img id="done" className="done" alt={"result-meme"} src={done}/>
                    {(permission === "public" || permission === "unlisted") &&
                        <p style={{'marginTop': '4px'}}>Meme Link: <Link to={`/m/${id}`}
                                                                         onClick={handleLink()}>{LINK_MEME_PREFIX}{id}</Link>
                        </p>}
                    {permission === "private" && <p style={{'marginTop': '4px'}}>Now you can only download it!</p>}

                </Modal.Body>
                <Modal.Footer>
                    {permission === "public" &&
                        <Button variant="primary" href="/">
                            To Overview
                        </Button>}
                    <Button variant="primary" onClick={handleDownload}>
                        Download
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAddImage} onHide={handleCloseAddImage}>
                <Modal.Header closeButton>
                    <Modal.Title>Choose a way to append an image</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <input type="radio" name="append" value="left" id="left"
                               checked={append === "left"} onChange={handleAppend}/>
                        <label htmlFor="left">Left</label>
                    </div>
                    <div>
                        <input type="radio" name="append" value="right" id="right"
                               checked={append === "right"} onChange={handleAppend}/>
                        <label htmlFor="right">Right</label>
                    </div>
                    <div>
                        <input type="radio" name="append" value="above" id="above"
                               checked={append === "above"} onChange={handleAppend}/>
                        <label htmlFor="above">Above</label>
                    </div>
                    <div>
                        <input type="radio" name="append" value="below" id="below"
                               checked={append === "below"} onChange={handleAppend}/>
                        <label htmlFor="below">Below</label>
                    </div>
                    <input type="file" onChange={onAddImageChange}/>
                    <div>
                        {addImage && <img id="thumbnail" className="thumbnail" src={addImage} alt={"image"}/>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleAddedImageUpload}>
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showGenerateLocal} onHide={handleCloseGenerateLocal}>
                <Modal.Header closeButton>
                    <Modal.Title>Result</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{title}</p>
                    <img id="done-local" className="done" alt={"result-meme-local"} src={doneLocal}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleDownloadLocal}>
                        Download
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="bottom-space"/>
        </div>
    )
}

export default MemeMaker;