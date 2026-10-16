const ghostBlock = document.getElementById("ghost-block");
//let mouseX = 0, mouseY = 0;
const colorPicker = document.getElementById("color-picker");
const canvas = document.getElementById("website-canvas");
const elementType = document.getElementById("element-type");

const backgroundType = document.getElementById("background-type");
const solidControls = document.getElementById("solid-controls");
const gradientControls = document.getElementById("gradient-controls");

const gradientStart = document.getElementById("gradient-start");
const gradientEnd = document.getElementById("gradient-end");
const gradientDirection = document.getElementById("gradient-direction");

// Configuration for each type of element
const elementConfigs = {
  header: {
    className: "header-block",
    width: 800,
    height: 120,
    background: "#3366ff"
  },

  text: {
    className: "text-block",
    width: 300,
    height: 100,
    background: "#ffffff"
  },

  image: {
    className: "image-block",
    width: 400,
    height: 250,
    background: "#dddddd"
  },

  button: {
    className: "button-block",
    width: 160,
    height: 50,
    background: "#3366ff"
  }
};

function renderElement(data) {
  const config = elementConfigs[data.type];
  const element = document.createElement("div");

  element.classList.add("element", config.className);
  element.dataset.id = data.id;

  element.style.left = data.x + "px";
  element.style.top = data.y + "px";
  element.style.width = data.width + "px";
  element.style.height = data.height + "px";
  element.style.background = data.background;
  element.style.transform = "translate(-50%, -50%)";

  canvas.appendChild(element);
}

function renderProject() {
  canvas.querySelectorAll(".element").forEach((element) => {
    element.remove();
  });

  project.elements.forEach(renderElement);

  updateCanvasHeight();
}

// The element currently being previewed
let activeType = "header";
let activeConfig = elementConfigs[activeType];

// History of placed elements, used for undo
//const placedElements = [];

const project = {
  background: {
    type: "solid",
    color: "#3366ff",
    gradientStart: "#3366ff",
    gradientEnd: "#ff66aa",
    gradientDirection: "to right"
  },
  elements: []
};

const undoStack = [];
const redoStack = [];

const MAX_HISTORY = 10;
const MAX_SNAPSHOTS = 4;
const STORAGE_KEY = "website-builder-saved-versions";

const saveButton = document.getElementById("save-project");
const savedVersions = document.getElementById("saved-versions");
const restoreButton = document.getElementById("restore-project");

function updateBackground() {
  const config = elementConfigs.header;

  if (backgroundType.value === "solid") {
    config.background = colorPicker.value;
  } else {
    config.background =
      `linear-gradient(${gradientDirection.value}, ` +
      `${gradientStart.value}, ${gradientEnd.value})`;
  }

  if (activeType === "header") {
    updateGhost();
  }

  project.background.type = backgroundType.value;
  project.background.color = colorPicker.value;
  project.background.gradientStart = gradientStart.value;
  project.background.gradientEnd = gradientEnd.value;
  project.background.gradientDirection = gradientDirection.value;
}

function updateBackgroundControls() {
  const isGradient = backgroundType.value === "gradient";

  solidControls.hidden = isGradient;
  gradientControls.hidden = !isGradient;

  updateBackground();
}

backgroundType.addEventListener("change", updateBackgroundControls);
colorPicker.addEventListener("input", updateBackground);
gradientStart.addEventListener("input", updateBackground);
gradientEnd.addEventListener("input", updateBackground);
gradientDirection.addEventListener("change", updateBackgroundControls);

// Apply the active configuration to the ghost
function updateGhost() {
  ghostBlock.style.width = activeConfig.width + "px";
  ghostBlock.style.height = activeConfig.height + "px";
  ghostBlock.style.background = activeConfig.background;

  ghostBlock.className = activeConfig.className;
}

// Recalculate the required canvas height
/*
function updateCanvasHeight() {
  const lowestPoint = placedElements.reduce((max, element) => {
    return Math.max(
      max,
      element.offsetTop + element.offsetHeight
    );
  }, window.innerHeight);

  canvas.style.height = lowestPoint + "px";
}
 */

function updateCanvasHeight() {
  const lowestPoint = project.elements.reduce((max, element) => {
    return Math.max(max, element.y + element.height);
  }, window.innerHeight);

  canvas.style.height = lowestPoint + "px";
}

// Update the active element type
elementType.addEventListener("change", () => {
  activeType = elementType.value;
  activeConfig = elementConfigs[activeType];

  updateGhost();

  // Only show the color picker for headers for now
  colorPicker.disabled = activeType !== "header";
});

// Update the header color
colorPicker.addEventListener("input", () => {
  elementConfigs.header.background = colorPicker.value;

  if (activeType === "header") {
    updateGhost();
  }
});

