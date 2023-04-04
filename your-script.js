let canvas = new fabric.Canvas('canvas', {
  width: window.innerWidth,
  height: window.innerHeight
});
canvas.selection = false;

const sliderRows = document.getElementById('rows');
const sliderCols = document.getElementById('cols');
const sliderRowsValue = document.getElementById('rows-value');
const sliderColsValue = document.getElementById('cols-value');
const DOT_COUNT = 25; // Default number of dots when the page is loaded
let DOT_RADIUS = 15;

let NUM_ROWS = sliderRows.value;
let NUM_COLS = sliderCols.value;
sliderRowsValue.textContent = NUM_ROWS;
sliderColsValue.textContent = NUM_COLS;

sliderRows.addEventListener('input', event => {
  NUM_ROWS = event.target.value;
  sliderRowsValue.textContent = NUM_ROWS;
  updateDots();
});

sliderCols.addEventListener('input', event => {
  NUM_COLS = event.target.value;
  sliderColsValue.textContent = NUM_COLS;
  updateDots();
});

function updateDots() {
  canvas.clear();
  dots = [];
  lines = [];

  // Calculate the radius of the dots based on the number of rows and columns
  DOT_RADIUS = Math.min(canvas.width / NUM_COLS, canvas.height / NUM_ROWS) / 6;

  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      let dot = new fabric.Circle({
        left: (col + 0.25) * (canvas.width / NUM_COLS),
        top: (row + 0.25) * (canvas.height / NUM_ROWS),
        radius: DOT_RADIUS,
        fill: 'black',
        selectable: false,
        hoverCursor: 'pointer'
      });
      dots.push(dot);
      canvas.add(dot);
    }
  }
}

updateDots();

canvas.perPixelTargetFind = true;

let line = null;
let startDot = null;

canvas.on('mouse:down', event => {
  let target = event.target;
  if (target instanceof fabric.Circle) {
    // Clicked on a dot
    startDot = target;
    let center = startDot.getCenterPoint();
    line = new fabric.Line([(startDot.x + 0.25) * (canvas.width / NUM_COLS) + DOT_RADIUS, (startDot.y + 0.25) * (canvas.height / NUM_ROWS) + DOT_RADIUS, center.x, center.y], {
      stroke: 'black',
      strokeWidth: 3,
      snapToGrid: 0.5, // Snap to half a dot width/height
      snapAngle: 45, // Snap to 45 degree increments
      lockMovementX: true, // Lock horizontal movement
      lockMovementY: true // Lock vertical movement
    });
    canvas.add(line);
  }
});

canvas.on('mouse:move', event => {
  if (line !== null) {
    let mouse = canvas.getPointer(event.e);
    line.set({ x2: mouse.x, y2: mouse.y });
    canvas.renderAll();
  }
});

canvas.on('mouse:up', event => {
  let line = lines[lines.length - 1];
  if (line !== undefined) {
    let target = event.target;
    if (target instanceof fabric.Circle && target !== line.startDot) {
      // Released over another dot
      let center = target.getCenterPoint();
      line.set({ x2: (target.x + 0.25) * (canvas.width / NUM_COLS) + DOT_RADIUS, y2: (target.y + 0.25) * (canvas.height / NUM_ROWS) + DOT_RADIUS });
      line.snapTo('center', target); // Snap to the center of the target dot
    } else {
      // Released outside a dot
      canvas.remove(line);
      lines.pop();
    }
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (line !== null) {
      canvas.remove(line);
      line = null;
      startDot = null;
    }
  }
});

document.addEventListener('keydown', event => {
  if (event.keyCode === 32) {
    // Space bar pressed
    if (lines.length > 0) {
      let line = lines.pop();
      canvas.remove(line);
    }
  }
});

// Add the remove button to the page
let removeButton = document.createElement('div');
removeButton.style.position = 'absolute';
removeButton.style.bottom = '20px';
removeButton.style.right = '20px';
removeButton.style.borderRadius = '10px';
removeButton.style.backgroundColor = 'lightgray';
removeButton.style.padding = '10px';
removeButton.style.cursor = 'pointer';
removeButton.innerHTML = 'x';
document.body.appendChild(removeButton);

// Add a click event listener to the remove button
removeButton.addEventListener('click', function() {
  // Loop through all the lines on the canvas and remove them
  canvas.getObjects('line').forEach(function(line) {
    canvas.remove(line);
  });
});

document.getElementById('save-button').addEventListener('click', () => {
  // Construct the data to be saved
  const saveData = {
    rows: NUM_ROWS,
    cols: NUM_COLS,
    lines: []
  };
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let startDotIndex = dots.indexOf(line.startDot);
    let endDotIndex = dots.indexOf(line.endDot);
    saveData.lines.push([startDotIndex, endDotIndex]);
  }

  // Convert the data to a JSON string
  const saveDataString = JSON.stringify(saveData);

  // Create a download link with the data and click it to open the file explorer
  const downloadLink = document.createElement('a');
  downloadLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(saveDataString);
  downloadLink.download = 'interactive-canvas-save.txt';
  downloadLink.click();
});

// Load button functionality
const loadBtn = document.getElementById('load-btn');
const fileInput = document.getElementById('file-input');
loadBtn.addEventListener('click', event => {
  fileInput.click();
});

fileInput.addEventListener('change', event => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    const fileData = event.target.result;
    const data = JSON.parse(fileData);
    NUM_ROWS = data.numRows;
    NUM_COLS = data.numCols;
    sliderRows.value = NUM_ROWS;
    sliderCols.value = NUM_COLS;
    sliderRowsValue.textContent = NUM_ROWS;
    sliderColsValue.textContent = NUM_COLS;
    updateDots();
    lines = [];
    data.lines.forEach(lineData => {
      const startDot = dots[lineData.startDot];
      const endDot = dots[lineData.endDot];
      const line = new fabric.Line([startDot.left + startDot.radius, startDot.top + startDot.radius, endDot.left + endDot.radius, endDot.top + endDot.radius], {
        stroke: 'black',
        strokeWidth: 2
      });
      lines.push(line);
      canvas.add(line);
    });
  };
  reader.readAsText(file);
});
