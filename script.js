function polarToCartesian(radius, degrees, xOffset = 0, yOffset = 0) {
	var radians = (degrees * Math.PI) / 180;
	return {
		x: radius * Math.cos(radians) + xOffset,
		y: radius * Math.sin(radians) + yOffset,
	};
}

// Still funky with negative angles but I'm not worrying about that.
function describeArc(radius1, radius2, angleStart = 0, angleEnd = 360, centerX = 0, centerY = 0) {
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

function addArc(svg, radius1, radius2, angleStart = 0, angleEnd = 360, centerX = 0, centerY = 0) {
	const arc = describeArc(radius1, radius2, angleStart, angleEnd, centerX, centerY);
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); // whoa, a namespace
	path.setAttribute("fill", "black");
	path.setAttribute("d", arc);
	svg.appendChild(path);
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

function getBitsAndBinStrings() {
	const bits = document.getElementById("bits").value;
	const gray = document.getElementById("gray").checked;
	const reverse = document.getElementById("reverse").checked;

	const binStrings = (gray ? grayCode : normalBinary)(bits);
	if (reverse) {
		binStrings.forEach((s, i, a) => (a[i] = [...s].reverse().join("")));
	}

	return { bits, binStrings };
}

function getAndClearSvg() {
	const svg = document.getElementById("svg");
	svg.innerHTML = "";
	return svg;
}

function drawWheel(innerRadius = 10, outerRadius = 100, angleOffset = -90) {
	const svg = getAndClearSvg();
	const { bits, binStrings } = getBitsAndBinStrings();
	const arcAngle = 360 / binStrings.length;
	const arcWidth = (outerRadius - innerRadius) / bits;

	for (let i = 0; i < binStrings.length; i++) {
		let angleStart = i * arcAngle + angleOffset;
		let angleEnd = angleStart + arcAngle;

		for (let j = 0; j < bits; j++) {
			let radius1 = innerRadius + j * arcWidth;
			let radius2 = radius1 + arcWidth;
			if (binStrings[i].charAt(j) === "1") {
				addArc(svg, radius1, radius2, angleStart, angleEnd);
			}
		}
	}
}

drawWheel();
