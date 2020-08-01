var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;
var context;
var canvas;

function addClick(x, y, dragging)
{
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
}

function redraw(){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

    context.strokeStyle = "#1e88e5";
    context.lineJoin = "round";
    context.lineWidth = Math.round(document.getElementById("drawingCanvas").clientWidth/15);

    for(var i=0; i < clickX.length; i++) {
        context.beginPath();
        if(clickDrag[i] && i){
            context.moveTo(clickX[i-1], clickY[i-1]);
        }else{
            context.moveTo(clickX[i]-1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.stroke();
    }
}

function prepareCanvas() {

    document.getElementById('drawingCanvas').setAttribute('width', document.getElementById("drawingCanvas").clientWidth);
    document.getElementById('drawingCanvas').setAttribute('height', document.getElementById("drawingCanvas").clientHeight);
    context = document.getElementById('drawingCanvas').getContext("2d");
    canvas = document.getElementById("drawingCanvas");

    function press(e){
        var canvasEl = document.getElementById("drawingCanvas")
        var mouseX = e.pageX - canvasEl.offsetLeft;
        var mouseY = e.pageY - canvasEl.offsetTop;

        paint = true;
        addClick(e.pageX - canvasEl.offsetLeft, e.pageY - canvasEl.offsetTop);
        redraw();
    }

    function move(e) {
        var canvasEl = document.getElementById("drawingCanvas")
        if(paint){
            addClick(e.pageX - canvasEl.offsetLeft, e.pageY - canvasEl.offsetTop, true);
            redraw();
        }
    }

    function free(e){
        paint = false;
    }

    var obj = document.getElementById('drawingCanvas');
    obj.addEventListener('mousedown', press);
    obj.addEventListener('mousemove', move);
    obj.addEventListener('mouseup', free);
    obj.addEventListener('mouseleave', function(e) {
            paint = false;
    });

    document.body.addEventListener("touchstart", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
            press(e);
        }
    }, {passive: false});
    document.body.addEventListener("touchend", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
            free(e);
        }
    }, {passive: false});
    document.body.addEventListener("touchmove", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
            move(e);
        }
    }, {passive: false});

}

function clearCanvas() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    clickX = new Array();
    clickY = new Array();
    clickDrag = new Array();
    paint = false;
}

function recognizeDigit() {
    var imgSrc = canvas.toDataURL();
    var auxCanvas = document.getElementById("auxCanvas");
    auxCanvas.setAttribute('width', 28);
    auxCanvas.setAttribute('height', 28);
    var auxContext = auxCanvas.getContext('2d');
    var auxImage = new Image();
    auxImage.src = imgSrc;
    auxImage.onload = function(){
        auxContext.drawImage(auxImage, 0, 0, context.canvas.width, context.canvas.height, 0, 0, 28, 28);
        var canvasData  = auxContext.getImageData(0, 0, 28, 28).data;
        // console.log(String(prepareModelData(canvasData)));
        console.log()
        var url = "http://127.0.0.1:5000/?img=" + String(prepareModelData(canvasData));
        var xmlHttp = new XMLHttpRequest();
        console.log(url);
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.status == 200){
                if(xmlHttp.responseText) {
                    alert("Computer Said it's " + xmlHttp.responseText);
                    console.log(xmlHttp.responseText);
                }
            }
            else{
                // alert('Error');
            }
        }
        xmlHttp.open("GET", url, true); // true for asynchronous
        xmlHttp.send(null);
    }
}

function attack() {
    var imgSrc = canvas.toDataURL();
    var auxCanvas = document.getElementById("auxCanvas");
    auxCanvas.setAttribute('width', 28);
    auxCanvas.setAttribute('height', 28);
    var auxContext = auxCanvas.getContext('2d');
    var auxImage = new Image();
    auxImage.src = imgSrc;
    auxImage.onload = function(){
        auxContext.drawImage(auxImage, 0, 0, context.canvas.width, context.canvas.height, 0, 0, 28, 28);
        var canvasData  = auxContext.getImageData(0, 0, 28, 28).data;
        // console.log(String(prepareModelData(canvasData)));
        console.log()
        var url = "http://127.0.0.1:5000/fool?img=" + String(prepareModelData(canvasData));
        var xmlHttp = new XMLHttpRequest();
        console.log(url);
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.status == 200){
                if(xmlHttp.responseText) {
                    var img=document.getElementById("attack_img");
                    var lab=document.getElementById("attack_text");
                    obj = JSON.parse(xmlHttp.responseText);
                    lab.innerHTML  = "The image below is under attack, and recognized as " + obj.res
                    img.src = "data:image/jpeg;base64," + obj.dat.replace(/\"/g, "");
                    // console.log(xmlHttp.responseText);
                }
            }
            else{
                // alert('Error');
            }
        }
        xmlHttp.open("GET", url, true); // true for asynchronous
        xmlHttp.send(null);
    }
}

function prepareModelData(canvasData) {
    var imageBinary = [];
    for (var pixelInd = 0; pixelInd < 28 * 28; pixelInd++) {
        let pixelSeriesInd = pixelInd * 4;
        if (canvasData[pixelSeriesInd] > 0 || canvasData[pixelSeriesInd+1] > 0|| canvasData[pixelSeriesInd+2] > 0) {
            imageBinary.push(1.0);
        } else {
            imageBinary.push(0.0);
        }
    }

    var modelData = [];
    for (var rowInd = 0; rowInd < 28; rowInd++) {
        var row = [];
        for (var colInd = 0; colInd < 28; colInd++) {
            row.push([imageBinary[rowInd * 28 + colInd]]);
        }
        modelData.push(row);
    }

    // var modelData = [];
    // for (var colInd = 0; colInd < 28; colInd++) {
    //     var col = [];
    //     for (var rowInd = 0; rowInd < 28; rowInd++) {
    //         col.push([imageBinary[rowInd * 28 + colInd]]);
    //     }
    //     modelData.push(col);
    // }

    return modelData;
}
