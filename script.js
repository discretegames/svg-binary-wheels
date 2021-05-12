function polarToCartesian(radius, degrees, xOffset = 0, yOffset = 0) {
	const radians = (degrees * Math.PI) / 180;
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

function makeArcPath(radius1, radius2, angleStart = 0, angleEnd = 360, centerX = 0, centerY = 0) {
	const arc = describeArc(radius1, radius2, angleStart, angleEnd, centerX, centerY);
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); // whoa, a namespace
	path.setAttribute("fill", "black");
	path.setAttribute("d", arc);
	return path;
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

function setNumberEvent(text) {
	const number = document.getElementById("number");
	return function () {
		number.innerText = text;
	};
}

const clearNumber = setNumberEvent("[hover to see binary code]");

function makeCenter(innerRadius) {
	const center = makeArcPath(0, innerRadius);
	center.classList.add("bin-string");
	center.onmouseenter = setNumberEvent("You found the center!");
	center.onmouseleave = clearNumber;
	return center;
}

function drawWheel(innerRadius = 25, outerRadius = 350, angleOffset = -90) {
	const svg = getAndClearSvg();
	const { bits, binStrings } = getBitsAndBinStrings();
	const arcAngle = 360 / binStrings.length;
	const arcWidth = (outerRadius - innerRadius) / bits;

	for (let i = 0; i < binStrings.length; i++) {
		const angleStart = i * arcAngle + angleOffset;
		const angleEnd = angleStart + arcAngle;

		for (let j = 0; j < bits; j++) {
			const radius1 = innerRadius + j * arcWidth;
			const radius2 = radius1 + arcWidth;
			if (binStrings[i].charAt(j) === "1") {
				svg.appendChild(makeArcPath(radius1, radius2, angleStart, angleEnd));
			}
		}
	}

	for (let i = 0; i < binStrings.length; i++) {
		const angleStart = i * arcAngle + angleOffset;
		const angleEnd = angleStart + arcAngle;
		const path = makeArcPath(innerRadius, outerRadius, angleStart, angleEnd);
		path.classList.add("bin-string");
		path.onmouseenter = setNumberEvent([...binStrings[i]].join(" "));
		path.onmouseleave = clearNumber;
		svg.appendChild(path);
	}

	svg.appendChild(makeCenter(innerRadius));
}

drawWheel();
