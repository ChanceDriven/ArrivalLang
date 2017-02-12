"use strict"

var generate3 = function () {
    var randVal;
    var segmentCount = 16;
    var breaks; //0, 1, 2
    var primaryBreakPositionIndex;
    var segmentDetails = [];
    var maxWidth = 160;
    var minWidth = 90;
    var minThinWidth = 10;
    var maxThinWidth = 30;
    var ringRad = 750;
    var center_x = 1900;
    var center_y = 950;
    var maxTendrilLength = 300;
    var minTendrilLength = 100;
    var maxTendrilWidth = 17;
    var minTendrilWidth = 2;
    var maxTendrilCount = 16;
    var minTendrilCount = 7;
    var thinSmoothness = 10;
    var endBlobMaxSize = 150;

    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    c.width = center_x * 2;
    c.height = center_y * 2;
    ctx.fillStyle = '#000000';

    //roll for breaks
    breaks = getBreakCount();
    breaks = 1;
    primaryBreakPositionIndex = 0;

    var moveStartingPosition = getRandomInIntRange(0, segmentCount - 1);
    for (var i = 0; i < moveStartingPosition; i++) {
        rotateCanvas(ctx, center_x, center_y, segmentCount);
    }

    if (breaks === 1) { //gonna do a one ended blob
        var tempCanvas = document.createElement("canvas");
        var tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = c.width;
        tempCanvas.height = c.height;
        var threshold = 80;
        var size = 65;

        for (var i = 0; i < moveStartingPosition + 2; i++) {
            rotateCanvas(tempCtx, center_x, center_y, segmentCount);
        }

        var theta1 = 0 - 2 * Math.PI * 0.1 / segmentCount;
        var theta2 = 2 * Math.PI * 0.3 / segmentCount;
        var theta3 = 0 - 2 * Math.PI * 0.05 / segmentCount;
        var theta4 = 2 * Math.PI * 0.30 / segmentCount;
        var thetaAvg = Math.floor(theta1 / 2 + theta2 / 2);
        var rad1 = ringRad;
        var rad2 = Math.floor(ringRad + endBlobMaxSize * Math.random() * 0.75);

        var points = [];
        points.push(new Point(Math.floor(Math.cos(theta1) * rad1) + center_x, Math.floor(Math.sin(theta1) * rad1) + center_y));
        points.push(new Point(Math.floor(Math.cos(theta2) * rad1) + center_x, Math.floor(Math.sin(theta2) * rad1) + center_y));
        points.push(new Point(Math.floor(Math.cos(2 * Math.PI * 0.5 / segmentCount) * rad1) + center_x, Math.floor(Math.sin(2 * Math.PI * 0.5 / segmentCount) * rad1) + center_y));
        points.push(new Point(Math.floor(Math.cos(2 * Math.PI * 0.65 / segmentCount) * rad1) + center_x, Math.floor(Math.sin(2 * Math.PI * 0.65 / segmentCount) * rad1) + center_y));
        points.push(new Point(Math.floor(Math.cos(theta4) * Math.floor(rad1 / 2 + rad2 / 2)) + center_x, Math.floor(Math.sin(theta4) * Math.floor(rad1 / 2 + rad2 / 2)) + center_y));
        points.push(new Point(Math.floor(Math.cos(theta3) * rad2) + center_x, Math.floor(Math.sin(theta3) * rad2) + center_y));
        points.push(new Point(Math.floor(Math.cos(theta3 / 2 + theta4 / 2) * Math.floor(rad1 / 2 + rad2 / 2)) + center_x, Math.floor(Math.sin(theta3 / 2 + theta4 / 2) * Math.floor(rad1 / 2 + rad2 / 2)) + center_y));
        points.push(new Point(Math.floor(Math.cos(theta3 / 2 + theta4 / 2) * rad2) + center_x, Math.floor(Math.sin(theta3 / 2 + theta4 / 2) * rad2) + center_y));

        for (var j = 0; j < points.length; j++) {
            var point = points[j];

            tempCtx.beginPath();
            var gradient = tempCtx.createRadialGradient(point.x, point.y, 1, point.x, point.y, size);
            gradient.addColorStop(0, 'rgba(0,0,0,1)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            tempCtx.fillStyle = gradient;

            tempCtx.arc(point.x, point.y, size, 0, Math.PI * 2);
            tempCtx.fill();
        }
        var imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        var pix = imgData.data;
        for (var k = 0, n = pix.length; k < n; k += 4) {
            if (pix[k + 3] < threshold) {
                pix[k + 3] /= 6;
                if (pix[k + 3] > threshold / 4) {
                    pix[k + 3] = 0;
                }
            }
            else {
                pix[k + 0] = 0;
                pix[k + 1] = 0;
                pix[k + 2] = 0;
                pix[k + 3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    for (var i = 0; i < segmentCount; i++) {
        var details = {};
        details.isBreak = isBreak(segmentCount, i, primaryBreakPositionIndex, breaks);

        randVal = Math.random();
        details.isThick = randVal > 0.75 && !details.isBreak; //random chance to be thick, not allowing thick if it's a break

        randVal = Math.random();
        if (details.isThick) {
            details.thickness = Math.floor(randVal * (maxWidth - minWidth)) + minWidth;
        } else {
            details.thickness = 0;
        }

        segmentDetails.push(details);
    }

    var r_offset = 0;
    var thickness = getRandomInIntRange(minThinWidth, maxThinWidth);
    var x_position = 0;
    var y_position = 0;
    var theta = 0;

    for (var i = 0; i < segmentCount; i++) {
        rotateCanvas(ctx, center_x, center_y, segmentCount);
        var segment = segmentDetails[i];
        if (segment.isBreak) {
            continue;
        }
        var leftNeighbor = segmentDetails[(i - 1 + 16) % 16];
        var rightNeighbor = segmentDetails[(i + 1) % 16];

        ctx.beginPath();
        for (var j = 0; j < Math.floor(ringRad / thinSmoothness) ; j++) {
            theta = Math.PI * 2 * thinSmoothness * j / ringRad / segmentCount;
            randVal = Math.random();
            thickness += randVal < .2 ? -1 : randVal < .8 ? 0 : 1;
            thickness = getBetweenLimits(thickness, minThinWidth, maxThinWidth);

            x_position = Math.floor(Math.cos(theta) * ringRad) + center_x;
            y_position = Math.floor(Math.sin(theta) * ringRad) + center_y;
            ctx.arc(x_position, y_position, thickness, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.fill();
    }

    var image = new Image();
    image.src = c.toDataURL('image/png');
    c.width = center_x;
    c.height = center_y;
    ctx.drawImage(image, 0, 0, center_x * 2, center_y * 2, 0, 0, center_x, center_y);
}

function rotateCanvas(ctx, center_x, center_y, segmentCount) {
    ctx.translate(center_x, center_y);
    ctx.rotate(Math.PI * 2 / segmentCount);
    ctx.translate(-center_x, -center_y);
}

function isBreak(segmentCount, segmentIndex, breakIndex, gapCount) {
    if (segmentIndex < 0) { segmentIndex = segmentIndex + segmentCount; }
    if (gapCount === 0) { return false; }
    if (gapCount === 1) { return segmentIndex === breakIndex; }
    return segmentIndex === breakIndex || segmentIndex === ((breakIndex + 8) % 16);
}

function getBreakCount() {
    var randVal = Math.random();
    if (randVal < 2 / 3) {
        return 0;
    } else if (randVal < 8 / 9) {
        return 1;
    }
    return 2;
}

function getBetweenLimits(val, low, high) {
    if (val < low) { return low; }
    if (val > high) { return high; }
    return val;
}

function getRandomInRange(low, high) {
    var randVal = Math.random();
    return randVal * (high - low) + low;
}

function getRandomInIntRange(low, high) {
    var randVal = Math.random();
    return Math.floor(randVal * (high - low) + low);
}

var Point = function(x, y){
	this.x = x;
	this.y = y;
}