"use strict"

var generate2 = function () {
    var randVal;
    var breaks; //0, 1, 2
    var primaryBreakPositionIndex;
    var segmentDetails = [];
    var maxWidth = 160;
    var minWidth = 90;
    var thinWidth = 40;
    var ringRad = 750;
    var center_x = 1900;
    var center_y = 950;
    var maxTendrilLength = 300;
    var minTendrilLength = 100;
    var maxTendrilWidth = 17;
    var minTendrilWidth = 2;
    var maxTendrilCount = 16;
    var minTendrilCount = 7;

    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    c.width = center_x * 2;
    c.height = center_y * 2;

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
            ctx.arc(center_x, center_y, ringRad, 0, Math.PI * (0.1) / 8);
            ctx.stroke();
        } else {
            var average = Math.floor(leftNeighborThickness / 2 + currentThickness / 2);
            var diff = currentThickness - leftNeighborThickness;
            for (var j = 0; j < 16; j++) {
                if (diff < 0) {
                    ctx.beginPath();
                    ctx.lineWidth = Math.floor(average + diff * (j) / 32);
                    ctx.arc(center_x, center_y, ringRad, 0, Math.PI * ( 0.105 * j / 16) / 8);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.lineWidth = Math.floor(average + diff * (j) / 32);
                    ctx.arc(center_x, center_y, ringRad, Math.PI * (j * 0.1 / 16) / 8, Math.PI * (0.1075) / 8);
                    ctx.stroke();
                }
            }
        }

        // right taper
        if (rightNeighborThickness === currentThickness) {
            ctx.beginPath();
            ctx.lineWidth = currentThickness;
            ctx.arc(center_x, center_y, ringRad, Math.PI * (0.9) / 8, Math.PI * (1) / 8);
            ctx.stroke();
        } else {
            var average = Math.floor(rightNeighborThickness / 2 + currentThickness / 2);
            var diff = rightNeighborThickness - currentThickness;
            for (var j = 0; j < 16; j++) {
                if (diff < 0) {
                    ctx.beginPath();
                    ctx.lineWidth = Math.floor(currentThickness + diff * (j) / 32);
                    ctx.arc(center_x, center_y, ringRad, Math.PI * (0.9) / 8, Math.PI * (0.9 + (0.1075 * j / 16)) / 8);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.lineWidth = Math.floor(currentThickness + diff * (j) / 32);
                    ctx.arc(center_x, center_y, ringRad, Math.PI * (0.9 + (0.105 * j / 16)) / 8, Math.PI / 8);
                    ctx.stroke();
                }
            }
        }

        if (!segment.isBreak) {//the center .6 will be at the standard thickness
            ctx.beginPath();
            ctx.lineWidth = currentThickness;
            ctx.arc(center_x, center_y, ringRad, Math.PI * 0.095 / 8, Math.PI * 0.905 / 8);
            ctx.stroke();
        }

        //time for the goopy stuff!
        if (segment.isThick) {
            var tendrilCount = getRandomInIntRange(minTendrilCount, maxTendrilCount);

            //outer tendrils
            for (var k = 0; k < tendrilCount; k++) {
                randVal = Math.random();
                var tendrilLength = getRandomInIntRange(minTendrilLength, maxTendrilLength);
                var tendrilCurrentWidth = Math.floor(randVal * (maxTendrilWidth - minTendrilWidth)) + minTendrilWidth;
                var widthDelta = 0;

                randVal = Math.random();
                var angleOffset = rightNeighbor.isThick ? getRandomInRange(-0.15, 0.25) : getRandomInRange(-0.15, 0.15);
                var position_x = center_x + Math.floor(Math.cos(Math.PI / 16 + angleOffset) * ringRad);
                var position_y = center_y + Math.floor(Math.sin(Math.PI / 16 + angleOffset) * ringRad);
                var x_travelOffset = 0;
                var y_travelOffset = 0;

                for (var j = 0; j < tendrilLength; j++) {
                    randVal = Math.random();
                    widthDelta = (randVal * (tendrilLength - j / 1.5) / tendrilLength) < 0.1 ? -1 : randVal < .9 ? 0 : 1;
                    tendrilCurrentWidth = tendrilCurrentWidth + widthDelta;
                    tendrilCurrentWidth = Math.min(tendrilCurrentWidth, maxTendrilWidth);
                    tendrilCurrentWidth = Math.max(tendrilCurrentWidth, minTendrilWidth);

                    ctx.beginPath();
                    ctx.arc(position_x, position_y, tendrilCurrentWidth, 0, Math.PI * 2);
                    ctx.lineWidth = 1;
                    ctx.fillStyle = "#000000";
                    ctx.stroke();
                    ctx.fill();

                    randVal = Math.random();
                    x_travelOffset += randVal > 0.35 ? 1 : 0;
                    randVal = Math.random();
                    y_travelOffset += randVal > 0.65 ? 1 : 0;
                    position_x = center_x + Math.floor(Math.cos(Math.PI / 16 + angleOffset + (x_travelOffset * 0.005 / Math.PI)) * (ringRad + y_travelOffset + currentThickness / 2 - 10));
                    position_y = center_y + Math.floor(Math.sin(Math.PI / 16 + angleOffset + (x_travelOffset * 0.005 / Math.PI)) * (ringRad + y_travelOffset + currentThickness / 2 - 10));
                }
            }

            //inner tendrils
            for (var k = 0; k < tendrilCount; k++) {
                randVal = Math.random();
                var tendrilLength = Math.floor(randVal * (maxTendrilLength - minTendrilLength) + minTendrilLength);
                var tendrilCurrentWidth = Math.floor(randVal * (maxTendrilWidth - minTendrilWidth)) + minTendrilWidth;
                var widthDelta = 0;

                randVal = Math.random();
                
                var angleOffset = rightNeighbor.isThick ? getRandomInRange(-0.15, 0.25) : getRandomInRange(-0.15, 0.15);
                var position_x = center_x + Math.floor(Math.cos(Math.PI / 16 + angleOffset) * ringRad);
                var position_y = center_y + Math.floor(Math.sin(Math.PI / 16 + angleOffset) * ringRad);
                var x_travelOffset = 0;
                var y_travelOffset = 0;

                for (var j = 0; j < tendrilLength; j++) {
                    randVal = Math.random();
                    widthDelta = (randVal * (tendrilLength - j / 1.5) / tendrilLength) < 0.1 ? -1 : randVal < .9 ? 0 : 1;
                    tendrilCurrentWidth = tendrilCurrentWidth + widthDelta;
                    tendrilCurrentWidth = Math.min(tendrilCurrentWidth, maxTendrilWidth);
                    tendrilCurrentWidth = Math.max(tendrilCurrentWidth, minTendrilWidth);

                    ctx.beginPath();
                    ctx.arc(position_x, position_y, tendrilCurrentWidth, 0, Math.PI * 2);
                    ctx.lineWidth = 1;
                    ctx.fillStyle = "#000000";
                    ctx.stroke();
                    ctx.fill();

                    randVal = Math.random();
                    x_travelOffset += randVal > 0.35 ? 1 : 0;
                    randVal = Math.random();
                    y_travelOffset += randVal > 0.65 ? 1 : 0;
                    position_x = center_x + Math.floor(Math.cos(Math.PI / 16 + angleOffset + (x_travelOffset * 0.005 / Math.PI)) * (ringRad - y_travelOffset - currentThickness / 2 + 10));
                    position_y = center_y + Math.floor(Math.sin(Math.PI / 16 + angleOffset + (x_travelOffset * 0.005 / Math.PI)) * (ringRad - y_travelOffset - currentThickness / 2 + 10));
                }
            }
        }

       ctx.translate(center_x, center_y);
       ctx.rotate(Math.PI / 8);
       ctx.translate(-center_x, -center_y);
    }
    var image = new Image();
    image.src = c.toDataURL('image/png');
    c.width = center_x;
    c.height = center_y;
    ctx.drawImage(image, 0, 0, center_x * 2, center_y * 2, 0, 0, center_x, center_y);
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

function getRandomInRange(low, high) {
    var randVal = Math.random();
    return randVal * (high - low) + low;
}

function getRandomInIntRange(low, high) {
    var randVal = Math.random();
    return Math.floor(randVal * (high - low) + low);
}