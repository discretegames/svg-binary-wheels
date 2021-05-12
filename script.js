function polarToCartesian(radius, degrees, xOffset = 0, yOffset = 0) {
	var radians = (degrees * Math.PI) / 180;
	return {
		x: radius * Math.cos(radians) + xOffset,
		y: radius * Math.sin(radians) + yOffset,
	};
}

// Still funky with negative angles but I'm not worrying about that.
function describeArc(centerX, centerY, radius1, radius2, angleStart = 0, angleEnd = 360) {
	const is360 = Math.abs(angleStart - angleEnd) >= 360;
	if (is360) {
		angleStart = 0;
		angleEnd = 360;
	}

	const polar = (radius, angle) => polarToCartesian(radius, angle, centerX, centerY);
	const start1 = polar(radius1, angleStart);
	const end1 = polar(radius1, angleEnd);
	const start2 = polar(radius2, angleStart);
	const end2 = polar(radius2, angleEnd);

	const largeArcFlag = angleEnd - angleStart > 180 ? 1 : 0;
	const lineType = is360 ? "M" : "L";

	return [
		"M",
		start1.x,
		start1.y,
		"A",
		radius1,
		radius1,
		0,
		largeArcFlag,
		1,
		end1.x,
		end1.y,
		lineType,
		end2.x,
		end2.y,
		"A",
		radius2,
		radius2,
		0,
		largeArcFlag,
		0,
		start2.x,
		start2.y,
		lineType,
		start1.x,
		start1.y,
		"Z",
	].join(" ");
}

function normalBinary(bits) {
	const binStrings = [];
	for (let i = 0; i < Math.pow(2, bits); i++) {
		binStrings.push(i.toString(2).padStart(bits, "0"));
	}
	return binStrings;
}

function grayCode(bits) {
	const binStrings = ["0", "1"];
	for (let b = 1; b < bits; b++) {
		binStrings.push(...[...binStrings].reverse());
		binStrings.forEach((s, i, a) => (a[i] = (2 * i < a.length ? "0" : "1") + s));
	}
	return binStrings;
}

function drawWheel() {
	const bits = document.getElementById("bits").value;
	const gray = document.getElementById("gray").checked;
	const reverse = document.getElementById("reverse").checked;

	const binStrings = (gray ? grayCode : normalBinary)(bits);
	if (reverse) {
		binStrings.forEach((s, i, a) => (a[i] = [...s].reverse().join("")));
	}

	console.log(binStrings);
}

drawWheel();

var path1 = describeArc(0, 0, 30, 50, 0, 180);
document.getElementById("path1").setAttribute("d", path1);
var path2 = describeArc(0, 0, 0, 30, 0, 90);
document.getElementById("path2").setAttribute("d", path2);
