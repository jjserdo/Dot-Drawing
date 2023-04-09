// Create canvas
let canvas = new fabric.Canvas('canvas', {
  width: window.innerWidth,
  height: window.innerHeight
});
canvas.selection = false;
canvas.perPixelTargetFind = true;

// Initialize slider elements
const sliderRows = document.getElementById('rows');
const sliderCols = document.getElementById('cols');
const sliderRowsValue = document.getElementById('rows-value');
const sliderColsValue = document.getElementById('cols-value');

// Set default values for dot and grid properties
const DOT_COUNT = 25; 
let DOT_RADIUS = 10;
let NUM_ROWS = sliderRows.value;
let NUM_COLS = sliderCols.value;
sliderRowsValue.textContent = NUM_ROWS;
sliderColsValue.textContent = NUM_COLS;

// Initialize lines and dots arrays
let lines = [];
let line = null;
let startDot = null;
let dots = [];

// Add slider event listeners
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

// Update dots on the canvas
function updateDots() {
  canvas.clear();
  dots = [];
  lines = [];

  // Calculate the radius of the dots based on the number of rows and columns
  DOT_RADIUS = Math.min(canvas.width / NUM_COLS, canvas.height / NUM_ROWS) / 8;

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

canvas.on('mouse:down', event => {
  let target = event.target;
  if (target instanceof fabric.Circle) {
    // Clicked on a dot
    startDot = target;
    let center = startDot.getCenterPoint();
    line = new fabric.Line([center.x, center.y, center.x, center.y], {
      stroke: 'black',
      strokeWidth: 3,
      originX: 'center',
      originY: 'center',
    });
    line.startDot = startDot; // Set the 'startDot' property
    lines.push(line); // Push the line into the 'lines' array
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
  if (line !== null) {
    let target = event.target;
    if (target instanceof fabric.Circle && target !== line.startDot) {
      // Released over another dot
      let center = target.getCenterPoint();
      line.set({ x2: center.x, y2: center.y });
      line.endDot = target; // Set the 'endDot' property

      let startDotRowCol = getRowColFromCoordinates(line.startDot.left, line.startDot.top);
      let endDotRowCol = getRowColFromCoordinates(line.endDot.left, line.endDot.top);
      lines.push({ start: startDotRowCol, end: endDotRowCol });

    } else {
      // Released outside a dot
      canvas.remove(line);
      lines.pop();
    }
    line = null;
    startDot = null;
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
  if (event.keyCode === 32) {
    // Space bar pressed
    if (lines.length > 0) {
      let line = lines.pop();
      canvas.remove(line);
    }
  }
});


// Add a click event listener to the remove button
removeButton.addEventListener('click', function() {
  // Loop through all the lines on the canvas and remove them
  canvas.getObjects('line').forEach(function(line) {
    canvas.remove(line);
  });
});

// Save button event listener
document.getElementById('save-button').addEventListener('click', () => {
  // Prepare lines data to save only relevant properties
  const preparedLines = lines.map(line => {
    const startDotRowCol = getRowColFromCoordinates(line.startDot.left, line.startDot.top);
    const endDotRowCol = getRowColFromCoordinates(line.endDot.left, line.endDot.top);
    return { start: startDotRowCol, end: endDotRowCol };
  });

  // Construct the data to be saved
  const saveData = {
    rows: NUM_ROWS,
    cols: NUM_COLS,
    lines: lines
  };

  // Convert the data to a JSON string
  const saveDataString = JSON.stringify(saveData);

    // Create a Blob from the JSON string
  const saveDataBlob = new Blob([saveDataString], { type: 'text/plain;charset=utf-8' });

  // Create a URL for the Blob
  const saveDataURL = URL.createObjectURL(saveDataBlob);

  // Create a download link with the data and click it to open the file explorer
  const downloadLink = document.createElement('a');
  downloadLink.href = saveDataURL;
  downloadLink.download = 'interactive-canvas-save.txt';
  downloadLink.click();

  // Clean up the URL object to avoid memory leaks
  URL.revokeObjectURL(saveDataURL);
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

// Utility functions for converting between row/col and x/y coordinates
function getCoordinatesFromRowCol(row, col) {
  return {
    x: (col + 0.25) * (canvas.width / NUM_COLS),
    y: (row + 0.25) * (canvas.height / NUM_ROWS)
  };
}

function getRowColFromCoordinates(x, y) {
  return {
    row: Math.round((y * NUM_ROWS) / canvas.height - 0.25),
    col: Math.round((x * NUM_COLS) / canvas.width - 0.25)
  };
}

function drawLinesFromRowCols() {
  lines.forEach(line => {
    const startCoords = getCoordinatesFromRowCol(line.start.row, line.start.col);
    const endCoords = getCoordinatesFromRowCol(line.end.row, line.end.col);

    const drawnLine = new fabric.Line([startCoords.x + DOT_RADIUS, startCoords.y + DOT_RADIUS, endCoords.x + DOT_RADIUS, endCoords.y + DOT_RADIUS], {
      stroke: 'black',
      strokeWidth: 3,
      originX: 'center',
      originY: 'center',
    });
    canvas.add(drawnLine);
  });
}

/* These are buttons and stuff*/

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

let toggleDotsButton = document.createElement('div');
toggleDotsButton.style.position = 'absolute';
toggleDotsButton.style.bottom = '60px';
toggleDotsButton.style.right = '20px';
toggleDotsButton.style.borderRadius = '10px';
toggleDotsButton.style.backgroundColor = 'lightgray';
toggleDotsButton.style.padding = '10px';
toggleDotsButton.style.cursor = 'pointer';
toggleDotsButton.innerHTML = 'Toggle Dots';
document.body.appendChild(toggleDotsButton);

toggleDotsButton.addEventListener('click', function() {
  dots.forEach(dot => {
    dot.visible = !dot.visible;
  });
  canvas.renderAll();
});

/* 
  Make it touch-compatible: You can use Fabric.js touch event listeners (e.g., 'touch:gesture', 'touch:drag', 'touch:orientation', and 'touch:shake') to handle touch interactions on mobile devices. Refer to the Fabric.js documentation for more details: http://fabricjs.com/events
  Undo/redo functionality: Allow users to undo or redo their actions by maintaining a history of drawn lines and removed lines.

Color selection: Add a color picker so users can choose the color of the lines they draw.

Line thickness: Add a slider to allow users to adjust the thickness of the lines they draw.

Export to image: Allow users to export their canvas as an image (e.g., PNG or JPEG) for easy sharing.

Touch support: Add touch event listeners to make the canvas work smoothly on mobile devices and tablets.

Zoom and pan: Implement zooming and panning functionality to help users navigate large canvases more easily.

Snap to grid: Make lines snap to a grid for more precise drawing.

Text tool: Allow users to add text labels to the canvas.

Import from image: Allow users to import an image and use it as a background for their canvas.

Layer management: Implement layer functionality so users can organize their lines, dots, and other elements in separate layers.
These features can be implemented using Fabric.js's built-in functionality, as well as with additional JavaScript libraries if needed.
*/

