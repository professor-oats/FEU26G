const ghostBlock = document.getElementById("ghost-block");
//let mouseX = 0, mouseY = 0;
const colorPicker = document.getElementById("color-picker");
const canvas = document.getElementById("website-canvas");
const elementType = document.getElementById("element-type");
const editorMode = document.getElementById("editor-mode");

const backgroundType = document.getElementById("background-type");
const solidControls = document.getElementById("solid-controls");
const gradientControls = document.getElementById("gradient-controls");
const paragraphFontSize = document.getElementById("paragraph-font-size");
const fontFamily = document.getElementById("font-family");
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

  if (data.type === "text") {
    element.style.fontFamily = data.fontFamily || "Arial";
    element.style.fontSize = `${data.fontSize || 16}px`;
    element.textContent = data.text || "";
  }

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


// Beginning of the data structure that holds the project element properties

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


function updateEditorMode() {
  const mode = editorMode.value;

  canvas.classList.toggle("place-mode", mode === "place");
  canvas.classList.toggle("move-mode", mode === "move");
  canvas.classList.toggle("paragraph-mode", mode === "paragraph");

  if (mode !== "place") {
    ghostBlock.style.display = "none";
  }

  updateGhost();
}

/*
function updateEditorMode() {
  const isPlaceMode = editorMode.value === "place";

  if (!isPlaceMode) {
    ghostBlock.style.display = "none";
  }

  canvas.classList.toggle("place-mode", isPlaceMode);
  canvas.classList.toggle("move-mode", !isPlaceMode);
  canvas.classList.toggle("paragraph-mode", mode === "paragraph");
}
 */

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
editorMode.addEventListener("change", updateEditorMode);

// Apply the active configuration to the ghost
function updateGhost() {
  if (editorMode.value !== "place") {
    ghostBlock.style.display = "none";
    return;
  }
  ghostBlock.style.width = activeConfig.width + "px";
  ghostBlock.style.height = activeConfig.height + "px";
  ghostBlock.style.background = activeConfig.background;

  ghostBlock.className = activeConfig.className;
}

// Recalculate the required canvas height
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

// Helper function for the paragraphHandler
function applyParagraphTypography() {
  if (!activeParagraphDraft) return;

  const { textarea } = activeParagraphDraft;

  textarea.style.fontFamily = fontFamily.value;
  textarea.style.fontSize = `${paragraphFontSize.value}px`;
}

// Start of ParagraphHandler
let activeParagraphDraft = null;

function beginParagraphDraft(event) {
  // Allow only one unfinished paragraph at a time.
  if (activeParagraphDraft) return;

  const rect = canvas.getBoundingClientRect();

  const draft = document.createElement("div");
  draft.className = "paragraph-draft";

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Write your paragraph...";
  textarea.setAttribute("aria-label", "Paragraph text");

  const actions = document.createElement("div");
  actions.className = "paragraph-draft-actions";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";

  const doneButton = document.createElement("button");
  doneButton.type = "button";
  doneButton.textContent = "Done";

  actions.append(cancelButton, doneButton);
  draft.append(textarea, actions);

  draft.style.left = `${event.clientX - rect.left}px`;
  draft.style.top = `${event.clientY - rect.top}px`;

  canvas.appendChild(draft);

  activeParagraphDraft = { draft, textarea };

  applyParagraphTypography();

  textarea.focus();

  cancelButton.addEventListener("click", () => {
    draft.remove();
    activeParagraphDraft = null;
  });

  doneButton.addEventListener("click", () => {
    const text = textarea.value.trim();

    if (!text) {
      textarea.focus();
      return;
    }

    const elementData = {
      id: crypto.randomUUID(),
      type: "text",
      x: parseFloat(draft.style.left),
      y: parseFloat(draft.style.top),
      width: draft.offsetWidth,
      height: textarea.scrollHeight,
      text,
      fontFamily: fontFamily.value,
      fontSize: Number(paragraphFontSize.value),
      background: "transparent"
    };

    draft.remove();
    activeParagraphDraft = null;

    project.elements.push(elementData);

    undoStack.push({
      type: "place",
      element: { ...elementData }
    });

    limitHistory(undoStack);
    redoStack.length = 0;

    renderElement(elementData);
    updateCanvasHeight();
  });
}

fontFamily.addEventListener("change", applyParagraphTypography);

paragraphFontSize.addEventListener("change", applyParagraphTypography);

