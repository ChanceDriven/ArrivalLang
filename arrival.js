"use strict"

var generate = function () {
    var randVal;
    var breaks; //0, 1, 2
    var primaryBreakPositionIndex;
    var segmentDetails = [];
    var maxWidth = 80;
    var minWidth = 45;
    var thinWidth = 20;
    var ringRad = 400;
    var center_x = 950;
    var center_y = 475;

    //roll for breaks
    breaks = getBreakCount();
    randVal = Math.random();
    primaryBreakPositionIndex = Math.floor(randVal * 16);

    for (var i = 0; i < 16; i++) {
        var details = {};
        details.isBreak = isBreak(i, primaryBreakPositionIndex, breaks);

        randVal = Math.random();
        details.isThick = randVal > 0.75 && !details.isBreak; //random chance to be thick, not allowing thick if it's a break

        randVal = Math.random();
        if (details.isThick) {
            details.thickness = Math.floor(randVal * (maxWidth - minWidth)) + minWidth;
        } else if (!details.isBreak) {
            details.thickness = thinWidth;
        } else {
            details.thickness = 0;
        }

        segmentDetails.push(details);
    }

    for (var i = 0; i < 16; i++) {
        var leftSeg = segmentDetails[i + 15 % 16];
    }

    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");


    //blurry pass first
    ctx.filter = "none";
    for (var i = 0; i < 16; i++) {

        var segment = segmentDetails[i];

        var leftNeighbor = segmentDetails[(i - 1 + 16) % 16];
        var rightNeighbor = segmentDetails[(i + 1) % 16];

        var leftNeighborThickness = leftNeighbor.thickness;
        var rightNeighborThickness = rightNeighbor.thickness;
        var currentThickness = segment.thickness;

        // left taper
        if (leftNeighborThickness === currentThickness) {
            ctx.beginPath();
            ctx.lineWidth = currentThickness;
            ctx.arc(center_x, center_y, ringRad, Math.PI * i / 8, Math.PI * (i + 0.1) / 8);
            ctx.stroke();
        } else {
            var average = Math.floor(leftNeighborThickness / 2 + currentThickness / 2);
            var diff = currentThickness - leftNeighborThickness;
            for (var j = 0; j < 16; j++) {
                if (diff < 0) {
                    ctx.beginPath();
                    ctx.lineWidth = Math.floor(average + diff * (j) / 32);
                    ctx.arc(center_x, center_y, ringRad, Math.PI * (i) / 8, Math.PI * (i + 0.1 * j / 16) / 8);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.lineWidth = Math.floor(average + diff * (j) / 32);
                    ctx.arc(center_x, center_y, ringRad, Math.PI * (i + j * 0.1 / 16) / 8, Math.PI * (i + 0.1) / 8);
                    ctx.stroke();
                }
            }
        }

        // right taper
        if (rightNeighborThickness === currentThickness) {
            ctx.beginPath();
            ctx.lineWidth = currentThickness;
            ctx.arc(center_x, center_y, ringRad, Math.PI * (i + 0.9) / 8, Math.PI * (i + 1) / 8);
            ctx.stroke();
        } else {
            var average = Math.floor(rightNeighborThickness / 2 + currentThickness / 2);
            var diff = rightNeighborThickness - currentThickness;
            for (var j = 0; j < 16; j++) {
                if (diff < 0) {
                    ctx.beginPath();
                    ctx.lineWidth = Math.floor(currentThickness + diff * (j) / 32);
                    ctx.arc(center_x, center_y, ringRad, Math.PI * (i + 0.9) / 8, Math.PI * (i + 0.9 + (0.1 * j / 16)) / 8);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.lineWidth = Math.floor(currentThickness + diff * (j) / 32);
                    ctx.arc(center_x, center_y, ringRad, Math.PI * (i + 0.9 + (0.1 * j / 16)) / 8, Math.PI * (i + 1) / 8);
                    ctx.stroke();
                }
            }
        }

        if (!segment.isBreak) {//the center .6 will be at the standard thickness
            ctx.beginPath();
            ctx.lineWidth = currentThickness;
            ctx.arc(center_x, center_y, ringRad, Math.PI * (i + 0.1) / 8, Math.PI * (i + 0.9) / 8);
            ctx.stroke();
        }
    }

    //fingerling test
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(950, 75);
    ctx.bezierCurveTo(950, 50, 930, 50, 875, 50);
    ctx.stroke();
    
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(875, 50, 3, 0, Math.PI * 2)
    ctx.fill();
    ctx.stroke();
    
}

function isBreak(segmentIndex, breakIndex, gapCount) {
    if (segmentIndex < 0) { segmentIndex = segmentIndex + 16;}
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