// Move the ghost with the cursor
canvas.addEventListener("mousemove", (event) => {
  ghostBlock.style.left = event.clientX + "px";
  ghostBlock.style.top = event.clientY + "px";
  ghostBlock.style.display = "block";
});

// Hide the ghost when leaving the canvas
canvas.addEventListener("mouseleave", () => {
  ghostBlock.style.display = "none";
});

// Place the active element on click
/*
canvas.addEventListener("click", (event) => {
  const element = document.createElement("div");

  element.classList.add("element", activeConfig.className);

  element.style.width = activeConfig.width + "px";
  element.style.height = activeConfig.height + "px";
  element.style.background = activeConfig.background;

  // Convert viewport coordinates to canvas coordinates
  const rect = canvas.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  element.style.left = x + "px";
  element.style.top = y + "px";
  element.style.transform = "translate(-50%, -50%)";

  canvas.appendChild(element);
  placedElements.push(element);

  // Update document height after placement
  updateCanvasHeight();
});
 */

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();

  const elementData = {
    id: crypto.randomUUID(),
    type: activeType,
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    width: activeConfig.width,
    height: activeConfig.height,
    background: activeConfig.background
  };

  // Add the element to the project data
  project.elements.push(elementData);

  // Record this placement for undo
  undoStack.push({
    type: "place",
    element: { ...elementData }
  });

  // Keep only the latest 10 undo actions
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }

  // A new action invalidates the redo history
  redoStack.length = 0;

  renderElement(elementData);
  updateCanvasHeight();
});

function undoPlacement() {
  const action = undoStack.pop();

  if (!action) return;

  // Remove the element from the project data
  project.elements = project.elements.filter(
    (element) => element.id !== action.element.id
  );

  // Save the action so it can be redone
  redoStack.push(action);

  if (redoStack.length > MAX_HISTORY) {
    redoStack.shift();
  }

  renderProject();
}

function redoPlacement() {
  const action = redoStack.pop();

  if (!action) return;

  // Restore the element to the project data
  project.elements.push({ ...action.element });

  // Record the action back in undo history
  undoStack.push(action);

  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }

  renderProject();
}

// Undo the last placed element with Ctrl+Z / Cmd+Z
/*
document.addEventListener("keydown", (event) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "z"
  ) {
    event.preventDefault();

    const lastElement = placedElements.pop();

    if (lastElement) {
      lastElement.remove();

      // Recalculate height after undo
      updateCanvasHeight();
    }
  }
});
 */

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  // Don't intercept shortcuts while typing in form controls
  const target = event.target;
  const isEditing =
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (isEditing) return;

  if ((event.ctrlKey || event.metaKey) && key === "z") {
    event.preventDefault();
    undoPlacement();
  }

  if ((event.ctrlKey || event.metaKey) && key === "y") {
    event.preventDefault();
    redoPlacement();
  }
});

function getSavedVersions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function loadSavedVersions() {
  const versions = getSavedVersions();

  savedVersions.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a saved version";
  savedVersions.appendChild(placeholder);

  versions.forEach((version) => {
    const option = document.createElement("option");
    option.value = version.id;
    option.textContent = version.name;
    savedVersions.appendChild(option);
  });
}

function saveProjectVersion() {
  const versions = getSavedVersions();

  const snapshot = {
    id: crypto.randomUUID(),
    name: new Date().toLocaleString(),
    project: JSON.parse(JSON.stringify(project))
  };

  versions.push(snapshot);

  // Keep only the four most recently saved versions
  const limitedVersions = versions.slice(-MAX_SNAPSHOTS);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(limitedVersions)
  );

  loadSavedVersions();
  savedVersions.value = snapshot.id;
}

function restoreProjectVersion() {
  const selectedId = savedVersions.value;

  if (!selectedId) {
    alert("Please choose a saved version first.");
    return;
  }

  const version = getSavedVersions().find(
    (item) => item.id === selectedId
  );

  if (!version) {
    alert("Saved version not found.");
    return;
  }

  // Restore a separate copy of the saved project
  project.background = { ...version.project.background };
  project.elements = version.project.elements.map((element) => ({
    ...element
  }));

  // Restore the background controls
  backgroundType.value = project.background.type;
  colorPicker.value = project.background.color;
  gradientStart.value = project.background.gradientStart;
  gradientEnd.value = project.background.gradientEnd;
  gradientDirection.value = project.background.gradientDirection;

  // Reset history because we're switching to another project state
  undoStack.length = 0;
  redoStack.length = 0;

  // Refresh the background and canvas
  updateBackgroundControls();
  updateGhost();
  renderProject();
}

saveButton.addEventListener("click", saveProjectVersion);
restoreButton.addEventListener("click", restoreProjectVersion);

// Initialize the ghost
loadSavedVersions();
updateBackgroundControls();
updateGhost();
renderProject();