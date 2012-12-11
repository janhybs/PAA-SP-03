(function () {
    var canvas, canvas;
    var context, context;
    var isDown;
    var lastPoint;
    var strokeWeight = 5;
    var intID = -1;
    var _isSupported = null;
    var Drawing = {};


    Drawing.isSupported = function () {
        if (_isSupported === null) {
            var tmpCanvas;
            _isSupported = !!(tmpCanvas = document.createElement ('canvas')).getContext
                    && tmpCanvas.toDataURL ("image/png").indexOf ("data:image/png") === 0;
        }

        return _isSupported;
    };

    Drawing.clearCanvas = function () {
        context.fillStyle = "#FFFFFF";
        context.fillRect (0, 0, canvas.width, canvas.height);
    };


    Drawing.onMouseDown = function (e) {
        isDown = true;

        if (e.touches && e.touches.length > 0)
            Drawing.startDrawing (Drawing.getCoords (e.touches[0]));
        else
            Drawing.startDrawing (Drawing.getCoords (e));
        e.preventDefault ();

    };

    Drawing.onMouseUp = function (e) {
        isDown = false;

        if (e.touches && e.touches.length > 0)
            Drawing.endDrawing (Drawing.getCoords (e.touches[0]));
        else
            Drawing.endDrawing (Drawing.getCoords (e));
        e.preventDefault ();
    };

    Drawing.onMouseMove = function (e) {
        if (!isDown)
            return;

        if (e.touches && e.touches.length > 0)
            Drawing.addDrawing (Drawing.getCoords (e.touches[0]));
        else
            Drawing.addDrawing (Drawing.getCoords (e));
        e.preventDefault ();
    };

    Drawing.onMouseLeave = function (e) {
        isDown = false;
        e.preventDefault ();
    };

    Drawing.getCoords = function (e) {
        console.log (e);
        //# mouseEvents
        if (e.offsetX)
            return new Point (e.offsetX, e.offsetY);
        
        //# touches
        else if (e.pageX)
            return new Point (e.pageX - (canvas.offsetLeft + canvas.offsetParent.offsetLeft), e.pageY - (canvas.offsetTop + canvas.offsetParent.offsetTop));
        else if (e.layerX)
            return new Point (e.layerY - (canvas.offsetLeft + canvas.offsetParent.offsetLeft), e.layerY - (canvas.offsetTop + canvas.offsetParent.offsetTop));
    };

    Drawing.startDrawing = function (point) {
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.lineWidth = strokeWeight;
        lastPoint = point;
    };

    Drawing.endDrawing = function (point) {
        if (lastPoint.x === point.x && lastPoint.y === point.y) {
            context.beginPath ();
            context.moveTo (lastPoint.x, lastPoint.y);
            context.lineTo (point.x, point.y);
            context.lineTo (point.x + 0.001, point.y + 0.001);
            context.stroke ();
        }
    };

    Drawing.getImageData = function (type) {
        return canvas.toDataURL (type || "image/png");
    };

    Drawing.addDrawing = function (point) {
        context.beginPath ();
        context.moveTo (lastPoint.x, lastPoint.y);
        context.lineTo (point.x, point.y);
        context.stroke ();
        lastPoint = point;
    };

    Drawing.changeColor = function (event) {
        var color = event.target.innerHTML;
        if (color !== "Fill") {
            context.strokeStyle = color;
            $ ("#Drawing li").cls ("selected", "remove");
            $ (event.target).cls ("selected", "add");
        } else {
            context.fillStyle = context.strokeStyle;
            context.fillRect (0, 0, canvas.width, canvas.height);
        }

    };

    Drawing.setStrokeWeight = function (value) {
        if (typeof (value) === 'string')
            value = value.charAt (0) === "+" ? strokeWeight + 1 : strokeWeight - 1;
        value = value > 40 ? 40 : value < 1 ? 1 : value;
        $ ("#strokeWidth").html (strokeWeight = value);
    };


    Drawing.init = function () {
        canvas = $ ('#drawCanvas').find ();
        context = canvas.getContext ('2d');
        context.fillStyle = "#FFFFFF";
        context.fillRect (0, 0, canvas.width, canvas.height);

        canvas.onmousedown = Drawing.onMouseDown;
        canvas.onmouseup = Drawing.onMouseUp;
        canvas.onmousemove = Drawing.onMouseMove;
        canvas.onmouseout = Drawing.onMouseLeave;

        canvas.ontouchstart = Drawing.onMouseDown;
        canvas.ontouchend = Drawing.onMouseUp;
        canvas.ontouchmove = Drawing.onMouseMove;

        $ ("#Drawing li").on ("click", Drawing.changeColor);

        $ ('#strokeInc').on ('mouseup', function () {
            clearInterval (intID);
        });

        $ ('#strokeDec').on ('mouseup', function () {
            clearInterval (intID);
        });

        $ ('#strokeInc').on ('mousedown', function (e) {
            e.preventDefault ();
            Drawing.setStrokeWeight ("+1");
            clearInterval (intID);
            intID = setTimeout (function () {
                intID = setInterval (function () {
                    Drawing.setStrokeWeight ("+1");
                }, 100);
            }, 250);
        });

        $ ('#strokeDec').on ('mousedown', function (e) {
            e.preventDefault ();
            Drawing.setStrokeWeight ("-1");
            clearInterval (intID);
            setTimeout (function () {
                intID = setInterval (function () {
                    Drawing.setStrokeWeight ("-1");
                }, 100);
            }, 250);
        });

        $ ('#drawCanvas').on ('click', function (e) {
            e.preventDefault ();
        });
        $ ('#drawCanvas').on ('touchstart', function (e) {
            e.preventDefault ();
        });
    };

    window.Drawing = Drawing;
}) ();


















function Point (x, y) {
    this.x = x;
    this.y = y;
}