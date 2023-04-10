// Create canvas
let canvas = new fabric.Canvas('canvas');
canvas.setWidth(window.innerWidth);
canvas.setHeight(window.innerHeight);
canvas.selection = false;
canvas.perPixelTargetFind = true;

// Initialize slider elements
const sliderRows = document.getElementById('rows');
const sliderCols = document.getElementById('cols');
const sliderRowsValue = document.getElementById('rows-value');
const sliderColsValue = document.getElementById('cols-value');
const settingsBtn = document.getElementById('settings-btn');
const settingsWindow = document.getElementById('settings-window');

// Set default values for dot and grid properties
let NUM_ROWS = 5;
let NUM_COLS = 5;
sliderRowsValue.textContent = NUM_ROWS;
sliderColsValue.textContent = NUM_COLS;

// Initialize lines and dots arrays
let lines = [];
let line = null;
let startDot = null;
let dots = [];
load = false;

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

settingsBtn.addEventListener('click', () => {
  const currentDisplay = settingsWindow.style.display;
  settingsWindow.style.display = currentDisplay === 'none' ? 'block' : 'none';
});

lines = [];
// Update dots on the canvas
function updateDots() {
  canvas.clear();
  dots = [];
  
  // Loop through all the lines on the canvas and remove them
  canvas.getObjects('line').forEach(function(line) {
    canvas.remove(line);
  });

  // Calculate the radius of the dots based on the number of rows and columns
  DOT_RADIUS = Math.min(canvas.width / NUM_COLS, canvas.height / NUM_ROWS) / 8;

  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      let dot = new fabric.Circle({
        left: (col + 0.25) * (canvas.width / NUM_COLS),
        top: (row + 0.25) * (canvas.height / NUM_ROWS),
        cx: (col + 0.25) * (canvas.width / NUM_COLS) + DOT_RADIUS + 0.5,
        cy: (row + 0.25) * (canvas.height / NUM_ROWS) + DOT_RADIUS + 0.5,
        row: row,
        col: col,
        radius: DOT_RADIUS,
        fill: 'blue',
        selectable: false,
        hoverCursor: 'pointer',
        opacity: 0.3
      });
      dots.push(dot);
      canvas.add(dot);
    }
  }

  lines.forEach(lineData => {
    wawa = dots.find(dot => dot.row == lineData.startDot.row && dot.col == lineData.startDot.col );
    dada = dots.find(dot => dot.row == lineData.endDot.row && dot.col == lineData.endDot.col );
    lmao = new fabric.Line([wawa.cx, wawa.cy, dada.cx, dada.cy], { 
      stroke: 'black',
      strokeWidth: 3,
      originX: 'center',
      originY: 'center',
      startDot: wawa,
      endDot: dada
    });
    console.log(lmao);
    canvas.add(lmao);
  });
}

updateDots();

// Function to toggle background color
function toggleBackgroundColor() {
  const currentBgColor = canvas.backgroundColor;
  const newBgColor = currentBgColor === 'white' ? 'lightgray' : 'white';
  canvas.setBackgroundColor(newBgColor, canvas.renderAll.bind(canvas));
}
 
// Function to toggle dots visibility
function toggleDotsVisibility() {
  dots.forEach(dot => {
    dot.visible = !dot.visible;
  });
  canvas.renderAll();
}

// Add touch event listeners to make the canvas work smoothly on mobile devices and tablets
canvas.on('touch:start', function(event) {
  load = false
  let target = event.target;
  if (target instanceof fabric.Circle) {
    // Clicked on a dot
    startDot = target;
    let center = startDot.getCenterPoint();
    line = new fabric.Line([center.x, center.y, center.x, center.y], {
      stroke: 'black',
      strokeWidth: 3,
      x1: center.x,
      y1: center.y
    });
    line.startDot = getRowColFromCoordinates(startDot.left, startDot.top);
    line.me = startDot // Set the 'startDot' property
    lines.push(line); // Push the line into the 'lines' array
    canvas.add(line);
  }
  });

canvas.on('touch:move', function(event) {
  if (load == true) {
    return;
  }
  if (line !== null) {
    let mouse = canvas.getPointer(event.e);
    line.set({ x2: mouse.x, y2: mouse.y });
    canvas.renderAll();
  }
}); 

canvas.on('touch:end', function(event) {
  if (line !== null) {
    let target = event.target;
    if (target instanceof fabric.Circle && target !== line.me) {
      // Released over another dot
      let center = target.getCenterPoint();
      line.set({ x2: center.x, y2: center.y });
      line.endDot = getRowColFromCoordinates(target.left, target.top); // Set the 'endDot' property
    } else {
      // Released outside a dot
      canvas.remove(line);
      lines.pop();
    }
    line = null;
    startDot = null;
  }
});