// Move the ghost with the cursor
canvas.addEventListener("mousemove", (event) => {
  // Never show the ghost outside Place mode
  if (editorMode.value !== "place" || activeDrag) {
    ghostBlock.style.display = "none";
    return;
  }

  ghostBlock.style.left = event.clientX + "px";
  ghostBlock.style.top = event.clientY + "px";
  ghostBlock.style.display = "block";
});

canvas.addEventListener("mouseleave", () => {
  ghostBlock.style.display = "none";
});


// Helper function to keep stacks in size
function limitHistory(stack) {
  if (stack.length > MAX_HISTORY) {
    stack.shift();
  }
}

// This is our placeHandler

canvas.addEventListener("click", (event) => {
  // Ignore clicks inside the temporary paragraph editor.
  if (event.target.closest(".paragraph-draft")) return;

  // Paragraph mode opens the text editor.
  if (editorMode.value === "paragraph") {
    beginParagraphDraft(event);
    return;
  }

  // Only Place mode can create regular elements.
  if (editorMode.value !== "place") return;

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

  project.elements.push(elementData);

  undoStack.push({
    type: "place",
    element: { ...elementData }
  });

  limitHistory(undoStack);
  redoStack.length = 0;

  renderElement(elementData);
  updateCanvasHeight();
});

/*
canvas.addEventListener("click", (event) => {
  if (editorMode.value !== "place") return;

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
  limitHistory(undoStack);

  // A new action invalidates the redo history
  redoStack.length = 0;

  renderElement(elementData);
  updateCanvasHeight();
});
 */

// Start of our moveHandler
let activeDrag = null;

canvas.addEventListener("mousedown", (event) => {
  if (editorMode.value !== "move") return;

  const element = event.target.closest(".element");

  if (!element || !canvas.contains(element)) return;

  const data = project.elements.find(
    (item) => item.id === element.dataset.id
  );

  if (!data) return;

  event.preventDefault();

  activeDrag = {
    data,
    element,
    startMouseX: event.clientX,
    startMouseY: event.clientY,
    startX: data.x,
    startY: data.y
  };
});

document.addEventListener("mousemove", (event) => {
  if (!activeDrag) return;

  const drag = activeDrag;

  // Calculate movement from the original mouse position
  const dx = event.clientX - drag.startMouseX;
  const dy = event.clientY - drag.startMouseY;

  drag.data.x = drag.startX + dx;
  drag.data.y = drag.startY + dy;

  drag.element.style.left = drag.data.x + "px";
  drag.element.style.top = drag.data.y + "px";
});

document.addEventListener("mouseup", () => {
  if (!activeDrag) return;

  const drag = activeDrag;
  activeDrag = null;

  const moved =
    drag.data.x !== drag.startX ||
    drag.data.y !== drag.startY;

  if (!moved) return;

  undoStack.push({
    type: "move",
    id: drag.data.id,
    before: { x: drag.startX, y: drag.startY },
    after: { x: drag.data.x, y: drag.data.y }
  });

  limitHistory(undoStack);
  redoStack.length = 0;

  updateCanvasHeight();
});

function undoAction() {
  const action = undoStack.pop();

  if (!action) return;

  if (action.type === "place") {
    project.elements = project.elements.filter(
      (element) => element.id !== action.element.id
    );
  }

  if (action.type === "move") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      element.x = action.before.x;
      element.y = action.before.y;
    }
  }

  redoStack.push(action);
  limitHistory(redoStack);
  renderProject();
}

function redoAction() {
  const action = redoStack.pop();

  if (!action) return;

  if (action.type === "place") {
    project.elements.push({ ...action.element });
  }

  if (action.type === "move") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      element.x = action.after.x;
      element.y = action.after.y;
    }
  }

  undoStack.push(action);
  limitHistory(undoStack);
  renderProject();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const target = event.target;

  // Avoid shortcuts while the user is typing text.
  const isTyping =
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA"].includes(target.tagName));

  if (isTyping) return;

  const modifierPressed = event.ctrlKey || event.metaKey;

  if (!modifierPressed) return;

  // Undo: Ctrl+Z or Cmd+Z
  if (key === "z" && !event.shiftKey) {
    event.preventDefault();
    undoAction();
    return;
  }

  // Redo: Ctrl+Y, Cmd+Y, Ctrl+Shift+Z, or Cmd+Shift+Z
  if (key === "y" || (key === "z" && event.shiftKey)) {
    event.preventDefault();
    redoAction();
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
editorMode.value = "place";
updateEditorMode();
updateGhost();
renderProject();