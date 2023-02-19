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
 * Make texts on canvas movable (draggable):
 * http://jsfiddle.net/RWCH/Lg2xagjo/
 * https://erikonarheim.com/posts/canvas-text-metrics/
 * https://stackoverflow.com/questions/4032179/how-do-i-get-the-width-and-height-of-a-html5-canvas
 * https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
 * */

import React, {useEffect, useRef, useState} from "react";
import "../styles/mememaker.css"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {saveAs} from 'file-saver';
import {Link} from 'react-router-dom';
import CanvasDraw from "react-canvas-draw";

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
    const [bottomText, setBottomText] = useState('');
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
    let currentTextIndex = null;

    let startX, startY;
    let selectedText = -1;

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
    }

    function draw(canvas) {
        const myCanvas = canvasRef.current;

        // assume that at this moment there is a pic on the canvas
        if (meme.width !== 0) {
            myCanvas.width = meme.width;
            myCanvas.height = meme.height;

            const ctx = canvas.current.getContext("2d");
            ctx.fillStyle = "white";
            //ctx.clearRect(0, 0, canvas.width, canvas.height);

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

            ctx.font = "60px Comic Sans MS";
            ctx.fillStyle = "green";
            ctx.textAlign = "center";

            texts.push({text: topText, x: (myCanvas.width / 2), y: 100});
            texts.push({text: bottomText, x: (myCanvas.width / 2), y: myCanvas.height - 100});

            // style width in canvas
            const styleCanvasWidth = myCanvas.getBoundingClientRect().width;
            const styleCanvasHeight = myCanvas.getBoundingClientRect().height;

            for (let i = 0; i < texts.length; i++) {
                const text = texts[i];
                text.width = ctx.measureText(text.text).width;
                const metrics = ctx.measureText(text.text);
                text.height = Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);

                ctx.fillText(text.text, text.x, text.y, myCanvas.width);
                ctx.fill();

                const styleTextWidth = text.width / myCanvas.width * styleCanvasWidth;
                const startX = (styleCanvasWidth - styleTextWidth) / 2;
                text.styleTextWidth = styleTextWidth;
                text.startX = startX;

                const styleTextHeight = text.height / myCanvas.height * styleCanvasHeight;
                const styleTopHeight = text.y / myCanvas.height * styleCanvasHeight;
                const startY = styleTopHeight - styleTextHeight;
                text.styleTextHeight = styleTextHeight;
                text.startY = startY;

            }

            // myCanvas.onmousedown = handleMouseDown;
            // myCanvas.onmousemove = handleMouseMove;
            // myCanvas.onmouseup = handleMouseUp;
            // myCanvas.onmouseout = handleMouseOut;

        } else {
            myCanvas.width = 0;
            myCanvas.height = 0;
        }
    }

    function textHitTest(x, y, textIndex) {
        const text = texts[textIndex];
        return (x >= text.startX && x <= text.startX + text.styleTextWidth && y >= text.startY && y <= text.startY + text.styleTextHeight);
    }

    function handleMouseDown(e) {
        e.preventDefault();
        console.log(e);
        startX = parseInt(e.offsetX);
        startY = parseInt(e.offsetY);
        for (let i = 0; i < texts.length; i++) {
            if (textHitTest(startX, startY, i)) {
                selectedText = i;
            }
        }
    }

    function handleMouseUp(e) {
        e.preventDefault();
        selectedText = -1;
    }

    function handleMouseOut(e) {
        e.preventDefault();
        selectedText = -1;
    }

    function handleMouseMove(e) {
        if (selectedText < 0) {
            return;
        }
        e.preventDefault();
        const mouseX = parseInt(e.offsetX);
        const mouseY = parseInt(e.offsetY);

        const dx = mouseX - startX;
        const dy = mouseY - startY;
        startX = mouseX;
        startY = mouseY;

        const text = texts[selectedText];
        text.x += dx;
        text.y += dy;
        // cannot remove the old ones.
        draw(canvasRef);
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
        setTopText('');
        setBottomText('');
    }

    function handleLink() {
        localStorage.setItem("memeFrom", "MemeMaker");
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
                    * After adding too many images, the canvas content is sometimes displayed incorrectly.

                    <div className="parent-div">
                        <div className="left-div">
                            <div className="options">
                                <Button type="submit" onClick={handleAddImage}>Add image</Button>
                            </div>
                            <canvas id="meme-canvas" className="meme-canvas" ref={canvasRef} width="0" height="0">
                                {meme && draw(canvasRef)}
                                <div id="top-text">{topText}</div>
                            </canvas>
                            <p>{caption}</p>
                            <br/>
                        </div>
                        <div className="right-div">
                            Name a title
                            <input
                                type="text"
                                placeholder={'name it'}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                            <br/>
                            <input
                                placeholder="top text"
                                value={topText}
                                onChange={e => setTopText(e.target.value)}
                            />
                            <br/>
                            <input
                                placeholder="bottom text"
                                value={bottomText}
                                onChange={e => setBottomText(e.target.value)}
                            />
                            <br/>

                            <Button onClick={clear}>Clear</Button>
                            <div>
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
                            <Button id="generate" type="submit" onClick={handleShowGenerate}>Generate meme</Button>

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

        </div>
    )
}

export default MemeMaker;