canvas.on('mouse:down', event => {
  load = false
  let target = event.target;
  if (target instanceof fabric.Circle) {
    // Clicked on a dot
    startDot = target;
    let center = startDot.getCenterPoint();
    line = new fabric.Line([center.x, center.y, center.x, center.y], {
      stroke: 'black',
      strokeWidth: 3,
      x1: center.x,
      y1: center.y
    });
    line.startDot = getRowColFromCoordinates(startDot.left, startDot.top);
    line.me = startDot // Set the 'startDot' property
    lines.push(line); // Push the line into the 'lines' array
    canvas.add(line);
  }
});

canvas.on('mouse:move', event => {
  if (load == true) {
    return;
  }
  if (line !== null) {
    let mouse = canvas.getPointer(event.e);
    line.set({ x2: mouse.x, y2: mouse.y });
    canvas.renderAll();
  }
}); 

canvas.on('mouse:up', event => {
  if (line !== null) {
    let target = event.target;
    if (target instanceof fabric.Circle && target !== line.me) {
      // Released over another dot
      let center = target.getCenterPoint();
      line.set({ x2: center.x, y2: center.y });
      line.endDot = getRowColFromCoordinates(target.left, target.top); // Set the 'endDot' property
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

  if (event.key === 'i' || event.key === 'I') {
    toggleDotsVisibility();
  }

  if (event.key === 'b' || event.key === 'B') {
    toggleBackgroundColor();
  }
});


// Add a click event listener to the remove button
document.getElementById('rmv-btn').addEventListener('click', function() {
  localStorage.removeItem('dotBoard');

  // Loop through all the lines on the canvas and remove them
  canvas.getObjects('line').forEach(function(line) {
    canvas.remove(line);
  });
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

// Save button event listener
document.getElementById('save-btn').addEventListener('click', () => {
  // Get all the line objects on the canvas
  const lineObjects = canvas.getObjects('line');

  // If there are no lines on the canvas, do nothing
  if (lineObjects.length === 0) {
    return;
  }

  // Prepare lines data to save only relevant properties
  const preparedLines = lineObjects.map(line => {
    const startDotRowCol = line.startDot;
    const endDotRowCol = line.endDot;
    return { start: startDotRowCol, end: endDotRowCol };
  });

  const version = '4/10M scaled lines'

  // Construct the data to be saved
  const saveData = {
    rows: NUM_ROWS,
    cols: NUM_COLS,
    lines: preparedLines,
    vers: version
  };

  /*
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
  */
  localStorage.setItem('dotBoard', JSON.stringify(saveData));

  // Show the custom message element when the board is saved successfully
  const saveMessage = document.getElementById('save-message');
  saveMessage.style.display = 'block';

  // Hide the message after 3 seconds (3000 milliseconds)
  setTimeout(() => {
    saveMessage.style.display = 'none';
  }, 3000);
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
    //row: parseFloat((y * NUM_ROWS) / canvas.height - 0.25),
    //col: parseFloat((x * NUM_COLS) / canvas.width - 0.25)
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

// Load saved data from localStorage (if any)
function loadSavedData() {
  const savedDataString = localStorage.getItem('dotBoard');
  if (!savedDataString) {
    return; // No saved data found
  }

  const savedData = JSON.parse(savedDataString);

  // Set up the proper rows and columns
  NUM_ROWS = savedData.rows;
  NUM_COLS = savedData.cols;

  // Update sliders
  sliderRows.value = NUM_ROWS;
  sliderCols.value = NUM_COLS;
  sliderRowsValue.textContent = NUM_ROWS;
  sliderColsValue.textContent = NUM_COLS;

  // Clear existing board and generate a new one
  updateDots();

  // Set up lines (if any)
  savedData.lines.forEach(lineData => {
    const startDot = dots.find(dot => dot.row == lineData.start.row & dot.col == lineData.start.col );
    const endDot = dots.find(dot => dot.row == lineData.end.row & dot.col == lineData.end.col );
    line = new fabric.Line([startDot.cx, startDot.cy, endDot.cx, endDot.cy], {
      stroke: 'black',
      strokeWidth: 3,
      originX: 'center',
      originY: 'center',
      startDot: lineData.start,
      endDot: lineData.end
    });
    line.set({ x2: endDot.cx, y2: endDot.cy });
    lines.push(line); 
    canvas.add(line);
  });
  load = true
}

loadSavedData();


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

