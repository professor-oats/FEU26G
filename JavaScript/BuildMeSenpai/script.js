// MAIN DECLARATIONS
const ghostBlock = document.getElementById("ghost-block");
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
const selectionOverlay = document.getElementById("selection-overlay");

const backgroundControls = document.getElementById("background-controls");
const fontFamilyControls = document.getElementById("font-family-controls");
const fontSizeControls = document.getElementById("font-size-controls");
const textControls = document.getElementById("text-controls");

const paddingControls = document.getElementById("padding-controls");
const paddingX = document.getElementById("padding-x");
const paddingY = document.getElementById("padding-y");
const paddingXValue = document.getElementById("padding-x-value");
const paddingYValue = document.getElementById("padding-y-value");
const paddingCss = document.getElementById("padding-css");
const applyPaddingCssButton = document.getElementById("apply-padding-css");
const paddingCssError = document.getElementById("padding-css-error");

/* controls */
const colorControls = document.getElementById("color-controls");
const imageControls = document.getElementById("image-controls");
const drawControls = document.getElementById("draw-controls");

const drawColor = document.getElementById("draw-color");
const drawWidth = document.getElementById("draw-width");
const drawAnimate = document.getElementById("draw-animate");
const drawFinish = document.getElementById("draw-finish");

const drawPaintMode = document.getElementById("draw-paint-mode");
const drawSolidLabel = document.getElementById("draw-solid-label");
const drawGradientControls = document.getElementById("draw-gradient-controls");
const drawStopsBox = document.getElementById("draw-stops");
const drawAddStop = document.getElementById("draw-add-stop");
const drawRainbow = document.getElementById("draw-rainbow");
const drawHard = document.getElementById("draw-hard");
const drawSessionControls = document.getElementById("draw-session-controls");

const imageUpload = document.getElementById("image-upload");
const imageWidth = document.getElementById("image-width");
const imageHeight = document.getElementById("image-height");
const lockImageAspect = document.getElementById("lock-image-aspect");

const exportButton = document.getElementById("export-project");
const importButton = document.getElementById("import-project");
const importInput = document.getElementById("import-project-input");
const exportHtmlButton = document.getElementById("export-html");

const WEBSON_FORMAT = "webson";
const WEBSON_VERSION = 2;

// EVENT LISTENERS
backgroundType.addEventListener("change", updateBackgroundControls);
gradientStart.addEventListener("input", updateBackground);
gradientEnd.addEventListener("input", updateBackground);
gradientDirection.addEventListener("change", updateBackground);
// gradientDirection.addEventListener("change", updateBackgroundControls);

paddingX.addEventListener("input", handlePaddingXChange);
paddingY.addEventListener("input", handlePaddingYChange);
applyPaddingCssButton.addEventListener("click", handleApplyPaddingCss);

/* Image upload related listeners */

let uploadedImage = null;
let imageAspectRatio = null;

imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      uploadedImage = reader.result;

      imageAspectRatio = img.naturalWidth / img.naturalHeight;

      const width = 320;
      const height = Math.round(width / imageAspectRatio);

      imageWidth.value = width;
      imageHeight.value = height;

      activeConfig.width = width;
      activeConfig.height = height;
      // activeConfig.background = `url("${uploadedImage}")`;
      activeConfig.background = "transparent";
      activeConfig.className = "ghost-block image-preview";

      updateGhost();
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
});

imageWidth.addEventListener("input", () => {
  const width = Number(imageWidth.value);

  if (!width || width < 1) return;

  activeConfig.width = width;

  if (lockImageAspect.checked && imageAspectRatio) {
    const height = Math.round(width / imageAspectRatio);

    imageHeight.value = height;
    activeConfig.height = height;
  }

  updateGhost();
});

imageHeight.addEventListener("input", () => {
  const height = Number(imageHeight.value);

  if (!height || height < 1) return;

  activeConfig.height = height;

  if (lockImageAspect.checked && imageAspectRatio) {
    const width = Math.round(height * imageAspectRatio);

    imageWidth.value = width;
    activeConfig.width = width;
  }

  updateGhost();
});

/* colorPicker listener */

colorPicker.addEventListener("input", () => {
  // EDIT MODE
  if (editorMode.value === "edit" && selectedElementId) {
    const target = getColorTarget();

    if (target === "color") {
      updateSelectedElementProperty("color", colorPicker.value);
    } else {
      updateBackground();
    }
    return;
  }

  // PLACE MODE
  if (editorMode.value === "place") {
    updateBackground();
  }
});


editorMode.addEventListener("change", () => {
  if (editorMode.value === "place") {
    activeType = elementType.value;

    if (activeType !== "image") {
      activeConfig = { ...elementConfigs[activeType] };
      syncPaintControlsTo(activeConfig, activeType);
    }
  }

  updateEditorMode();
  updateToolbarForSelection();
});

const toggleSmartGuidesButton = document.getElementById(
  "toggle-smart-guides"
);

toggleSmartGuidesButton.addEventListener("click", () => {
  smartGuidesEnabled = !smartGuidesEnabled;

  toggleSmartGuidesButton.textContent = smartGuidesEnabled
    ? "Smart Guides: On"
    : "Smart Guides: Off";

  toggleSmartGuidesButton.setAttribute(
    "aria-pressed",
    String(smartGuidesEnabled)
  );

  if (!smartGuidesEnabled) {
    hideAlignmentGuides();
  }
});

// Configuration for each type of element
const elementConfigs = {
  header: {
    className: "header-block",
    width: 800,
    height: 120,
    background: "#3366ff",
    editableProperties: ["background", "color"]
  },

  text: {
    className: "text-block",
    width: 300,
    height: 100,
    background: "transparent",
    color: "#000000",
    editableProperties: [
      "color",
      "background",
      "fontFamily",
      "fontSize",
      "text",
      "padding"
    ]
  },

  image: {
    className: "image-block",
    width: 400,
    height: 250,
    background: "#dddddd",
    editableProperties: ["background"]
  },

  button: {
    className: "button-block",
    width: 160,
    height: 50,
    background: "#3366ff",
    color: "#ffffff",
    editableProperties: ["background", "color", "text", "fontFamily", "fontSize", "padding"]
  },

  drawing: {
    className: "drawing-block",
    width: 100,
    height: 100,
    background: "transparent",
    editableProperties: [] // drawing has its own toolbar + editing properties
  },

  audio: {
    className: "audio-block",
    width: 480,
    height: 160,
    background: "#0b1020",
    color: "#33ccff",
    editableProperties: ["background", "color"]
  }
};

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


/* Map elementsById and data index related functions */
/* Separate functions for store operations parallel to project array data as source of truth */

const elementsById = new Map();
const domById = new Map();

function getElementData(id) {
  return elementsById.get(id) ?? null;
}

function rebuildIndex() {
  elementsById.clear();
  for (const data of project.elements) elementsById.set(data.id, data);
}

function storeInsert(data, index = project.elements.length) {
  project.elements.splice(index, 0, data);
  elementsById.set(data.id, data);
}

// Returns the index the element had, or -1.
function storeRemove(id) {
  const index = project.elements.findIndex((e) => e.id === id);
  if (index === -1) return -1;
  project.elements.splice(index, 1);
  elementsById.delete(id);
  return index;
}

function storeMove(id, toIndex) {
  const from = project.elements.findIndex((e) => e.id === id);
  if (from === -1) return;
  const [item] = project.elements.splice(from, 1);
  project.elements.splice(toIndex, 0, item);
}

function storeReplaceAll(list) {
  project.elements = list;
  rebuildIndex();
}

// GENERAL HELPER FUNCTIONS HERE FOR NOW
// Helper function to get dynamic for Paragraph Height
const paragraphMeasurer = document.createElement("div");

Object.assign(paragraphMeasurer.style, {
  position: "absolute",
  visibility: "hidden",
  left: "-100000px",
  top: "0",
  boxSizing: "border-box",
  lineHeight: "1.5",
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap"
});

document.body.appendChild(paragraphMeasurer);

const paragraphHeightCache = new Map();

function measureParagraphHeight(data) {
  return measureTextElementHeight(data);
}

function measureTextElementHeight(data) {
  const p = getParagraphPadding(data);
  const fontFamilyValue = data.fontFamily || "Arial";
  const fontSizeValue = data.fontSize || 16;

  const key = JSON.stringify([
    data.width, fontFamilyValue, fontSizeValue,
    p.top, p.right, p.bottom, p.left, data.text || ""
  ]);

  const cached = paragraphHeightCache.get(key);
  if (cached !== undefined) return cached;

  const style = paragraphMeasurer.style;
  style.width = `${data.width}px`;
  style.fontFamily = fontFamilyValue;
  style.fontSize = `${fontSizeValue}px`;
  style.padding = `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
  paragraphMeasurer.textContent = data.text || "";

  const height = paragraphMeasurer.scrollHeight;

  if (paragraphHeightCache.size > 500) paragraphHeightCache.clear();
  paragraphHeightCache.set(key, height);

  return height;
}

function createGradientValue(direction, start, end) {
  return `linear-gradient(${direction}, ${start}, ${end})`;
}

function isGradientValue(value) {
  return typeof value === "string" &&
    value.startsWith("linear-gradient(");
}

function applyParagraphTextColor(element, data) {
  let textContent = element.querySelector(".text-content");

  if (!textContent) {
    textContent = document.createElement("span");
    textContent.className = "text-content";
    element.appendChild(textContent);
  }

  if (isGradientValue(data.color)) {
    textContent.style.color = "transparent";
    textContent.style.backgroundImage = data.color;
    textContent.style.backgroundClip = "text";
    textContent.style.webkitBackgroundClip = "text";
    textContent.style.webkitTextFillColor = "transparent";
  } else {
    textContent.style.backgroundImage = "none";
    textContent.style.color = data.color || "#000000";
    textContent.style.webkitTextFillColor =
      data.color || "#000000";
  }
}

function setActiveElementType(type) {

  if (!elementConfigs[type]) {
    console.warn(`Unknown element type "${type}"`);
    return;
  }

  activeType = type;

  // Always create a fresh copy of the default configuration.
  activeConfig = {
    ...elementConfigs[type]
  };

  // Reset image-specific state when switching element types.
  if (type !== "image") {
    uploadedImage = null;
    imageAspectRatio = null;
  }

  // Update the ghost preview.
  updateGhost();
}

function renderElement(data, parent = canvas) {
  const config = elementConfigs[data.type];

  if (!config) {
    console.warn("Cannot render unknown type:", data.type);
    return;
  }

  const element = document.createElement("div");

  element.classList.add("element", ...config.className.split(/\s+/));
  element.dataset.id = data.id;

  element.style.left = data.x + "px";
  element.style.top = data.y + "px";
  element.style.width = data.width + "px";

  /*
  element.style.height =
    data.type === "text"
      ? `${measureParagraphHeight(data)}px`
      : `${data.height}px`;

   */

  if (data.type === "text" || data.type === "button") {
    element.style.height = `${measureParagraphHeight(data)}px`;
  }
  else {
    element.style.height = `${data.height}px`;
  }

  element.style.background = data.background || "transparent";
  element.style.transform = "translate(-50%, -50%)";

  if (data.type === "text") {
    element.style.fontFamily = data.fontFamily || "Arial";
    element.style.fontSize = `${data.fontSize || 16}px`;
    element.style.boxSizing = "border-box";
    element.style.whiteSpace = "pre-wrap";
    element.style.overflowWrap = "break-word";
    element.style.lineHeight = "1.5";
    element.style.textAlign = "left";
    element.style.display = "block";

    const p = getParagraphPadding(data);

    element.style.padding =
      `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;

    const textContent = document.createElement("span");
    textContent.className = "text-content";
    textContent.style.display = "block";
    textContent.textContent = data.text || "";

    element.appendChild(textContent);

    applyParagraphTextColor(element, data);
  }


  if (data.type === "image") {

    element.style.background = "transparent";
    element.style.overflow = "hidden";

    const img = document.createElement("img");

    img.src = data.imageData;
    img.alt = data.alt || "Uploaded image";

    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = data.objectFit || "fill";
    img.style.display = "block";

    element.appendChild(img);
  }

  if (data.type === "button") {
    applyButtonLook(element, data);

    // Project padding overrides preset padding.
    applyElementPadding(element, data);
  }

  if (data.type === "drawing") applyDrawingLook(element, data);

  if (data.type === "audio") applyAudioLook(element, data);

  // TODO see if we will sync height of more elements than text, like drawing or the hasTextContent
  // Keep the data's height in sync with what was actually rendered.
  if (data.type === "text") data.height = parseFloat(element.style.height);

  domById.set(data.id, element);
  parent.appendChild(element);

}

// Targeted render of element
function updateRenderedElement(data, changedProperties = null) {
  const element = domById.get(data.id);

  // Recovery path if the element is missing from the canvas.
  if (!element) {
    reconcileCanvas();
    return;
  }


  const updateAll = changedProperties === null;

  const changed = (property) =>
    updateAll || changedProperties.includes(property);

  const isText = data.type === "text";
  const isButton = data.type === "button";

  const hasTextContent = isText || isButton;

  const affectsTextLayout =
    hasTextContent &&
    (
      changed("size") ||
      changed("width") ||
      changed("fontSize") ||
      changed("fontFamily") ||
      changed("text") ||
      changed("padding")
    );

  // Position
  if (changed("position")) {
    element.style.left = `${data.x}px`;
    element.style.top = `${data.y}px`;
  }

  // Size
  if (changed("size") || changed("width")) {
    element.style.width = `${data.width}px`;
  }

  if (hasTextContent && affectsTextLayout) {
    data.height = measureParagraphHeight(data);
    element.style.height = `${data.height}px`;
  } else if (!hasTextContent && (changed("size") || changed("height"))) {
    element.style.height = `${data.height}px`;
  }

  // Background belongs to the outer element.
  if (changed("background")) {
    element.style.background = data.background || "transparent";
  }

  // Text-specific appearance.
  if (hasTextContent) {
    if (changed("fontFamily")) {
      element.style.fontFamily = data.fontFamily || "Arial";
    }

    if (changed("fontSize")) {
      element.style.fontSize = `${data.fontSize || 16}px`;
    }

    if (changed("padding")) {
      applyElementPadding(element, data);
    }
    // Make sure the text span exists.
    let textContent = element.querySelector(".text-content");

    if (!textContent) {
      textContent = document.createElement("span");
      textContent.className = "text-content";
      textContent.style.display = "block";
      element.appendChild(textContent);
    }

    // Text color belongs to the inner text span.
    if (changed("color")) {
      applyParagraphTextColor(element, data);
      textContent = element.querySelector(".text-content");
    }

    // Update the actual paragraph text.
    if (changed("text")) {
      textContent.textContent = data.text || "";
    }
  }

  if (data.type === "button") {
    applyButtonLook(element, data);

    // Project padding overrides preset padding.
    applyElementPadding(element, data);
  }

  if (data.type === "drawing" && changed("strokes")) {
    applyDrawingLook(element, data);
  }

  if (data.type === "audio") applyAudioLook(element, data);

  // Only refresh canvas geometry when dimensions may have changed.
  if (
    changed("size") ||
    changed("width") ||
    changed("height") ||
    affectsTextLayout
  ) {
    updateCanvasHeight();
    updateSelectionOverlay();
  } else if (changed("position")) {
    updateSelectionOverlay();
  }

}


let selectedElementId = null;
let activeResize = null;
let smartGuidesEnabled = true;

selectionOverlay.id = "selection-overlay";
selectionOverlay.hidden = true;

const resizeHandles = {};

["nw", "ne", "sw", "se"].forEach((corner) => {
  const handle = document.createElement("div");
  handle.className = "resize-handle";
  handle.dataset.corner = corner;

  selectionOverlay.appendChild(handle);
  resizeHandles[corner] = handle;
});

canvas.appendChild(selectionOverlay);

const PEN_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/>' +
  '<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';

const CHECK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" ' +
  'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

const textEditButton = document.createElement("button");
textEditButton.type = "button";
textEditButton.className = "overlay-action";
textEditButton.hidden = true;
selectionOverlay.appendChild(textEditButton);

function setTextEditIcon(editing) {
  textEditButton.innerHTML = editing ? CHECK_SVG : PEN_SVG;
  textEditButton.classList.toggle("is-editing", editing);
  textEditButton.title = editing ? "Done editing text" : "Edit text";
  textEditButton.setAttribute("aria-label", textEditButton.title);
}

setTextEditIcon(false);

let textEdit = null; // { id, node, abort }

function insertPlainText(text) {
  document.execCommand("insertText", false, text);
}

function startTextEdit() {
  if (textEdit || editorMode.value !== "edit") return;

  const data = getSelectedData();
  if (!data || data.type !== "text") return;

  const node = domById.get(data.id)?.querySelector(".text-content");
  if (!node) return;

  const abort = new AbortController();
  const { signal } = abort;
  textEdit = { id: data.id, node, abort };

  node.contentEditable = "true";
  node.spellcheck = false;
  node.style.userSelect = "text";
  node.style.cursor = "text";
  node.style.outline = "none";
  node.style.caretColor = "#111"; // gradient text has a transparent color

  // Keep the box and outline growing with the text.
  node.addEventListener("input", () => {
    const height = measureParagraphHeight({ ...data, text: node.innerText });

    data.height = height;
    domById.get(data.id).style.height = `${height}px`;
    updateSelectionOverlay();
    updateCanvasHeight();
  }, { signal });

  node.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      endTextEdit(false);
    } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      endTextEdit(true);
    } else if (event.key === "Enter") {
      event.preventDefault();
      insertPlainText("\n"); // never let the browser insert <div>/<br>
    }
  }, { signal });

  // Paste as plain text only.
  node.addEventListener("paste", (event) => {
    event.preventDefault();
    insertPlainText(event.clipboardData.getData("text/plain"));
  }, { signal });

  setTextEditIcon(true);

  // Caret at the end of the text.
  node.focus();
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

// commit = true saves as one undo step; false restores the old text.
function endTextEdit(commit) {
  if (!textEdit) return;

  const { id, node, abort } = textEdit;
  textEdit = null;
  abort.abort();

  const raw = node.innerText;

  node.removeAttribute("contenteditable");
  node.style.userSelect = "";
  node.style.cursor = "";
  node.style.outline = "";
  node.style.caretColor = "";
  window.getSelection()?.removeAllRanges();
  setTextEditIcon(false);

  const data = getElementData(id);
  if (!data) return;

  const value = normalizeParagraphText(raw);

  // Empty text is not allowed, so it falls back to the old text.
  if (commit && value && value !== data.text) {
    const before = data.text;
    data.text = value;

    undoStack.push({ type: "property", id, property: "text", before, after: value });
    limitHistory(undoStack);
    redoStack.length = 0;
  }

  // Rebuild the node text and re-measure the height from the stored text.
  updateRenderedElement(data, ["text"]);
}

// Stop these mouse events before the canvas sees them, and keep focus.
textEditButton.addEventListener("mousedown", (event) => {
  event.preventDefault();
  event.stopPropagation();
});

textEditButton.addEventListener("click", (event) => {
  event.stopPropagation();
  if (textEdit) endTextEdit(true);
  else startTextEdit();
});


/* SMART ALIGNMENT GUIDES */

const alignmentGuideOverlay = document.createElement("div");
alignmentGuideOverlay.id = "alignment-guide-overlay";

const verticalGuide = document.createElement("div");
verticalGuide.className = "alignment-guide vertical-guide";

const horizontalGuide = document.createElement("div");
horizontalGuide.className = "alignment-guide horizontal-guide";

alignmentGuideOverlay.append(verticalGuide, horizontalGuide);
canvas.appendChild(alignmentGuideOverlay);

function hideAlignmentGuides() {
  verticalGuide.style.display = "none";
  horizontalGuide.style.display = "none";
}

function showAlignmentGuide(guide, position, start, end) {
  guide.style.display = "block";

  if (guide === verticalGuide) {
    guide.style.left = `${position}px`;
    guide.style.top = `${start}px`;
    guide.style.height = `${Math.max(1, end - start)}px`;
  } else {
    guide.style.left = `${start}px`;
    guide.style.top = `${position}px`;
    guide.style.width = `${Math.max(1, end - start)}px`;
  }
}

// Element positions use their center because of translate(-50%, -50%).
function getElementBounds(data) {
  return {
    left: data.x - data.width / 2,
    right: data.x + data.width / 2,
    top: data.y - data.height / 2,
    bottom: data.y + data.height / 2,
    centerX: data.x,
    centerY: data.y
  };
}

// Find the closest edge or center alignment on one axis.
let snapCache = null;

function getSnapTargets(movingId) {
  if (snapCache?.id === movingId) return snapCache.targets;

  const targets = [];

  for (const data of project.elements) {
    if (data.id === movingId) continue;

    const b = getElementBounds(data);
    targets.push({
      data,
      x: [b.left, b.centerX, b.right],
      y: [b.top, b.centerY, b.bottom]
    });
  }

  snapCache = { id: movingId, targets };
  return targets;
}

function findClosest(movingValues, axis, movingId) {
  const threshold = 6;
  let best = null;

  for (const target of getSnapTargets(movingId)) {
    for (const movingValue of movingValues) {
      for (const targetValue of target[axis]) {
        const delta = targetValue - movingValue;
        const distance = Math.abs(delta);

        if (distance <= threshold && (!best || distance < best.distance)) {
          best = {
            delta,
            distance,
            position: targetValue,
            targetData: target.data
          };
        }
      }
    }
  }

  return best;
}

function findBestAlignment(movingData, axis) {
  const m = getElementBounds(movingData);

  return findClosest(
    axis === "x"
      ? [m.left, m.centerX, m.right]
      : [m.top, m.centerY, m.bottom],
    axis,
    movingData.id
  );
}

function findBestResizeAlignment(movingData, axis, edge) {
  return findClosest(
    [getElementBounds(movingData)[edge]],
    axis,
    movingData.id
  );
}


function updateAlignmentGuides(movingData, xMatch, yMatch) {
  hideAlignmentGuides();

  if (xMatch) {
    const moving = getElementBounds(movingData);
    const target = getElementBounds(xMatch.targetData);

    // Connect the nearest vertical edges when possible.
    let start;
    let end;

    if (moving.bottom < target.top) {
      start = moving.bottom;
      end = target.top;
    } else if (target.bottom < moving.top) {
      start = target.bottom;
      end = moving.top;
    } else {
      start = Math.min(moving.top, target.top);
      end = Math.max(moving.bottom, target.bottom);
    }

    showAlignmentGuide(
      verticalGuide,
      xMatch.position,
      start,
      end
    );
  }

  if (yMatch) {
    const moving = getElementBounds(movingData);
    const target = getElementBounds(yMatch.targetData);

    // Connect the nearest horizontal edges when possible.
    let start;
    let end;

    if (moving.right < target.left) {
      start = moving.right;
      end = target.left;
    } else if (target.right < moving.left) {
      start = target.right;
      end = moving.left;
    } else {
      start = Math.min(moving.left, target.left);
      end = Math.max(moving.right, target.right);
    }

    showAlignmentGuide(
      horizontalGuide,
      yMatch.position,
      start,
      end
    );
  }
}

function getSelectedData() {
  return selectedElementId ? getElementData(selectedElementId) : null;
}

function updateSelectionOverlay() {
  if (editorMode.value !== "edit" || !selectedElementId) {
    selectionOverlay.hidden = true;
    return;
  }

  const data = getElementData(selectedElementId);

  if (!data) {
    selectionOverlay.hidden = true;
    return;
  }

  selectionOverlay.style.left = `${data.x}px`;
  selectionOverlay.style.top = `${data.y}px`;
  selectionOverlay.style.width = `${data.width}px`;
  selectionOverlay.style.height = `${data.height}px`;
  textEditButton.hidden = data.type !== "text";
  selectionOverlay.hidden = false;
}

// TODO check the broken parameter to renderElement
function renderProject() {
  domById.forEach((node) => node.remove());
  domById.clear();

  // Arrow function: forEach would pass the index as the second argument.
  const fragment = document.createDocumentFragment();
  project.elements.forEach((data) => renderElement(data, fragment));
  canvas.appendChild(fragment);

  updateCanvasHeight();
  updateSelectionOverlay();
}

function reconcileCanvas() {
  // 1. Create nodes for new data.
  for (const data of project.elements) {
    if (!domById.has(data.id)) renderElement(data);
  }

  // 2. Remove nodes whose data is gone (deleting during iteration is safe).
  for (const [id, node] of domById) {
    if (!elementsById.has(id)) {
      node.remove();
      domById.delete(id);
    }
  }

  // 3. Fix stacking order with the fewest DOM moves: walk backwards and
  //    only move a node if it isn't already right before its successor.
  let next = null;
  for (let i = project.elements.length - 1; i >= 0; i--) {
    const node = domById.get(project.elements[i].id);
    if (next && node.nextElementSibling !== next) {
      canvas.insertBefore(node, next);
    }
    next = node;
  }

  updateCanvasHeight();
  updateSelectionOverlay();
}

// The element currently being previewed
// This will be changed dynamically with drop down event "change"

let activeType = elementType.value;
let activeConfig = elementConfigs[activeType];


function updateEditorMode() {
  const mode = editorMode.value;

  canvas.classList.toggle("place-mode", mode === "place");
  canvas.classList.toggle("move-mode", mode === "move");
  canvas.classList.toggle("edit-mode", mode === "edit");
  canvas.classList.toggle("draw-mode", mode === "place" && activeType === "drawing");

  if (mode !== "place") {
    cancelDrafts();
    ghostBlock.style.display = "none";
  }

  if (mode !== "move") {
    hideAlignmentGuides();
  }

  if (mode !== "edit") endTextEdit(true);

  updateGhost();
  updateSelectionOverlay();
  updateToolbarForSelection();
}

// Helper functions for padding updates in toolbar

function getElementPadding(data) {
  return {
    top: data.paddingTop ?? data.paddingY ?? 8,
    right: data.paddingRight ?? data.paddingX ?? 10,
    bottom: data.paddingBottom ?? data.paddingY ?? 8,
    left: data.paddingLeft ?? data.paddingX ?? 10
  };
}

function formatPaddingCss(data) {
  const p = getParagraphPadding(data);
  return `padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;`;
}

function parsePaddingCss(css) {
  const match = css.trim().match(
    /^padding\s*:\s*(.*?)\s*;?$|^(.*?)\s*;?$/
  );

  if (!match) return null;

  const value = (match[1] ?? match[2] ?? "").trim();
  if (!value) return null;

  const parts = value.split(/\s+/);

  if (parts.length < 1 || parts.length > 4) return null;

  const values = parts.map((part) => {
    const number = part.match(/^(\d+(?:\.\d+)?|\.\d+)px$/i);
    return number ? Number(number[1]) : NaN;
  });

  if (values.some((value) =>
    !Number.isFinite(value) || value < 0 || value > 1000
  )) {
    return null;
  }

  let top, right, bottom, left;

  if (values.length === 1) {
    [top] = values;
    right = bottom = left = top;
  } else if (values.length === 2) {
    [top, right] = values;
    bottom = top;
    left = right;
  } else if (values.length === 3) {
    [top, right, bottom] = values;
    left = right;
  } else {
    [top, right, bottom, left] = values;
  }

  return { top, right, bottom, left };
}

function syncPaddingControls(data) {
  const p = getParagraphPadding(data);

  paddingX.value = String(Math.round((p.left + p.right) / 2));
  paddingY.value = String(Math.round((p.top + p.bottom) / 2));

  paddingXValue.textContent =
    p.left === p.right
      ? `${p.left} px`
      : `${p.left} / ${p.right} px`;

  paddingYValue.textContent =
    p.top === p.bottom
      ? `${p.top} px`
      : `${p.top} / ${p.bottom} px`;

  paddingCss.value = formatPaddingCss(data);
  paddingCssError.textContent = "";
}

// Helper functions to apply padding via toolbar controls

function getParagraphPadding(data) {
  return getElementPadding(data);
}

function applyElementPadding(element, data) {
  const p = getElementPadding(data);

  element.style.padding =
    `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
}

function applySelectedPadding(p) {
  // Padding changes are only allowed in Edit mode.
  if (editorMode.value !== "edit" || !selectedElementId) {
    return;
  }

  const data = getElementData(selectedElementId);

  // Allow padding changes for text and buttons.
  if (!data || !["text", "button"].includes(data.type)) {
    return;
  }

  // Capture original padding values.
  const before = {
    paddingTop: data.paddingTop,
    paddingRight: data.paddingRight,
    paddingBottom: data.paddingBottom,
    paddingLeft: data.paddingLeft,
    paddingX: data.paddingX,
    paddingY: data.paddingY
  };

  // Prepare new padding values.
  const after = {
    paddingTop: p.top,
    paddingRight: p.right,
    paddingBottom: p.bottom,
    paddingLeft: p.left,
    paddingX: (p.left + p.right) / 2,
    paddingY: (p.top + p.bottom) / 2
  };

  // Avoid recording unchanged values.
  const changed = Object.keys(after).some(
    key => before[key] !== after[key]
  );

  if (!changed) return;

  // Update project data.
  Object.assign(data, after);

  // Record the complete padding change.
  undoStack.push({
    type: "padding",
    id: data.id,
    before,
    after
  });

  limitHistory(undoStack);
  redoStack.length = 0;

  // Update the actual rendered element.
  updateRenderedElement(data, ["padding"]);

  syncPaddingControls(data);
  updateToolbarForSelection();
}

function handlePaddingXChange() {
  const data = getSelectedData();
  if (!data || (data.type !== "text" && data.type !== "button")) return;

  const x = Number(paddingX.value);
  const p = getParagraphPadding(data);
  p.left = x;
  p.right = x;

  applySelectedPadding(p);
}

function handlePaddingYChange() {
  const data = getSelectedData();
  if (!data || (data.type !== "text" && data.type !== "button")) return;

  const y = Number(paddingY.value);
  const p = getParagraphPadding(data);
  p.top = y;
  p.bottom = y;

  applySelectedPadding(p);
}

function handleApplyPaddingCss() {
  const parsed = parsePaddingCss(paddingCss.value);

  if (!parsed) {
    paddingCssError.textContent =
      "Enter padding in px, e.g. padding: 8px 16px;";
    return;
  }

  const data = getSelectedData();

  // Allowlist
  if (!data || (data.type !== "text" && data.type !== "button")) return;

  applySelectedPadding(parsed);
}

// Null-safe toggle for toolbar panels.
function setHidden(el, hidden) {
  if (el) el.hidden = hidden;
}

function updateToolbarForSelection() {
  const data = getSelectedData();
  const isEditMode = editorMode.value === "edit";
  const hasSelection = Boolean(data && activeConfig);

  const selectedDrawing =
    editorMode.value === "edit" && getSelectedData()?.type === "drawing";

  setHidden(
    drawControls,
    !((editorMode.value === "place" && activeType === "drawing") || selectedDrawing)
  );
  setHidden(drawSessionControls, selectedDrawing); // Finish/animate are Place-only

  setHidden(
    paddingControls,
    !(isEditMode && hasSelection && (data.type === "text" || data.type === "button"))
  );

  // Place mode: show the panels for the type about to be placed.
  if (editorMode.value === "place" && activeConfig?.editableProperties) {
    const editable = activeConfig.editableProperties;

    setHidden(backgroundControls, !editable.includes("background"));
    // The colorControls are an enigma in if keep global for edit or have element specific colorControls
    setHidden(colorControls, activeType === "image" || activeType === "drawing");
    setHidden(fontFamilyControls, !editable.includes("fontFamily"));
    setHidden(fontSizeControls, !editable.includes("fontSize"));
    setHidden(textControls, !editable.includes("text"));
    return;
  }

  if (!hasSelection) return;

  const editable = activeConfig.editableProperties;

  setHidden(backgroundControls, !editable.includes("background"));
  setHidden(colorControls, !editable.includes("color"));
  setHidden(fontFamilyControls, !editable.includes("fontFamily"));
  setHidden(fontSizeControls, !editable.includes("fontSize"));
  setHidden(textControls, !editable.includes("text"));
}

function selectElement(element) {
  const data = getElementData(element.dataset.id);
  if (!data) return;

  selectedElementId = data.id;
  activeType = data.type;
  activeConfig = { ...elementConfigs[activeType] };

  // Show the outline first, so a toolbar problem can't block selection.
  updateSelectionOverlay();

  // This part should be replaced with syncTypographyControls()

  if (data.type === "text") {
    fontFamily.value = data.fontFamily || "Arial";
    paragraphFontSize.value = String(data.fontSize || 16);
    syncPaddingControls(data);
  }

  else if (data.type === "button") {
    fontFamily.value = data.fontFamily || "Arial";
    paragraphFontSize.value = String(data.fontSize || 16);
    syncPaddingControls(data);
  }

  if (data.type === "drawing") syncPenFrom(data);
  syncPaintControlsTo(data, data.type);
  updateToolbarForSelection();
}

/* Check what type of color change that will be wanted - background || color for example */

function getColorTarget() {
  return document.querySelector(
    'input[name="colorTarget"]:checked'
  )?.value || "color";
}

const GRADIENT_RE =
  /^linear-gradient\(([^,]+),\s*(#[0-9a-fA-F]{3,8}),\s*(#[0-9a-fA-F]{3,8})\)$/;

// Make the paint controls mirror a config or element's current paint.
// Does NOT call updateBackground(), so it has no side effects on data.
function syncPaintControlsTo(source, type) {
  const editable = elementConfigs[type]?.editableProperties || [];

  // Pick a radio the element type actually supports.
  let target = getColorTarget();
  if (!editable.includes("color")) target = "background";
  else if (!editable.includes("background")) target = "color";

  const radio = document.querySelector(
    `input[name="colorTarget"][value="${target}"]`
  );
  if (radio) radio.checked = true;

  const paint = source[target];
  const gradient =
    typeof paint === "string" ? paint.match(GRADIENT_RE) : null;

  if (gradient) {
    backgroundType.value = "gradient";
    gradientDirection.value = gradient[1].trim();
    gradientStart.value = gradient[2];
    gradientEnd.value = gradient[3];
    solidControls.hidden = true;
    gradientControls.hidden = false;
  } else {
    backgroundType.value = "solid";
    solidControls.hidden = false;
    gradientControls.hidden = true;

    // <input type="color"> only accepts #rrggbb; ignore "transparent" etc.
    if (/^#[0-9a-fA-F]{6}$/.test(paint || "")) {
      colorPicker.value = paint;
    }
  }
}

document.querySelectorAll('input[name="colorTarget"]')
  .forEach((radio) => {
    radio.addEventListener("change", () => {

      const target = getColorTarget();

      // While drafting, restore the previously selected paint.
      if (activeParagraphDraft) {
        const savedPaint = paragraphDraftPaint[target];

        if (
          savedPaint &&
          !savedPaint.startsWith("linear-gradient")
        ) {
          colorPicker.value = savedPaint;
        }

        return;
      }

      // Existing selected-element behavior.
      const data = getElementData(selectedElementId);

      if (!data) return;

      syncPaintControlsTo(data, data.type);
    });
  });

const clearBackgroundButton = document.getElementById(
  "clearBackgroundButton"
);

clearBackgroundButton.addEventListener("click", () => {
  if (
    getColorTarget() !== "background" ||
    editorMode.value !== "edit" ||
    !selectedElementId
  ) {
    return;
  }

  updateSelectedElementProperty("background", "transparent");
});

// If we'd like to later use a function to get the color adjusted to the backgroundType
function getSelectedPaintValue() {
  if (backgroundType.value === "solid") {
    return colorPicker.value;
  }

  const gradient =
    `linear-gradient(${gradientDirection.value}, ` +
    `${gradientStart.value}, ${gradientEnd.value})`;

  return gradient;
}

function updateBackground() {
  const target = getColorTarget();

  const paint =
    backgroundType.value === "solid"
      ? colorPicker.value
      : `linear-gradient(${gradientDirection.value}, ${gradientStart.value}, ${gradientEnd.value})`;

  // Only treat a selection as the target while actually in Edit mode.
  const selectedData =
    editorMode.value === "edit" && selectedElementId
      ? getElementData(selectedElementId)
      : null;

  if (selectedData) {
    const property = target === "color" ? "color" : "background";
    const config = elementConfigs[selectedData.type];

    if (!config?.editableProperties?.includes(property)) return;

    updateSelectedElementProperty(property, paint);
    return;
  }

  // PLACE MODE: update the ghost's active config AND the saved default.
  if (activeType === "image") return;

  // If the type has no "color" property (e.g. header), fall back to background.
  const property =
    target === "color" &&
    activeConfig.editableProperties.includes("color")
      ? "color"
      : "background";

  activeConfig[property] = paint;
  elementConfigs[activeType][property] = paint;

  updateGhost();

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

// Apply the active configuration to the ghost
const GHOST_LOREM =
  "Lorem ipsum dolor sit amet";

// The ghost uses flex for buttons (to center the label), block otherwise.
function ghostDisplayValue() {
  return activeType === "button" ? "flex" : "block";
}

function ghostAllowed() {
  return (
    editorMode.value === "place" &&
    activeType !== "drawing" &&
    !activeParagraphDraft &&
    !activeButtonDraft &&
    !activeAudioDraft &&
    !activeDrag &&
    Boolean(activeConfig)
  );
}

let pointerOverCanvas = false;

function updateGhost() {
  renderGhost();
  if (!pointerOverCanvas || !ghostAllowed()) {
    ghostBlock.style.display = "none";
  }
}

function renderGhost() {
  if (!ghostAllowed()) {
    ghostBlock.style.display = "none";
    return;
  }

  // Clear whatever the previous type left behind, but keep the cursor position.
  const { left, top } = ghostBlock.style;
  ghostBlock.removeAttribute("style");
  ghostBlock.style.left = left;
  ghostBlock.style.top = top;
  ghostBlock.replaceChildren();

  ghostBlock.className = activeConfig.className;
  ghostBlock.style.display = ghostDisplayValue();
  ghostBlock.style.width = `${activeConfig.width}px`;
  ghostBlock.style.height = `${activeConfig.height}px`;

  const fontSize = Number(paragraphFontSize.value) || 16;

  // IMAGE
  if (activeType === "image") {
    if (uploadedImage) {
      ghostBlock.style.backgroundImage = `url("${uploadedImage}")`;
      ghostBlock.style.backgroundSize = "100% 100%";
      ghostBlock.style.backgroundRepeat = "no-repeat";
      ghostBlock.style.backgroundPosition = "center";
    } else {
      ghostBlock.style.backgroundColor = "#d3d3d3";
    }
    return;
  }

  // PARAGRAPH: lorem ipsum in the last-used paint
  if (activeType === "text") {
    const s = ghostBlock.style;

    s.height = "auto";
    s.minHeight = "40px";
    s.boxSizing = "border-box";
    s.padding = "8px 10px";
    s.whiteSpace = "pre-wrap";
    s.overflowWrap = "break-word";
    s.lineHeight = "1.5";
    s.textAlign = "left";
    s.fontFamily = fontFamily.value || "Arial";
    s.fontSize = `${fontSize}px`;
    s.background = paragraphDraftPaint.background || "transparent";
    s.outline = "1px dashed rgba(0, 0, 0, 0.35)";

    applyParagraphTextColor(ghostBlock, { color: paragraphDraftPaint.color });
    ghostBlock.querySelector(".text-content").textContent = GHOST_LOREM;
    return;
  }

  // BUTTON: the default (Solid) look
  if (activeType === "button") {
    const preset = BUTTON_PRESETS.solid;

    applyButtonLook(ghostBlock, {
      preset: "solid",
      text: "Button",
      color: preset.color,
      background: preset.background,
      fontFamily: fontFamily.value || "Arial",
      fontSize
    });

    ghostBlock.style.opacity = "0.85";
    return;
  }

  // HEADER
  ghostBlock.style.background = activeConfig.background;
}

// Recalculate the required canvas height
let canvasHeightQueued = false;

function updateCanvasHeight() {
  if (canvasHeightQueued) return;
  canvasHeightQueued = true;

  requestAnimationFrame(() => {
    canvasHeightQueued = false;

    let lowest = window.innerHeight;
    for (const data of project.elements) {
      // y is the element's center, so the bottom edge is y + height / 2.
      lowest = Math.max(lowest, data.y + data.height / 2);
    }

    canvas.style.height = `${lowest}px`;
  });
}

// Update the active element type

elementType.addEventListener("change", () => {
  const type = elementType.value;
  const isImage = type === "image";

  // 1. Switch to Place mode FIRST. updateGhost() hides the ghost outside it.
  cancelDrafts();
  editorMode.value = "place";
  selectedElementId = null; // otherwise the old outline returns later in Edit mode

  // 2. Per-type setup (unchanged from before).
  if (type === "text") {
    paragraphDraftPaint = { color: "#000000", background: "transparent" };
  }

  setActiveElementType(type);

  colorControls.hidden = isImage;
  imageControls.hidden = !isImage;

  if (isImage) {
    activeConfig.width = 640;
    activeConfig.height = imageAspectRatio
      ? Math.round(640 / imageAspectRatio)
      : 360;
    activeConfig.background = "#d3d3d3";
    activeConfig.className = "ghost-block image-placeholder";
  } else {
    syncPaintControlsTo(activeConfig, type);
  }

  // 3. Apply the mode: canvas classes, ghost, overlay, toolbar.
  updateEditorMode();

  // Keep arrow keys from changing the type by accident afterwards.
  elementType.blur();
});

/*

elementType.addEventListener("change", () => {

  cancelDrafts();
  // A fresh paragraph starts with black text and no background,
  // as the old Paragraph mode did.

  if (elementType.value === "text") {
    paragraphDraftPaint = { color: "#000000", background: "transparent" };
  }

  const type = elementType.value;
  const isImage = type === "image";

  // Fresh copy of the defaults; also resets image state for non-image types.
  setActiveElementType(type);

  colorControls.hidden = isImage;
  imageControls.hidden = !isImage;

  // TODO, check the aspect ratio here
  if (isImage) {
    activeConfig.width = 640;
    activeConfig.height = imageAspectRatio
      ? Math.round(640 / imageAspectRatio)
      : 360;
    activeConfig.background = "#d3d3d3";
    activeConfig.className = "ghost-block image-placeholder";
  } else {
    syncPaintControlsTo(activeConfig, type);
  }

  updateGhost();
});

 */


// Helper for paragraph handler
// Measure paragraph text width without displaying the measuring element.
function measureParagraphText(textarea) {
  const measure = document.createElement("span");

  const styles = window.getComputedStyle(textarea);

  measure.style.position = "absolute";
  measure.style.visibility = "hidden";
  measure.style.whiteSpace = "pre";
  measure.style.width = "max-content";
  measure.style.height = "auto";

  measure.style.fontFamily = styles.fontFamily;
  measure.style.fontSize = styles.fontSize;
  measure.style.fontWeight = styles.fontWeight;
  measure.style.fontStyle = styles.fontStyle;
  measure.style.letterSpacing = styles.letterSpacing;
  measure.style.textTransform = styles.textTransform;

  measure.textContent = textarea.value || " ";

  document.body.appendChild(measure);

  const width = measure.getBoundingClientRect().width;

  measure.remove();

  return width;
}

// Helper function for the paragraphHandler
function applyParagraphTypography() {
  if (!activeParagraphDraft) return;

  const { textarea, textareaWrap, settings } = activeParagraphDraft;

  textarea.style.fontFamily = settings.fontFamily;
  textarea.style.fontSize = `${settings.fontSize}px`;

  const textIsGradient = isGradientValue(settings.color);
  const backgroundIsGradient = isGradientValue(settings.background);

  // Measure the actual typed text.
  const measuredTextWidth = measureParagraphText(textarea);

// Include textarea padding so the gradient starts at the text position.
  const textareaStyles = window.getComputedStyle(textarea);

  const textStartOffset =
    parseFloat(textareaStyles.paddingLeft) || 0;

  const gradientWidth = Math.max(
    1,
    measuredTextWidth
  );

  // Reset previous preview paint on both elements
  textarea.style.backgroundImage = "none";
  textarea.style.backgroundClip = "";
  textarea.style.webkitBackgroundClip = "";
  textarea.style.MozBackgroundClip = "";
  textarea.style.backgroundOrigin = "";
  textarea.style.backgroundSize = "";
  textarea.style.backgroundRepeat = "";
  textarea.style.backgroundPosition = "";

  if (textareaWrap) {
    textareaWrap.style.backgroundImage = "none";
    textareaWrap.style.backgroundColor = "transparent";
  }

  // 1. Handle Text Color / Text Gradient
  if (!textIsGradient) {
    textarea.style.color = settings.color || "#000000";
    textarea.style.webkitTextFillColor = settings.color || "#000000";
  } else {
    // Gradient text needs transparent text fill.
    textarea.style.color = "transparent";
    textarea.style.webkitTextFillColor = "transparent";

    textarea.style.backgroundImage = settings.color;

    // Restrict gradient to measured text width.
    textarea.style.backgroundSize =
      `${gradientWidth}px 100%`;

    textarea.style.backgroundRepeat = "no-repeat";
    textarea.style.backgroundPosition =
      `${textStartOffset}px top`;

    textarea.style.backgroundClip = "text";
    textarea.style.webkitBackgroundClip = "text";
    textarea.style.MozBackgroundClip = "text";
  }

  // 2. Handle Textarea Box Background (Solid or Gradient) via Wrapper
  if (textIsGradient && textareaWrap) {
    if (backgroundIsGradient) {
      textareaWrap.style.backgroundImage = settings.background;
    } else if (settings.background && settings.background !== "transparent") {
      textareaWrap.style.backgroundColor = settings.background;
    }
    return;
  }

  // Solid text, gradient background (Safe to apply directly to textarea)
  if (backgroundIsGradient) {
    textarea.style.backgroundImage = settings.background;
    textarea.style.backgroundClip = "padding-box";
    textarea.style.webkitBackgroundClip = "padding-box";
    textarea.style.MozBackgroundClip = "padding-box";
    return;
  }

  // Both text and background are solid, or background is transparent
  if (textareaWrap && settings.background && settings.background !== "transparent") {
    textareaWrap.style.backgroundColor = settings.background;
  }
}

function updateSelectedElementProperty(property, value) {
  if (editorMode.value !== "edit" || !selectedElementId) {
    return;
  }

  const data = getElementData(selectedElementId);

  if (!data) return;

  const config = elementConfigs[data.type];

  if (!config?.editableProperties?.includes(property)) {
    return;
  }

  const before = data[property];

  if (before === value) return;

  // Update project data.
  data[property] = value;

  // Render the changed property.
  updateRenderedElement(data, [property]);

  // Record history.
  undoStack.push({
    type: "property",
    id: data.id,
    property,
    before,
    after: value
  });

  limitHistory(undoStack);
  redoStack.length = 0;

  updateToolbarForSelection();
}

// Start of ParagraphHandler

// TODO check where the drawSession = null will be set
function cancelDrafts() {
  drawSession = null;
  if (activeParagraphDraft) {
    activeParagraphDraft.draft.remove();
    activeParagraphDraft = null;
  }

  if (activeButtonDraft) {
    activeButtonDraft.draft.remove();
    activeButtonDraft = null;
  }

  if (activeAudioDraft) activeAudioDraft.close();
}

let activeParagraphDraft = null;

let paragraphDraftPaint = {
  color: "#000000",
  background: "transparent"
};

function beginParagraphDraft(event) {
  // Allow only one unfinished paragraph at a time.
  if (activeParagraphDraft) return;

  const rect = canvas.getBoundingClientRect();

  const draft = document.createElement("div");
  draft.className = "paragraph-draft";

  const toolbar = document.createElement("div");
  toolbar.className = "paragraph-draft-toolbar";

  // Create dedicated wrapper for the textarea background preview
  const textareaWrap = document.createElement("div");
  textareaWrap.className = "paragraph-textarea-wrap";

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Write your paragraph...";
  textarea.setAttribute("aria-label", "Paragraph text");

  textareaWrap.appendChild(textarea);
  textarea.addEventListener("input", () => {
    applyParagraphTypography();
  });

  const actions = document.createElement("div");
  actions.className = "paragraph-draft-actions";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";

  const doneButton = document.createElement("button");
  doneButton.type = "button";
  doneButton.textContent = "Done";

  // Each draft starts with the last-used paint settings.
  const settings = {
    color: paragraphDraftPaint.color,
    background: paragraphDraftPaint.background,
    fontFamily: fontFamily.value,
    fontSize: Number(paragraphFontSize.value)
  };

  // Helper for creating a label.
  function createLabel(text, control) {
    const label = document.createElement("label");
    label.textContent = text;
    label.appendChild(control);
    return label;
  }

  // Helper for creating a gradient control group.
  function createGradientControls(initialValue) {
    const group = document.createElement("div");
    group.className = "paragraph-gradient-controls";

    const direction = document.createElement("select");

    [
      ["to right", "Left to right"],
      ["to left", "Right to left"],
      ["to bottom", "Top to bottom"],
      ["to top", "Bottom to top"],
      ["to bottom right", "Diagonal"],
      ["to bottom left", "Reverse diagonal"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      direction.appendChild(option);
    });

    const start = document.createElement("input");
    start.type = "color";

    const end = document.createElement("input");
    end.type = "color";

    // Use sensible defaults, unless the saved value is a gradient.
    direction.value = "to right";
    start.value = "#3366ff";
    end.value = "#ff66cc";

    const gradientMatch = initialValue?.match(
      /^linear-gradient\(([^,]+),\s*(#[0-9a-fA-F]{3,8}),\s*(#[0-9a-fA-F]{3,8})\)$/
    );

    if (gradientMatch) {
      direction.value = gradientMatch[1].trim();
      start.value = gradientMatch[2];
      end.value = gradientMatch[3];
    }

    group.append(
      createLabel("Direction", direction),
      createLabel("Start", start),
      createLabel("End", end)
    );

    return {
      group,
      direction,
      start,
      end
    };
  }

  // --------------------------------------------------
  // TEXT COLOR CONTROLS
  // --------------------------------------------------

  const textColorMode = document.createElement("select");

  [
    ["solid", "Solid"],
    ["gradient", "Gradient"]
  ].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    textColorMode.appendChild(option);
  });

  const textColor = document.createElement("input");
  textColor.type = "color";

  const textGradient = createGradientControls(settings.color);
  const textIsGradient = isGradientValue(settings.color);

  textColorMode.value = textIsGradient ? "gradient" : "solid";
  textColor.value = textIsGradient ? "#000000" : settings.color || "#000000";

  const textColorLabel = createLabel("Text paint", textColorMode);
  const textColorSolidLabel = createLabel("Text color", textColor);

  const textColorControls = document.createElement("div");
  textColorControls.className = "paragraph-paint-controls";

  textColorControls.append(textColorSolidLabel, textGradient.group);

  // --------------------------------------------------
  // BACKGROUND CONTROLS
  // --------------------------------------------------

  const backgroundMode = document.createElement("select");

  [
    ["solid", "Solid"],
    ["gradient", "Gradient"],
    ["transparent", "Transparent"]
  ].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    backgroundMode.appendChild(option);
  });

  const backgroundColor = document.createElement("input");
  backgroundColor.type = "color";

  const backgroundGradient = createGradientControls(settings.background);
  const backgroundIsGradient = isGradientValue(settings.background);

  backgroundMode.value =
    settings.background === "transparent"
      ? "transparent"
      : backgroundIsGradient
        ? "gradient"
        : "solid";

  backgroundColor.value =
    settings.background?.startsWith("#") ? settings.background : "#ffffff";

  const backgroundLabel = createLabel("Background paint", backgroundMode);
  const backgroundSolidLabel = createLabel("Background color", backgroundColor);

  const backgroundControls = document.createElement("div");
  backgroundControls.className = "paragraph-paint-controls";

  backgroundControls.append(backgroundSolidLabel, backgroundGradient.group);

  // --------------------------------------------------
  // TYPOGRAPHY CONTROLS
  // --------------------------------------------------

  const fontFamilySelect = fontFamily.cloneNode(true);
  fontFamilySelect.removeAttribute("id");
  fontFamilySelect.value = settings.fontFamily;

  const fontFamilyLabel = createLabel("Font", fontFamilySelect);

  const fontSizeInput = paragraphFontSize.cloneNode(true);
  fontSizeInput.removeAttribute("id");
  fontSizeInput.value = String(settings.fontSize);

  const fontSizeLabel = createLabel("Size", fontSizeInput);

  const typeToggle = Object.assign(document.createElement("input"), {
    type: "checkbox"
  });

  const typeToggleLabel = createLabel("Type on load (export)", typeToggle);

  // --------------------------------------------------
  // BUILD THE POPUP
  // --------------------------------------------------

  toolbar.append(
    textColorLabel,
    textColorControls,
    backgroundLabel,
    backgroundControls,
    fontFamilyLabel,
    fontSizeLabel,
    typeToggleLabel
  );

  actions.append(cancelButton, doneButton);

  // Append textareaWrap instead of raw textarea
  draft.append(toolbar, textareaWrap, actions);

  draft.style.left = `${event.clientX - rect.left}px`;
  draft.style.top = `${event.clientY - rect.top}px`;

  canvas.appendChild(draft);

  activeParagraphDraft = {
    draft,
    textarea,
    textareaWrap,
    settings
  };

  // --------------------------------------------------
  // UPDATE CONTROL VISIBILITY
  // --------------------------------------------------

  function syncPaintControls() {
    textColorSolidLabel.hidden = textColorMode.value !== "solid";
    textGradient.group.hidden = textColorMode.value !== "gradient";
    backgroundSolidLabel.hidden = backgroundMode.value !== "solid";
    backgroundGradient.group.hidden = backgroundMode.value !== "gradient";
  }

  function updateTextPaint() {
    if (textColorMode.value === "solid") {
      settings.color = textColor.value;
    } else {
      settings.color = createGradientValue(
        textGradient.direction.value,
        textGradient.start.value,
        textGradient.end.value
      );
    }
    paragraphDraftPaint.color = settings.color;
    applyParagraphTypography();
  }

  function updateBackgroundPaint() {
    if (backgroundMode.value === "transparent") {
      settings.background = "transparent";
    } else if (backgroundMode.value === "solid") {
      settings.background = backgroundColor.value;
    } else {
      settings.background = createGradientValue(
        backgroundGradient.direction.value,
        backgroundGradient.start.value,
        backgroundGradient.end.value
      );
    }
    paragraphDraftPaint.background = settings.background;
    applyParagraphTypography();
  }

  textColorMode.addEventListener("change", () => {
    syncPaintControls();
    updateTextPaint();
  });

  textColor.addEventListener("input", updateTextPaint);

  [textGradient.direction, textGradient.start, textGradient.end].forEach((control) => {
    control.addEventListener("input", updateTextPaint);
    control.addEventListener("change", updateTextPaint);
  });

  backgroundMode.addEventListener("change", () => {
    syncPaintControls();
    updateBackgroundPaint();
  });

  backgroundColor.addEventListener("input", updateBackgroundPaint);

  [backgroundGradient.direction, backgroundGradient.start, backgroundGradient.end].forEach((control) => {
    control.addEventListener("input", updateBackgroundPaint);
    control.addEventListener("change", updateBackgroundPaint);
  });

  fontFamilySelect.addEventListener("change", () => {
    settings.fontFamily = fontFamilySelect.value;
    applyParagraphTypography();
  });

  fontSizeInput.addEventListener("input", () => {
    settings.fontSize = Number(fontSizeInput.value);
    applyParagraphTypography();
  });

  syncPaintControls();
  applyParagraphTypography();

  textarea.focus();

  cancelButton.addEventListener("click", () => {
    draft.remove();
    activeParagraphDraft = null;
  });

  doneButton.addEventListener("click", () => {
    const text = normalizeParagraphText(textarea.value);

    if (!text) {
      textarea.focus();
      return;
    }

    const elementData = {
      id: crypto.randomUUID(),
      type: "text",
      x: parseFloat(draft.style.left),
      y: parseFloat(draft.style.top),
      width: textarea.offsetWidth,
      height: textarea.scrollHeight,
      text,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      color: settings.color,
      background: settings.background,
      paddingX: 10,
      paddingY: 8,
      typeAnimate: typeToggle.checked
    };

    paragraphDraftPaint.color = settings.color;
    paragraphDraftPaint.background = settings.background;

    draft.remove();
    activeParagraphDraft = null;

    storeInsert(elementData);

    undoStack.push({
      type: "place",
      element: { ...elementData }
    });

    limitHistory(undoStack);
    redoStack.length = 0;

    renderElement(elementData);
    updateCanvasHeight();
  });

  updateGhost();
}

function syncTypographyControls() {
  const data = getSelectedData();

  if (data?.type === "drawing") syncPenFrom(data);

  if (data?.type === "text") {
    fontFamily.value = data.fontFamily || "Arial";
    paragraphFontSize.value = String(data.fontSize || 16);
    syncPaddingControls(data);
  }

  else if (data?.type === "button") {
    fontFamily.value = data.fontFamily || "Arial";
    paragraphFontSize.value = String(data.fontSize || 16);
    syncPaddingControls(data);
  }

  updateToolbarForSelection();
}

paragraphFontSize.addEventListener("input", () => {
  if (editorMode.value !== "edit") return;

  const size = Number(paragraphFontSize.value);
  if (size >= 1) updateSelectedElementProperty("fontSize", size);
});

fontFamily.addEventListener("change", () => {
  if (editorMode.value !== "edit") return;

  updateSelectedElementProperty("fontFamily", fontFamily.value);
});

// Start of button draft handler

let activeButtonDraft = null;

function labelled(text, control) {
  const label = document.createElement("label");
  label.textContent = text;
  label.appendChild(control);
  return label;
}

function makeSelect(options) {
  const select = document.createElement("select");

  options.forEach(([value, text]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
  });

  return select;
}

// Solid / gradient (/ transparent) paint control. Emits a CSS value.
function createPaintField(labelText, { allowTransparent = false, initial, onChange }) {
  const group = document.createElement("div");
  group.className = "paragraph-paint-controls";

  const mode = makeSelect([
    ["solid", "Solid"],
    ["gradient", "Gradient"],
    ...(allowTransparent ? [["transparent", "Transparent"]] : [])
  ]);

  const solid = Object.assign(document.createElement("input"), { type: "color", value: "#3366ff" });
  const direction = makeSelect(GRADIENT_DIRECTIONS);
  const start = Object.assign(document.createElement("input"), { type: "color", value: "#3366ff" });
  const end = Object.assign(document.createElement("input"), { type: "color", value: "#ff66cc" });

  const solidLabel = labelled("Color", solid);
  const gradientGroup = document.createElement("div");
  gradientGroup.className = "paragraph-gradient-controls";
  gradientGroup.append(
    labelled("Direction", direction),
    labelled("Start", start),
    labelled("End", end)
  );

  group.append(labelled(labelText, mode), solidLabel, gradientGroup);

  function syncVisibility() {
    solidLabel.hidden = mode.value !== "solid";
    gradientGroup.hidden = mode.value !== "gradient";
  }

  function read() {
    if (mode.value === "transparent") return "transparent";
    if (mode.value === "solid") return solid.value;
    return createGradientValue(direction.value, start.value, end.value);
  }

  // Updates the controls WITHOUT calling onChange.
  function write(value) {
    const gradient = typeof value === "string" ? value.match(GRADIENT_RE) : null;

    if (gradient) {
      mode.value = "gradient";
      direction.value = gradient[1].trim();
      start.value = gradient[2];
      end.value = gradient[3];
    } else if (value === "transparent" && allowTransparent) {
      mode.value = "transparent";
    } else {
      mode.value = "solid";
      if (/^#[0-9a-fA-F]{6}$/.test(value || "")) solid.value = value;
    }

    syncVisibility();
  }

  [mode, solid, direction, start, end].forEach((control) => {
    const emit = () => { syncVisibility(); onChange(read()); };
    control.addEventListener("input", emit);
    control.addEventListener("change", emit);
  });

  write(initial);

  return { element: group, read, write };
}

const measureCtx = document.createElement("canvas").getContext("2d");

function measureLabelWidth(text, family, size, weight) {
  measureCtx.font = `${weight} ${size}px ${family}`;
  return measureCtx.measureText(text).width;
}

// existing = null creates a new button; an element's data edits it.
function beginButtonDraft(event, existing = null) {
  if (activeButtonDraft || activeParagraphDraft) return;

  const rect = canvas.getBoundingClientRect();
  const base = existing ?? {};
  const firstPreset = BUTTON_PRESETS[base.preset] ? base.preset : "solid";

  const settings = {
    preset: firstPreset,
    text: base.text ?? "Button",
    customCss: base.customCss ?? "",
    fontFamily: base.fontFamily ?? fontFamily.value,
    fontSize: base.fontSize ?? (Number(paragraphFontSize.value) || 16),
    color: base.color ?? BUTTON_PRESETS[firstPreset].color,
    background: base.background ?? BUTTON_PRESETS[firstPreset].background
  };

  // --- Shell (reuses the paragraph popup classes, so your CSS applies) ---
  const draft = document.createElement("div");
  draft.className = "paragraph-draft button-draft";

  const toolbar = document.createElement("div");
  toolbar.className = "paragraph-draft-toolbar";

  const actions = document.createElement("div");
  actions.className = "paragraph-draft-actions";

  const cancelButton = Object.assign(document.createElement("button"), { type: "button", textContent: "Cancel" });
  const doneButton = Object.assign(document.createElement("button"), { type: "button", textContent: existing ? "Apply" : "Done" });

  // --- Live preview ---
  const stage = document.createElement("div");
  stage.className = "button-preview-stage";

  const preview = document.createElement("div");
  preview.style.width = "180px";
  preview.style.height = "48px";
  stage.appendChild(preview);

  const refresh = () => applyButtonLook(preview, settings);

  // --- Text and href ---
  const textInput = Object.assign(document.createElement("input"), { type: "text", value: settings.text, maxLength: 200 });
  textInput.addEventListener("input", () => { settings.text = textInput.value; refresh(); });

  const hrefArea = document.createElement("textarea");
  hrefArea.rows = 2;
  hrefArea.placeholder = "https://example.com";
  hrefArea.value = base.href ?? "";

  const hrefError = document.createElement("div");
  hrefError.className = "button-error";

  hrefArea.addEventListener("input", () => {
    hrefError.textContent =
      safeHref(hrefArea.value) === null
        ? "Allowed: http(s), mailto, tel, #anchors and relative paths."
        : "";
  });

  // --- Paint ---
  const textPaint = createPaintField("Text paint", {
    initial: settings.color,
    onChange: (value) => { settings.color = value; refresh(); }
  });

  const bgPaint = createPaintField("Background paint", {
    allowTransparent: true,
    initial: settings.background,
    onChange: (value) => { settings.background = value; refresh(); }
  });

  // --- Typography ---
  const fontFamilySelect = fontFamily.cloneNode(true);
  fontFamilySelect.removeAttribute("id");
  fontFamilySelect.value = settings.fontFamily;
  fontFamilySelect.addEventListener("change", () => { settings.fontFamily = fontFamilySelect.value; refresh(); });

  const fontSizeInput = paragraphFontSize.cloneNode(true);
  fontSizeInput.removeAttribute("id");
  fontSizeInput.value = String(settings.fontSize);
  fontSizeInput.addEventListener("input", () => {
    settings.fontSize = Number(fontSizeInput.value) || 16;
    refresh();
  });

  // --- Presets: picking one defaults the text and background paint ---
  const presetButtons = {};
  const presetRow = document.createElement("div");
  presetRow.className = "button-preset-row";

  function markActivePreset() {
    Object.entries(presetButtons).forEach(([key, button]) =>
      button.setAttribute("aria-pressed", String(key === settings.preset))
    );
  }

  function choosePreset(key) {
    const preset = BUTTON_PRESETS[key];

    settings.preset = key;
    settings.color = preset.color;
    settings.background = preset.background;

    textPaint.write(preset.color);
    bgPaint.write(preset.background);

    markActivePreset();
    refresh();
  }

  Object.entries(BUTTON_PRESETS).forEach(([key, preset]) => {
    const option = Object.assign(document.createElement("button"), {
      type: "button",
      className: "button-preset-option",
      title: preset.label
    });

    const sample = document.createElement("span");
    sample.style.height = "34px";
    applyButtonLook(sample, {
      preset: key, text: preset.label, color: preset.color,
      background: preset.background, fontFamily: "Arial", fontSize: 14
    });

    option.appendChild(sample);
    option.addEventListener("click", () => choosePreset(key));

    presetButtons[key] = option;
    presetRow.appendChild(option);
  });

  // --- Custom CSS ---
  const customToggle = Object.assign(document.createElement("button"), { type: "button", textContent: "Custom CSS" });

  const customWrap = document.createElement("div");
  customWrap.hidden = !settings.customCss;

  const customArea = document.createElement("textarea");
  customArea.rows = 5;
  customArea.placeholder = "border-radius: 999px;\nletter-spacing: 1px;\nbox-shadow: 0 6px 18px rgba(0,0,0,0.25);";
  customArea.value = settings.customCss;

  const customError = document.createElement("div");
  customError.className = "button-error";

  const customHint = document.createElement("div");
  customHint.className = "button-hint";
  customHint.textContent = `Allowed: ${[...CUSTOM_CSS_ALLOWED].join(", ")}`;

  function checkCustomCss() {
    const { rejected } = parseCustomCss(customArea.value);
    customError.textContent = rejected.length ? `Ignored: ${rejected.join("; ")}` : "";
  }

  customArea.addEventListener("input", () => {
    settings.customCss = customArea.value;
    checkCustomCss();
    refresh();
  });

  customToggle.addEventListener("click", () => { customWrap.hidden = !customWrap.hidden; });
  customWrap.append(customArea, customError, customHint);

  // --- Assemble ---
  toolbar.append(
    presetRow,
    stage,
    labelled("Button text", textInput),
    labelled("href", hrefArea),
    hrefError,
    textPaint.element,
    bgPaint.element,
    labelled("Font", fontFamilySelect),
    labelled("Size", fontSizeInput),
    customToggle,
    customWrap
  );

  actions.append(cancelButton, doneButton);
  draft.append(toolbar, actions);

  draft.style.left = `${event.clientX - rect.left}px`;
  draft.style.top = `${event.clientY - rect.top}px`;
  canvas.appendChild(draft);

  activeButtonDraft = { draft };

  markActivePreset();
  checkCustomCss();
  refresh();
  textInput.focus();

  cancelButton.addEventListener("click", () => {
    draft.remove();
    activeButtonDraft = null;
  });

  doneButton.addEventListener("click", () => {
    const href = safeHref(hrefArea.value);

    if (href === null) {
      hrefError.textContent = "Allowed: http(s), mailto, tel, #anchors and relative paths.";
      hrefArea.focus();
      return;
    }

    const fields = {
      text: textInput.value.trim() || "Button",
      href,
      preset: settings.preset,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      color: settings.color,
      background: settings.background,
      customCss: serializeCustomCss(settings.customCss)
    };

    draft.remove();
    activeButtonDraft = null;

    // Editing an existing button: one undoable step.
    if (existing) {
      const before = {};
      Object.keys(fields).forEach((key) => { before[key] = existing[key]; });

      Object.assign(existing, fields);

      undoStack.push({ type: "buttonEdit", id: existing.id, before, after: { ...fields } });
      limitHistory(undoStack);
      redoStack.length = 0;

      updateRenderedElement(existing, ["button"]);
      return;
    }

    const preset = BUTTON_PRESETS[fields.preset];
    const labelWidth = measureLabelWidth(
      fields.text, fields.fontFamily, fields.fontSize, preset.fontWeight
    );

    const elementData = {
      id: crypto.randomUUID(),
      type: "button",
      x: parseFloat(draft.style.left),
      y: parseFloat(draft.style.top),
      width: Math.max(120, Math.ceil(labelWidth) + 48),
      height: Math.round(fields.fontSize * 1.5) + 24,
      ...fields
    };

    storeInsert(elementData);

    undoStack.push({ type: "place", element: structuredClone(elementData) });
    limitHistory(undoStack);
    redoStack.length = 0;

    renderElement(elementData);
    updateCanvasHeight();
  });
}

// Start of audio processing handlers and functions
let activeAudioDraft = null;

function beginAudioDraft(event) {
  if (activeAudioDraft || activeParagraphDraft || activeButtonDraft) return;

  const rect = canvas.getBoundingClientRect();
  let base = null;     // as analyzed or built
  let pattern = null;  // base, with the envelope applied if ticked
  const frameCache = {};
  let stopPreview = null;

  const make = (tag, props = {}) => Object.assign(document.createElement(tag), props);

  const draft = make("div", { className: "paragraph-draft button-draft" });
  const toolbar = make("div", { className: "paragraph-draft-toolbar" });
  const actions = make("div", { className: "paragraph-draft-actions" });

  const cancelButton = make("button", { type: "button", textContent: "Cancel" });
  const doneButton = make("button", { type: "button", textContent: "Done" });

  // --- Source ---
  const source = makeSelect([
    ["file", "Audio file"],
    ["raw", "Raw data / SVG path"],
    ["drawing", "From a drawing"]
  ]);

  const fileInput = make("input", { type: "file", accept: "audio/*" });

  const rawArea = make("textarea", {
    rows: 5,
    placeholder:
      "Numbers: 1, 4, 2, 8, 5, 9\nor SVG path data: M0 80 C40 0 80 160 120 80 L200 20"
  });

  const drawings = project.elements.filter((e) => e.type === "drawing");
  const drawingSelect = makeSelect(
    drawings.length
      ? drawings.map((d, i) => [d.id, `Drawing ${i + 1} (${d.strokes.length} strokes)`])
      : [["", "No drawings yet"]]
  );

  // --- Settings ---
  const secondsInput = make("input", { type: "number", min: 1, max: 30, step: 0.5, value: 6 });
  const bandsSelect = makeSelect([["16", "16"], ["24", "24"], ["32", "32"]]);
  bandsSelect.value = "24";
  const fminInput = make("input", { type: "number", min: 20, max: 10000, value: 110 });
  const fmaxInput = make("input", { type: "number", min: 200, max: 20000, value: 3520 });
  const colorInput = make("input", { type: "color", value: "#33ccff" });
  const bgInput = make("input", { type: "color", value: "#0b1020" });
  const modeSelect = makeSelect([
    ["spectrogram", "Spectrogram + playhead"],
    ["bars", "Live frequency bars"]
  ]);

  const loopInput = make("input", { type: "checkbox" });

  const detailSelect = makeSelect([
    ["8", "Light (8 frames/s)"],
    ["16", "Standard (16 frames/s)"],
    ["24", "Fine (24 frames/s)"],
    ["48", "Very fine (48 frames/s, short loops)"]
  ]);
  detailSelect.value = "16";

  const trimInput = make("input", { type: "checkbox", checked: true });
  const noiseInput = make("input", { type: "checkbox" });
  const bassInput = make("input", { type: "checkbox" });
  const punchInput = make("input", { type: "checkbox" });
  const drumInput = make("input", { type: "checkbox" });
  const envInput = make("input", { type: "checkbox" });
  const sawInput = make("input", { type: "checkbox" });

  const speedInput = make("input", { type: "range", min: 0.25, max: 4, step: 0.05, value: 1 });
  const speedOut = make("span", { textContent: " 1.00x" });
  const speedLabel = labelled("Playback speed", speedInput);
  speedLabel.append(speedOut);

  const detailLabel = labelled("Detail (file only)", detailSelect);
  const trimLabel = labelled("Trim silence (file only)", trimInput);

  const analyzeButton = make("button", { type: "button", textContent: "Analyze / build" });
  const previewButton = make("button", { type: "button", textContent: "▶ Preview" });
  const status = make("div", { className: "button-hint" });
  const error = make("div", { className: "button-error" });
  const preview = make("canvas", { className: "audio-preview", width: 640, height: 200 });

  const fileLabel = labelled("Audio file", fileInput);
  const rawLabel = labelled("Raw data or SVG path", rawArea);
  const drawingLabel = labelled("Drawing", drawingSelect);
  const secondsLabel = labelled("Length (seconds)", secondsInput);

  function syncSource() {
    fileLabel.hidden = source.value !== "file";
    rawLabel.hidden = source.value !== "raw";
    drawingLabel.hidden = source.value !== "drawing";
    secondsLabel.hidden = source.value === "file";
    detailLabel.hidden = source.value !== "file";
    trimLabel.hidden = source.value !== "file";
  }

  const redraw = (progress = -1) => {
    const ctx = preview.getContext("2d");
    preview.style.background = bgInput.value;

    if (!pattern) {
      ctx.clearRect(0, 0, preview.width, preview.height);
      return;
    }

    drawPattern(ctx, preview.width, preview.height, getPatternBytes(pattern), {
      color: colorInput.value,
      bg: "",
      progress,
      mode: modeSelect.value,
      cache: frameCache
    });
  };

  const speed = () => Number(speedInput.value) || 1;

  function updateStatus() {
    if (!pattern) return;
    status.textContent =
      `Ready: ${(pattern.duration / speed()).toFixed(1)} s playback ` +
      `(source ${pattern.duration.toFixed(1)} s), ${pattern.frames} x ${pattern.bands}, ` +
      `${Math.round(pattern.fmin)}-${Math.round(pattern.fmax)} Hz, ` +
      `${(pattern.data.length / 1024).toFixed(1)} KB`;
  }

  function refreshPattern() {
    pattern = base
      ? (drumInput.checked ? applyEnvelope(base, true)
        : envInput.checked ? applyEnvelope(base)
          : base)
      : null;
    updateStatus();
    redraw();
  }

  const waveValue = () =>
    drumInput.checked ? "drum"
      : noiseInput.checked ? "noise"
        : sawInput.checked ? "sawtooth"
          : "sine";

  async function build() {
    stopPreview?.();
    error.textContent = "";
    status.textContent = "Working...";
    analyzeButton.disabled = true;

    try {
      const bands = Number(bandsSelect.value);
      const fmin = Math.min(Math.max(Number(fminInput.value) || 110, 20), 10000);
      const fmax = Math.min(Math.max(Number(fmaxInput.value) || 3520, 200), 20000);
      const seconds = Math.min(Math.max(Number(secondsInput.value) || 6, 1), 30);

      if (fmax <= fmin * 1.2) throw new Error("Max frequency must be higher than min frequency.");

      if (source.value === "file") {
        const file = fileInput.files[0];
        if (!file) throw new Error("Choose an audio file first.");

        base = await analyzeAudioFile(file, bands, fmin, fmax, {
          fps: Number(detailSelect.value),
          trim: trimInput.checked,
          bass: bassInput.checked,
          punch: punchInput.checked
        });
      } else if (source.value === "raw") {
        base = patternFromText(rawArea.value, bands, seconds, fmin, fmax);
      } else {
        base = patternFromDrawing(drawingSelect.value, bands, seconds, fmin, fmax);
      }
    } catch (err) {
      base = null;
      status.textContent = "";
      error.textContent = err.message;
    } finally {
      analyzeButton.disabled = false;
      refreshPattern();
    }
  }

  const close = () => {
    stopPreview?.();
    draft.remove();
    activeAudioDraft = null;
    updateGhost();
  };

  analyzeButton.addEventListener("click", build);
  source.addEventListener("change", syncSource);
  [colorInput, bgInput, modeSelect].forEach((control) => {
    control.addEventListener("input", () => redraw());
    control.addEventListener("change", () => redraw());
  });

  envInput.addEventListener("change", refreshPattern);

  bassInput.addEventListener("change", () => {
    if (bassInput.checked && Number(fminInput.value) > 60) fminInput.value = 40;
    if (base) build();
  });
  punchInput.addEventListener("change", () => { if (base) build(); });
  drumInput.addEventListener("change", refreshPattern);

  speedInput.addEventListener("input", () => {
    speedOut.textContent = ` ${speed().toFixed(2)}x`;
    updateStatus();
  });

  previewButton.addEventListener("click", () => {
    if (stopPreview) { stopPreview(); return; }

    if (!pattern) {
      error.textContent = "Press Analyze / build first.";
      return;
    }

    previewButton.textContent = "■ Stop";

    stopPreview = playPattern(
      getPatternBytes(pattern),
      { loop: loopInput.checked, speed: speed(), wave: waveValue(), bass: bassInput.checked },
      redraw,
      () => {
        stopPreview = null;
        previewButton.textContent = "▶ Preview";
        redraw();
      }
    );
  });

  cancelButton.addEventListener("click", close);

  doneButton.addEventListener("click", () => {
    if (!pattern) {
      error.textContent = "Press Analyze / build first.";
      return;
    }

    const elementData = {
      id: crypto.randomUUID(),
      type: "audio",
      x: parseFloat(draft.style.left),
      y: parseFloat(draft.style.top),
      width: 480,
      height: 160,
      background: bgInput.value,
      color: colorInput.value,
      mode: modeSelect.value,
      speed: speed(),
      wave: waveValue(),
      bass: bassInput.checked,
      loop: loopInput.checked,
      pattern
    };

    close();

    storeInsert(elementData);
    undoStack.push({ type: "place", element: structuredClone(elementData) });
    limitHistory(undoStack);
    redoStack.length = 0;

    renderElement(elementData);
    updateCanvasHeight();
  });

  toolbar.append(
    labelled("Source", source),
    fileLabel,
    rawLabel,
    drawingLabel,
    secondsLabel,
    labelled("Bands", bandsSelect),
    detailLabel,
    trimLabel,
    speedLabel,
    labelled("Envelope (smooth attack / release)", envInput),
    labelled("Sawtooth waveform", sawInput),
    labelled("Noise bands (drums / percussion)", noiseInput),
    labelled("Boost bass (long window + harmonics)", bassInput),
    labelled("Punch (emphasize hits)", punchInput),
    labelled("Drum mode (sine kick + noise rest, tight decay)", drumInput),
    labelled("Min Hz", fminInput),
    labelled("Max Hz", fmaxInput),
    labelled("Pattern color", colorInput),
    labelled("Background", bgInput),
    labelled("View", modeSelect),
    labelled("Loop when played", loopInput),
    analyzeButton,
    status,
    error,
    preview,
    previewButton
  );

  actions.append(cancelButton, doneButton);
  draft.append(toolbar, actions);

  draft.style.left = `${event.clientX - rect.left}px`;
  draft.style.top = `${event.clientY - rect.top}px`;
  canvas.appendChild(draft);

  activeAudioDraft = { draft, close };

  syncSource();
  redraw();
}

function applyAudioLook(element, data) {
  element.style.overflow = "hidden";

  let cv = element.querySelector("canvas");

  if (!cv) {
    cv = document.createElement("canvas");
    cv.style.cssText = "width:100%;height:100%;display:block;pointer-events:none;";
    element.appendChild(cv);
  }

  const w = Math.max(1, Math.round(data.width));
  const h = Math.max(1, Math.round(data.height));

  if (cv.width !== w) cv.width = w;
  if (cv.height !== h) cv.height = h;

  // The element's own background shows through (solid or gradient).
  drawPattern(cv.getContext("2d"), w, h, getPatternBytes(data.pattern), {
    color: audioColor(data.color),
    bg: "",
    progress: -1,
    mode: data.mode
  });
}

// Start of drawing element handlers and functions

const SVG_NS = "http://www.w3.org/2000/svg";
const SAFE_HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

const round2 = (n) => Math.round(n * 100) / 100;

// Points -> smooth SVG path data. sx/sy scale local points to a target size.
function strokeToPath(points, sx = 1, sy = 1) {
  const p = points.map(([x, y]) => [x * sx, y * sy]);
  const f = round2;

  if (p.length === 1) return `M${f(p[0][0])} ${f(p[0][1])}l0.01 0`; // a dot

  let d = `M${f(p[0][0])} ${f(p[0][1])}`;

  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2;
    const my = (p[i][1] + p[i + 1][1]) / 2;
    d += `Q${f(p[i][0])} ${f(p[i][1])} ${f(mx)} ${f(my)}`;
  }

  const last = p[p.length - 1];
  return d + `L${f(last[0])} ${f(last[1])}`;
}

const hasGradient = (s) => Array.isArray(s.stops) && s.stops.length >= 2;

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// t in 0..1 along the stroke. Stops must be #rrggbb.
function colorAt(stops, t, hard) {
  const n = stops.length;

  if (hard) return stops[Math.min(n - 1, Math.floor(t * n))];

  const scaled = Math.min(Math.max(t, 0), 1) * (n - 1);
  const i = Math.min(Math.floor(scaled), n - 2);
  const k = scaled - i;
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[i + 1]);

  return "#" + a
    .map((v, j) => Math.round(v + (b[j] - v) * k).toString(16).padStart(2, "0"))
    .join("");
}

// The same smooth curve as strokeToPath, but as separate pieces with lengths.
function strokePieces(points, sx, sy) {
  const p = points.map(([x, y]) => [x * sx, y * sy]);
  const f = round2;
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  if (p.length === 1) return [{ start: p[0], cmd: "l0.01 0", len: 0.01 }];

  if (p.length === 2) {
    return [{ start: p[0], cmd: `L${f(p[1][0])} ${f(p[1][1])}`, len: dist(p[0], p[1]) }];
  }

  const pieces = [];
  let start = p[0];

  for (let i = 1; i < p.length - 1; i++) {
    const end = mid(p[i], p[i + 1]);

    pieces.push({
      start,
      cmd: `Q${f(p[i][0])} ${f(p[i][1])} ${f(end[0])} ${f(end[1])}`,
      len: dist(start, p[i]) + dist(p[i], end)
    });

    start = end;
  }

  const last = p[p.length - 1];
  pieces.push({ start, cmd: `L${f(last[0])} ${f(last[1])}`, len: dist(start, last) });

  return pieces;
}

// Solid stroke: one part. Gradient stroke: many short, colored bands.
function strokeParts(stroke, sx = 1, sy = 1) {
  if (!hasGradient(stroke)) {
    return [{ d: strokeToPath(stroke.points, sx, sy), color: stroke.color }];
  }

  const pieces = strokePieces(stroke.points, sx, sy);
  const total = pieces.reduce((sum, piece) => sum + piece.len, 0) || 1;
  const step = Math.max(2, total / 200); // at most ~200 bands per stroke

  const parts = [];
  let i = 0;
  let done = 0;

  while (i < pieces.length) {
    let d = `M${round2(pieces[i].start[0])} ${round2(pieces[i].start[1])}`;
    let len = 0;

    while (i < pieces.length && (len === 0 || len < step)) {
      d += pieces[i].cmd;
      len += pieces[i].len;
      i++;
    }

    parts.push({ d, color: colorAt(stroke.stops, (done + len / 2) / total, stroke.hard) });
    done += len;
  }

  return parts;
}

function strokeElements(stroke, sx = 1, sy = 1) {
  return strokeParts(stroke, sx, sy).map((part) => {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", part.d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", part.color);
    path.setAttribute("stroke-width", stroke.width);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    return path;
  });
}

// Draws an element's strokes into an <svg> inside it.
function applyDrawingLook(element, data) {
  element.style.background = "transparent";
  element.style.overflow = "visible";

  let svg = element.querySelector("svg");

  if (!svg) {
    svg = document.createElementNS(SVG_NS, "svg");
    svg.style.cssText =
      "position:absolute;left:0;top:0;width:100%;height:100%;" +
      "overflow:visible;pointer-events:none;display:block;";
    element.appendChild(svg);
  }

  svg.setAttribute("viewBox", `0 0 ${data.viewW} ${data.viewH}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.replaceChildren();

  /*
  for (const stroke of data.strokes) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", strokeToPath(stroke.points));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", stroke.color);
    path.setAttribute("stroke-width", stroke.width);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(path);
  }

  */

  for (const stroke of data.strokes) {
    svg.append(...strokeElements(stroke));
  }
}

// --- Live preview while the mouse is down ---
const liveSvg = document.createElementNS(SVG_NS, "svg");
liveSvg.style.cssText =
  "position:absolute;left:0;top:0;width:100%;height:100%;" +
  "pointer-events:none;z-index:9999;overflow:visible;";

function scheduleLiveRender() {
  if (liveFrame) return;

  liveFrame = requestAnimationFrame(() => {
    liveFrame = 0;
    if (activeStroke) liveSvg.replaceChildren(...strokeElements(activeStroke));
  });
}

canvas.appendChild(liveSvg);

let activeStroke = null;
let drawSession = null; // { id } of the drawing that new strokes join
let liveFrame = 0;

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();

  return [
    Math.min(Math.max(event.clientX - rect.left, 0), rect.width),
    Math.min(Math.max(event.clientY - rect.top, 0), rect.height)
  ];
}

function beginStroke(event) {
  if (activeStroke) return;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  event.preventDefault();

  const pen = readPen();

  activeStroke = {
    points: [canvasPoint(event)],
    width: pen.width,
    ...penFields(pen),
    targetId: drawSession ? drawSession.id : null
  };

  scheduleLiveRender();
}

document.addEventListener("mousemove", (event) => {
  if (!activeStroke) return;

  const [x, y] = canvasPoint(event);
  const last = activeStroke.points[activeStroke.points.length - 1];

  // Thin out the points: skip moves under 2px.
  if (Math.hypot(x - last[0], y - last[1]) < 2) return;

  activeStroke.points.push([x, y]);
  scheduleLiveRender();
});

document.addEventListener("mouseup", () => {
  if (!activeStroke) return;

  const stroke = activeStroke;
  activeStroke = null;

  if (liveFrame) {
    cancelAnimationFrame(liveFrame);
    liveFrame = 0;
  }

  liveSvg.replaceChildren();
  commitStroke(stroke);
});

const DRAWING_KEYS = ["x", "y", "width", "height", "viewW", "viewH", "strokes"];

function buildDrawingGeometry(allStrokes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const s of allStrokes) {
    const pad = s.width / 2 + 1;

    for (const [px, py] of s.points) {
      minX = Math.min(minX, px - pad);
      minY = Math.min(minY, py - pad);
      maxX = Math.max(maxX, px + pad);
      maxY = Math.max(maxY, py + pad);
    }
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return {
    x: minX + width / 2,
    y: minY + height / 2,
    width,
    height,
    viewW: width,
    viewH: height,
    strokes: allStrokes.map((s) => ({
      ...s,
      points: s.points.map(([px, py]) => [round2(px - minX), round2(py - minY)])
    }))
  };
}

// Adds one finished stroke (canvas coordinates) to the session's drawing,
// or creates a new drawing, and recomputes the box around ALL strokes.
function commitStroke(stroke) {
  // targetId was locked at mousedown; it is not part of the stored stroke.
  const { targetId, ...strokeOnly } = stroke;
  const data = targetId ? getElementData(targetId) : null;

  // A) Add a path to the existing drawing: one undo step.
  if (data) {
    const next = buildDrawingGeometry([
      ...drawingToCanvasStrokes(data),
      strokeOnly
    ]);

    const before = {};
    DRAWING_KEYS.forEach((key) => { before[key] = data[key]; });

    Object.assign(data, next); // strokes is a new array, so old snapshots stay valid

    undoStack.push({
      type: "stroke",
      id: data.id,
      before,
      after: structuredClone(next)
    });

    limitHistory(undoStack);
    redoStack.length = 0;

    updateRenderedElement(data, ["position", "size", "strokes"]);
    return; // the session stays open
  }

  // B) No drawing yet (or its target is gone): create one.
  const elementData = {
    id: crypto.randomUUID(),
    type: "drawing",
    background: "transparent",
    animate: drawAnimate.checked,
    ...buildDrawingGeometry([strokeOnly])
  };

  storeInsert(elementData);

  undoStack.push({ type: "place", element: structuredClone(elementData) });
  limitHistory(undoStack);
  redoStack.length = 0;

  renderElement(elementData);
  updateCanvasHeight();

  drawSession = { id: elementData.id };
}

drawFinish.addEventListener("click", () => { drawSession = null; });

const MAX_STOPS = 8;
const RAINBOW = ["#ff0000", "#ff9900", "#ffee00", "#22cc44", "#2299ff", "#4b2bff", "#cc33ff"];

function createStopsEditor(container, onChange) {
  let stops = ["#ff0000", "#2299ff"];

  function render() {
    container.replaceChildren();

    stops.forEach((hex, i) => {
      const row = document.createElement("span");
      row.className = "draw-stop";

      const input = Object.assign(document.createElement("input"), { type: "color", value: hex });
      input.addEventListener("input", () => { stops[i] = input.value; onChange(); });

      const remove = Object.assign(document.createElement("button"), {
        type: "button", textContent: "×", title: "Remove color"
      });
      remove.disabled = stops.length <= 2;
      remove.addEventListener("click", () => { stops.splice(i, 1); render(); onChange(); });

      row.append(input, remove);
      container.appendChild(row);
    });
  }

  render();

  return {
    get: () => [...stops],
    set(list) { stops = list.slice(0, MAX_STOPS); render(); }, // no onChange
    add() {
      if (stops.length >= MAX_STOPS) return;
      stops.push(stops[stops.length - 1]);
      render();
      onChange();
    }
  };
}

const stopsEditor = createStopsEditor(drawStopsBox, onPenChange);

function syncPenVisibility() {
  const gradient = drawPaintMode.value === "gradient";
  drawSolidLabel.hidden = gradient;
  drawGradientControls.hidden = !gradient;
}

function readPen() {
  const gradient = drawPaintMode.value === "gradient";

  return {
    width: Number(drawWidth.value) || 4,
    color: drawColor.value,
    stops: gradient ? stopsEditor.get() : null,
    hard: drawHard.checked
  };
}

// The color fields stored on a stroke.
function penFields(pen) {
  return pen.stops
    ? { color: pen.stops[0], stops: pen.stops, hard: pen.hard }
    : { color: pen.color };
}

// Make the controls show a drawing's current style (no onChange fired).
function syncPenFrom(data) {
  const last = data.strokes[data.strokes.length - 1];
  if (!last) return;

  drawWidth.value = String(last.width);

  if (hasGradient(last)) {
    drawPaintMode.value = "gradient";
    stopsEditor.set(last.stops);
    drawHard.checked = Boolean(last.hard);
  } else {
    drawPaintMode.value = "solid";
    if (/^#[0-9a-fA-F]{6}$/.test(last.color)) drawColor.value = last.color;
  }

  syncPenVisibility();
}

function drawingToCanvasStrokes(data) {
  const left = data.x - data.width / 2;
  const top = data.y - data.height / 2;
  const sx = data.width / data.viewW;
  const sy = data.height / data.viewH;

  return data.strokes.map((s) => ({
    ...s,
    points: s.points.map(([px, py]) => [left + px * sx, top + py * sy])
  }));
}

let lastStyleEdit = { id: null, time: 0 };

// Edit mode: apply the panel's style to every stroke of the selected drawing.
function applyPenToSelectedDrawing() {
  if (editorMode.value !== "edit") return;

  const data = getSelectedData();
  if (!data || data.type !== "drawing" || data.strokes.length === 0) return;

  const pen = readPen();
  const fields = penFields(pen);

  const restyled = drawingToCanvasStrokes(data).map(({ stops, hard, ...s }) => ({
    ...s,
    width: pen.width,
    ...fields
  }));

  const next = buildDrawingGeometry(restyled);

  const styleOf = (list) => JSON.stringify(
    list.map(({ color, width, stops, hard }) => [color, width, stops ?? null, Boolean(hard)])
  );

  if (styleOf(data.strokes) === styleOf(next.strokes)) return;

  const before = {};
  DRAWING_KEYS.forEach((key) => { before[key] = data[key]; });

  // Merge quick successive tweaks (slider drags) into one undo step.
  const now = performance.now();
  const top = undoStack[undoStack.length - 1];
  const merge =
    top && top.style && top.id === data.id &&
    lastStyleEdit.id === data.id && now - lastStyleEdit.time < 800;

  Object.assign(data, next);

  if (merge) {
    top.after = structuredClone(next);
  } else {
    undoStack.push({
      type: "stroke",
      style: true,
      id: data.id,
      before,
      after: structuredClone(next)
    });
    limitHistory(undoStack);
  }

  lastStyleEdit = { id: data.id, time: now };
  redoStack.length = 0;

  updateRenderedElement(data, ["position", "size", "strokes"]);
}

function onPenChange() {
  applyPenToSelectedDrawing(); // does nothing outside Edit mode
}

drawPaintMode.addEventListener("change", () => { syncPenVisibility(); onPenChange(); });
drawColor.addEventListener("input", onPenChange);
drawWidth.addEventListener("input", onPenChange);
drawHard.addEventListener("change", onPenChange);
drawAddStop.addEventListener("click", () => stopsEditor.add());
drawRainbow.addEventListener("click", () => { stopsEditor.set(RAINBOW); onPenChange(); });

syncPenVisibility();

/*
AUDIO PROCESSING SELF CONTAINED RUNTIME FUNCTIONS
 */

function bytesFromB64(b64, n) {
  var s = atob(b64), a, i;

  // Fewer bytes than cells means two 4-bit cells per byte.
  if (n && s.length < n) {
    a = new Uint8Array(n);
    for (i = 0; i < n; i++) {
      var c = s.charCodeAt(i >> 1);
      a[i] = ((i & 1) ? (c & 15) : (c >> 4)) * 17;
    }
    return a;
  }

  a = new Uint8Array(s.length);
  for (i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
}

// p = { frames, bands, bytes }, o = { color, bg, progress (-1 = idle), mode, cache }
function drawPattern(ctx, w, h, p, o) {
  ctx.clearRect(0, 0, w, h);
  if (o.bg) { ctx.fillStyle = o.bg; ctx.fillRect(0, 0, w, h); }

  var F = p.frames, B = p.bands, cw = w / F, ch = h / B;
  var cur = o.progress >= 0 ? Math.min(F - 1, Math.floor(o.progress * F)) : -1;

  function cells(c) {
    c.fillStyle = o.color;
    for (var f = 0; f < F; f++) {
      for (var k = 0; k < B; k++) {
        var val = p.bytes[f * B + k];
        if (!val) continue;
        c.globalAlpha = val / 255;
        c.fillRect(f * cw, (B - 1 - k) * ch, cw + 0.5, ch + 0.5);
      }
    }
    c.globalAlpha = 1;
  }

  if (o.mode === "bars" && cur >= 0) {
    var bw = w / B;
    ctx.fillStyle = o.color;
    for (var b = 0; b < B; b++) {
      var v = p.bytes[cur * B + b] / 255;
      ctx.globalAlpha = 0.35 + 0.65 * v;
      ctx.fillRect(b * bw + 1, h - v * h, Math.max(1, bw - 2), v * h);
    }
  } else {
    var cache = o.cache, key = w + "x" + h + o.color;

    if (cache) {
      if (cache.p !== p || cache.key !== key) {
        var oc = document.createElement("canvas");
        oc.width = w; oc.height = h;
        cells(oc.getContext("2d"));
        cache.cv = oc; cache.p = p; cache.key = key;
      }
      ctx.drawImage(cache.cv, 0, 0);
    } else {
      cells(ctx);
    }

    if (cur >= 0) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(o.progress * w, 0, 2, h);
    }
  }

  ctx.globalAlpha = 1;
}

// Additive synthesis: one oscillator per active band.
// o = { loop, speed, wave }. Returns stop().
function playPattern(p, o, onProgress, onEnd) {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { if (onEnd) setTimeout(onEnd, 0); return function () {}; }

  var ac = new AC();
  if (ac.state === "suspended") ac.resume();

  var speed = Math.min(4, Math.max(0.25, o.speed || 1));
  var wave = (o.wave === "sawtooth" || o.wave === "noise" || o.wave === "drum") ? o.wave : "sine";
  var bass = o.bass === true;
  var F = p.frames, B = p.bands, dur = p.duration / speed;

  var comp = ac.createDynamicsCompressor();
  var master = ac.createGain();
  master.gain.value =
    (wave === "sawtooth" ? 0.12 : wave === "noise" ? 0.6 : wave === "drum" ? 0.45 : 0.25) *
    (bass ? 0.8 : 1);
  master.connect(comp);
  comp.connect(ac.destination);

  var noiseBuf = null;
  if (wave === "noise" || wave === "drum") {
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var n = 0; n < nd.length; n++) nd[n] = Math.random() * 2 - 1;
  }

  var bandRatio = Math.pow(p.fmax / p.fmin, 1 / (B - 1));
  var bandQ = Math.sqrt(bandRatio) / (bandRatio - 1);

  var curves = [], freqs = [];
  var drum = wave === "drum";

  for (var b = 0; b < B; b++) {
    var freq = p.fmin * Math.pow(bandRatio, b);
    var gain = bass && freq < 200 ? 1.6 : 1;
    if (drum && freq < 160) gain *= 0.25; // the kick voice carries the low end

    var c = new Float32Array(F), any = false;
    for (var f = 0; f < F; f++) {
      var v = p.bytes[f * B + b] / 255;
      c[f] = v * gain;
      if (v > 0) any = true;
    }
    freqs.push(freq);
    curves.push(any ? c : null);
  }

  // ---- Kick detection (Drum mode): onsets in the bands below 160 Hz ----
  var kicks = [];

  if (drum) {
    var low = [];
    for (var lb = 0; lb < B; lb++) if (freqs[lb] < 160) low.push(lb);

    var peak = function (f) {
      var m = 0, who = low[0];
      for (var i = 0; i < low.length; i++) {
        var val = p.bytes[f * B + low[i]] / 255;
        if (val > m) { m = val; who = low[i]; }
      }
      return { level: m, band: who };
    };

    var gapFrames = Math.ceil(0.09 / (p.duration / F));
    var lastKick = -gapFrames;
    var prev = 0;

    for (var kf = 0; kf < F && low.length; kf++) {
      var cur = peak(kf);

      if (cur.level >= 0.3 && cur.level - prev >= 0.15 && kf - lastKick >= gapFrames) {
        // The loudest band may peak one frame later.
        var next = kf + 1 < F ? peak(kf + 1) : cur;
        var band = next.level > cur.level ? next.band : cur.band;

        kicks.push({
          pos: kf / F,
          vel: Math.min(1, Math.max(cur.level, next.level) * 1.2),
          f0: Math.min(90, Math.max(42, freqs[band]))
        });
        lastKick = kf;
      }
      prev = cur.level;
    }
  }

  var nodes = [], t0 = 0, raf = 0, stopped = false;

  function playKick(k) {
    var t = t0 + k.pos * dur;
    var start = Math.min(260, k.f0 * 3);

    // Body: a sine that falls from start to f0.
    var osc = ac.createOscillator(), og = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(start, t);
    osc.frequency.exponentialRampToValueAtTime(k.f0, t + 0.09);

    og.gain.setValueAtTime(0.0001, t);
    og.gain.linearRampToValueAtTime(k.vel, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(og);
    og.connect(master);
    osc.start(t);
    osc.stop(t + 0.32);
    nodes.push(osc);

    // Optional second harmonic for small speakers: delete this block to drop it.
    if (bass) {
      var h = ac.createOscillator(), hg = ac.createGain();
      h.type = "sine";
      h.frequency.setValueAtTime(start * 2, t);
      h.frequency.exponentialRampToValueAtTime(k.f0 * 2, t + 0.09);
      hg.gain.setValueAtTime(k.vel * 0.25, t);
      hg.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      h.connect(hg);
      hg.connect(master);
      h.start(t);
      h.stop(t + 0.16);
      nodes.push(h);
    }

    // Click: a very short, high-passed noise burst.
    var cs = ac.createBufferSource(), hp = ac.createBiquadFilter(), cg = ac.createGain();
    cs.buffer = noiseBuf;
    hp.type = "highpass";
    hp.frequency.value = 1500;
    cg.gain.setValueAtTime(k.vel * 0.35, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    cs.connect(hp);
    hp.connect(cg);
    cg.connect(master);
    cs.start(t);
    cs.stop(t + 0.03);
    nodes.push(cs);
  }

  function run() {
    t0 = ac.currentTime + 0.08;

    for (var b = 0; b < B; b++) {
      if (!curves[b]) continue;

      var freq = freqs[b];
      var tonal = wave === "sine" || wave === "sawtooth" || (wave === "drum" && freq < 160);
      var g = ac.createGain();
      var src;

      if (tonal) {
        src = ac.createOscillator();
        src.type = wave === "sawtooth" ? "sawtooth" : "sine";
        src.frequency.value = freq;
        src.connect(g);

        // Second harmonic for low sustained notes (not used in Drum mode,
        // where the kick voice has its own).
        if (bass && !drum && freq < 120) {
          var h = ac.createOscillator(), hg = ac.createGain();
          h.type = "sine";
          h.frequency.value = freq * 2;
          hg.gain.value = 0.35;
          h.connect(hg);
          hg.connect(g);
          h.start(t0);
          h.stop(t0 + dur + 0.05);
          nodes.push(h);
        }
      } else {
        src = ac.createBufferSource();
        src.buffer = noiseBuf;
        src.loop = true;
        var bp = ac.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = freq;
        bp.Q.value = bandQ;
        src.connect(bp);
        bp.connect(g);
      }

      g.gain.setValueAtTime(0, ac.currentTime);
      g.gain.setValueCurveAtTime(curves[b], t0, dur);
      g.gain.setValueAtTime(0, t0 + dur + 0.005);
      g.connect(master);
      src.start(t0);
      src.stop(t0 + dur + 0.05);
      nodes.push(src);
    }

    for (var i = 0; i < kicks.length; i++) playKick(kicks[i]);
    if (drum) console.log("kicks found:", kicks.length, kicks.map(function (k) { return Math.round(k.f0); }));
  }

  function finish() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    nodes.forEach(function (n) { try { n.stop(); } catch (e) {} });
    try { ac.close(); } catch (e) {}
    if (onEnd) onEnd();
  }

  function tick() {
    if (stopped) return;
    var t = (ac.currentTime - t0) / dur;

    if (t >= 1) {
      if (o.loop) { run(); t = 0; }
      else { finish(); return; }
    }

    if (onProgress) onProgress(Math.max(0, Math.min(1, t)));
    raf = requestAnimationFrame(tick);
  }

  run();
  tick();
  return finish;
}

// --------------------------------------------------
// AUDIO PATTERNS HELPER FUNCTIONS
// --------------------------------------------------

const PATTERN_FRAMES = 128;
const MAX_PATTERN_FRAMES = 720;
const AUDIO_HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const audioColor = (c) => (AUDIO_HEX_RE.test(c) ? c : "#33ccff");

function bytesToB64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    s += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(s);
}

// Decoded pattern for drawing and playing. Cached per pattern object.
const patternCache = new WeakMap();

function getPatternBytes(pattern) {
  let p = patternCache.get(pattern);
  if (!p) {
    p = { ...pattern, bytes: bytesFromB64(pattern.data, pattern.frames * pattern.bands) };
    patternCache.set(pattern, p);
  }
  return p;
}

function finishPattern(bytes, frames, bands, duration, fmin, fmax) {
  const n = bytes.length;
  const packed = new Uint8Array(Math.ceil(n / 2));

  for (let i = 0; i < n; i++) {
    const nib = Math.round(bytes[i] / 17); // 0..15
    packed[i >> 1] |= i & 1 ? nib : nib << 4;
  }

  return { frames, bands, duration, fmin, fmax, data: bytesToB64(packed) };
}

function plotCell(bytes, B, f, b, v) {
  if (f < 0 || f >= PATTERN_FRAMES || b < 0 || b >= B) return;
  const i = f * B + b;
  if (bytes[i] < v) bytes[i] = v;
}

// ---------- Audio file -> pattern (FFT) ----------
function fft(re, im) {
  const n = re.length;

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);

    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;

      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr;        im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
}

function analyzeBuffer(buffer, B, fmin, fmax, opts = {}) {
  const N = 2048;
  const MAX_SECONDS = 30;
  const DB_RANGE = 40;
  const GATE = 20; // out of 255: weaker cells become silence

  const sr = buffer.sampleRate;
  const length = Math.min(buffer.length, Math.ceil(120 * sr));
  const top = Math.min(fmax, (sr / 2) * 0.98);
  const ratio = top / fmin;

  if (ratio <= 1.2) throw new Error("The frequency range is too narrow.");

  const mono = new Float32Array(length);
  const channels = buffer.numberOfChannels;

  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) mono[i] += data[i] / channels;
  }

  // Region to analyze: optionally trim silence, then cap at 30 s.
  let start = 0;
  let end = length;

  if (opts.trim) {
    const block = 1024;
    const rms = [];
    let maxRms = 0;

    for (let i = 0; i < length; i += block) {
      let sum = 0;
      const stop = Math.min(length, i + block);
      for (let j = i; j < stop; j++) sum += mono[j] * mono[j];
      const r = Math.sqrt(sum / (stop - i));
      rms.push(r);
      if (r > maxRms) maxRms = r;
    }

    const limit = maxRms * 0.03;
    const first = rms.findIndex((r) => r > limit);
    const last = rms.length - 1 - [...rms].reverse().findIndex((r) => r > limit);

    if (maxRms > 0 && first !== -1) {
      start = first * block;
      end = Math.min(length, (last + 1) * block);
    }
  }

  end = Math.min(end, start + MAX_SECONDS * sr);
  if (end - start < sr * 0.5) { start = 0; end = Math.min(length, MAX_SECONDS * sr); }

  const span = end - start;
  const dur = span / sr;
  const fps = Number(opts.fps) || 16;
  const F = Math.min(MAX_PATTERN_FRAMES, Math.max(16, Math.round(dur * fps)));
  const hop = span / F;
  const S = Math.min(4, Math.max(1, Math.ceil(hop / (N / 2)))); // windows per frame

  const win = Float32Array.from(
    { length: N },
    (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1))
  );

  const re = new Float32Array(N);
  const im = new Float32Array(N);
  const binHz = sr / N;

  // Bass boost: low bands use a long window for finer frequency resolution.
  const NL = 4096;
  const LOW_EDGE = 250;
  const reL = new Float32Array(NL);
  const imL = new Float32Array(NL);
  const winL = Float32Array.from(
    { length: NL },
    (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (NL - 1))
  );
  const binHzL = sr / NL;

  const ranges = [];
  const isLow = [];

  for (let b = 0; b < B; b++) {
    const lo = fmin * Math.pow(ratio, (b - 0.5) / (B - 1));
    const hi = fmin * Math.pow(ratio, (b + 0.5) / (B - 1));
    const low = Boolean(opts.bass) && hi <= LOW_EDGE;
    const bin = low ? binHzL : binHz;
    const kMax = (low ? NL : N) / 2 - 1;
    const k0 = Math.max(1, Math.round(lo / bin));
    const k1 = Math.min(kMax, Math.max(k0, Math.round(hi / bin)));

    ranges.push([k0, k1]);
    isLow.push(low);
  }

  const anyLow = isLow.some(Boolean);
  const db = new Float32Array(F * B).fill(-200);
  let maxDb = -Infinity;

  const bandDb = (r, i2, size, b) => {
    const [k0, k1] = ranges[b];
    let power = 0;
    for (let k = k0; k <= k1; k++) power += r[k] * r[k] + i2[k] * i2[k];

    const amp = (Math.sqrt(power / (k1 - k0 + 1)) / size) * 2;
    const fc = fmin * Math.pow(ratio, b / (B - 1));
    return 20 * Math.log10(amp + 1e-9) + 3 * Math.log2(fc / fmin);
  };

  // The loudest window of a frame wins, so transients are kept.
  const put = (f, b, v) => {
    if (v > db[f * B + b]) db[f * B + b] = v;
    if (v > maxDb) maxDb = v;
  };

  for (let f = 0; f < F; f++) {
    if (anyLow) {
      const center = start + Math.floor((f + 0.5) * hop);
      const from = center - NL / 2;

      for (let i = 0; i < NL; i++) {
        const idx = from + i;
        reL[i] = idx >= 0 && idx < length ? mono[idx] * winL[i] : 0;
        imL[i] = 0;
      }

      fft(reL, imL);

      for (let b = 0; b < B; b++) {
        if (isLow[b]) put(f, b, bandDb(reL, imL, NL, b));
      }
    }

    for (let s = 0; s < S; s++) {
      const center = start + Math.floor((f + (s + 0.5) / S) * hop);
      const from = center - N / 2;

      for (let i = 0; i < N; i++) {
        const idx = from + i;
        re[i] = idx >= 0 && idx < length ? mono[idx] * win[i] : 0;
        im[i] = 0;
      }

      fft(re, im);

      for (let b = 0; b < B; b++) {
        if (!isLow[b]) put(f, b, bandDb(re, im, N, b));
      }
    }
  }

  // Per-band floor: the level a band sits at 40% of the time is background.
  const floors = new Float32Array(B);

  for (let b = 0; b < B; b++) {
    const col = [];
    for (let f = 0; f < F; f++) col.push(db[f * B + b]);
    col.sort((x, y) => x - y);
    floors[b] = col[Math.floor(col.length * 0.4)];
  }

  let norm = new Float32Array(F * B);

  for (let i = 0; i < norm.length; i++) {
    const b = i % B;
    const low = Math.max(floors[b], maxDb - DB_RANGE);
    norm[i] = Math.min(1, Math.max(0, (db[i] - low) / Math.max(1, maxDb - low)));
  }

  // Bass boost: linear gain after normalization, up to 1.9x below ~50 Hz.
  if (opts.bass) {
    for (let b = 0; b < B; b++) {
      const fc = fmin * Math.pow(ratio, b / (B - 1));
      const g = 1 + 0.9 * Math.min(1, Math.max(0, (250 - fc) / 130));
      if (g === 1) continue;
      for (let f = 0; f < F; f++) norm[f * B + b] = Math.min(1, norm[f * B + b] * g);
    }
  }

  // Punch: keep the rise of each band, drop the tails.
  if (opts.punch) {
    const out = new Float32Array(norm.length);

    for (let b = 0; b < B; b++) {
      const fc = fmin * Math.pow(ratio, b / (B - 1));

      for (let f = 0; f < F; f++) {
        const cur = norm[f * B + b];
        const prev = f ? norm[(f - 1) * B + b] : 0;

        out[f * B + b] = fc < 160
          ? cur // kicks keep their weight
          : Math.min(1, cur * 0.8 + Math.max(0, cur - prev));
      }
    }

    norm = out;
  }

  const bytes = new Uint8Array(F * B);

  for (let i = 0; i < bytes.length; i++) {
    const v = Math.round(Math.pow(norm[i], 1.4) * 255);
    bytes[i] = v < GATE ? 0 : v;
  }

  return finishPattern(bytes, F, B, Math.max(0.5, dur), fmin, top);
}

async function analyzeAudioFile(file, B, fmin, fmax, opts) {
  if (file.size > 25 * 1024 * 1024) throw new Error("The file is larger than 25 MB.");

  const AC = window.AudioContext || window.webkitAudioContext;
  const ac = new AC();

  try {
    const buffer = await ac.decodeAudioData(await file.arrayBuffer());
    return analyzeBuffer(buffer, B, fmin, fmax, opts);
  } catch (error) {
    if (error instanceof Error && !/decode/i.test(error.message) && error.name !== "EncodingError") {
      throw error;
    }
    throw new Error("Could not decode this audio file.");
  } finally {
    ac.close();
  }
}

// smooth: ~0.25 s release. tight: fast attack, 0.18 s release below 160 Hz,
// 0.06 s above, so kicks ring a little and hats stay short.
function applyEnvelope(p, tight = false) {
  const F = p.frames, B = p.bands;
  const src = bytesFromB64(p.data, F * B);
  const out = new Uint8Array(F * B);
  const dt = p.duration / F;
  const bandRatio = Math.pow(p.fmax / p.fmin, 1 / (B - 1));

  for (let b = 0; b < B; b++) {
    const freq = p.fmin * Math.pow(bandRatio, b);
    const rel = tight ? (freq < 160 ? 0.08 : 0.025) : 0.1;
    const atk = tight ? 0.004 : 0.02;
    const attack = 1 - Math.exp(-dt / atk);
    const release = Math.exp(-dt / rel);
    let y = 0;

    for (let f = 0; f < F; f++) {
      const x = src[f * B + b];
      y = x > y ? y + (x - y) * attack : Math.max(x, y * release);
      out[f * B + b] = y < 12 ? 0 : Math.round(y);
    }
  }

  return finishPattern(out, F, B, p.duration, p.fmin, p.fmax);
}

// ---------- Series and paths -> pattern ----------
const NUMBER_RE = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

function patternFromSeries(values, B, seconds, fmin, fmax) {
  const F = PATTERN_FRAMES;
  const n = values.length;

  let lo = Infinity, hi = -Infinity;
  for (const v of values) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const span = hi - lo;

  const bytes = new Uint8Array(F * B);
  let prev = null;

  for (let f = 0; f < F; f++) {
    const pos = (f / (F - 1)) * (n - 1);
    const i0 = Math.floor(pos);
    const i1 = Math.min(n - 1, i0 + 1);
    const t = pos - i0;
    const v = values[i0] * (1 - t) + values[i1] * t;
    const b = span === 0 ? Math.round((B - 1) / 2) : Math.round(((v - lo) / span) * (B - 1));

    plotCell(bytes, B, f, b, 255);
    plotCell(bytes, B, f, b - 1, 90);
    plotCell(bytes, B, f, b + 1, 90);

    if (prev !== null) {
      for (let k = Math.min(prev, b); k <= Math.max(prev, b); k++) plotCell(bytes, B, f, k, 150);
    }

    prev = b;
  }

  return finishPattern(bytes, F, B, seconds, fmin, fmax);
}

// lines: [[ [x, y], ... ], ...]. x = time, y = pitch (up = higher).
function patternFromPolylines(lines, B, seconds, fmin, fmax) {
  const F = PATTERN_FRAMES;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  for (const line of lines) {
    for (const [x, y] of line) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }

  const spanX = maxX - minX;
  const spanY = maxY - minY;

  if (!(spanX > 0)) throw new Error("The path has no horizontal extent, so it has no time axis.");

  const bandOf = (y) =>
    spanY === 0
      ? Math.round((B - 1) / 2)
      : Math.round((1 - (y - minY) / spanY) * (B - 1));

  const dx = spanX / (F - 1);
  const bytes = new Uint8Array(F * B);

  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) {
      const [x1, y1] = line[i];
      const [x2, y2] = line[i + 1];

      if (Math.abs(x2 - x1) < 1e-9) {
        // Vertical segment: a glide inside one frame.
        const f = Math.round((x1 - minX) / dx);
        const b1 = bandOf(y1), b2 = bandOf(y2);
        for (let k = Math.min(b1, b2); k <= Math.max(b1, b2); k++) plotCell(bytes, B, f, k, 255);
        continue;
      }

      const fStart = Math.ceil((Math.min(x1, x2) - minX) / dx - 1e-9);
      const fEnd = Math.floor((Math.max(x1, x2) - minX) / dx + 1e-9);

      for (let f = fStart; f <= fEnd; f++) {
        const x = minX + f * dx;
        const y = y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
        const b = bandOf(y);

        plotCell(bytes, B, f, b, 255);
        plotCell(bytes, B, f, b - 1, 90);
        plotCell(bytes, B, f, b + 1, 90);
      }
    }
  }

  return finishPattern(bytes, F, B, seconds, fmin, fmax);
}

// SVG path data -> polylines. Supports M L H V C Q Z (absolute and relative).
function parsePathData(d) {
  if (d.length > 200000) throw new Error("The path data is too long.");

  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g);
  if (!tokens) throw new Error("No path data found.");

  const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, Q: 4, Z: 0 };
  const lines = [];

  let cur = null;
  let x = 0, y = 0, sx = 0, sy = 0;
  let cmd = "";
  let i = 0;

  const num = () => {
    const v = parseFloat(tokens[i++]);
    if (!Number.isFinite(v)) throw new Error("Unexpected token in path data.");
    return v;
  };

  const lineTo = (nx, ny) => {
    if (!cur) { cur = [[x, y]]; lines.push(cur); }
    cur.push([nx, ny]);
    x = nx; y = ny;
  };

  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) {
      cmd = tokens[i++];
      if (!(cmd.toUpperCase() in ARGS)) {
        throw new Error(`Path command "${cmd}" is not supported (use M L H V C Q Z).`);
      }
    } else if (!cmd) {
      throw new Error("Path data must start with a command such as M.");
    }

    const up = cmd.toUpperCase();
    const rel = cmd !== up;
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;

    if (up === "Z") {
      if (cur) lineTo(sx, sy);
      cur = null;
      x = sx; y = sy;
      cmd = "";
    } else if (up === "M") {
      x = num() + ox; y = num() + oy;
      sx = x; sy = y;
      cur = null;
      cmd = rel ? "l" : "L"; // extra pairs after M are lines
    } else if (up === "L") {
      lineTo(num() + ox, num() + oy);
    } else if (up === "H") {
      lineTo(num() + ox, y);
    } else if (up === "V") {
      lineTo(x, num() + oy);
    } else {
      const x0 = x, y0 = y;
      const pts = [];
      for (let k = 0; k < ARGS[up] / 2; k++) pts.push([num() + ox, num() + oy]);

      for (let s = 1; s <= 16; s++) {
        const t = s / 16, u = 1 - t;

        if (up === "Q") {
          lineTo(
            u * u * x0 + 2 * u * t * pts[0][0] + t * t * pts[1][0],
            u * u * y0 + 2 * u * t * pts[0][1] + t * t * pts[1][1]
          );
        } else {
          lineTo(
            u ** 3 * x0 + 3 * u * u * t * pts[0][0] + 3 * u * t * t * pts[1][0] + t ** 3 * pts[2][0],
            u ** 3 * y0 + 3 * u * u * t * pts[0][1] + 3 * u * t * t * pts[1][1] + t ** 3 * pts[2][1]
          );
        }
      }
    }
  }

  return lines.filter((line) => line.length >= 2);
}

function patternFromText(text, B, seconds, fmin, fmax) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) throw new Error("Paste some data first.");

  // Accept whole <path d="..."> tags too.
  const attrs = [...trimmed.matchAll(/\sd\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);
  const source = attrs.length ? attrs.join(" ") : trimmed;

  // Any letter except the exponent "e" means path data.
  if (/[a-df-zA-DF-Z]/.test(source)) {
    const lines = parsePathData(source);
    if (!lines.length) throw new Error("The path has no drawable segments.");
    return patternFromPolylines(lines, B, seconds, fmin, fmax);
  }

  const values = (source.match(NUMBER_RE) || []).map(Number).slice(0, 100000);
  if (values.length < 2) throw new Error("Give at least two numbers.");

  return patternFromSeries(values, B, seconds, fmin, fmax);
}

function patternFromDrawing(id, B, seconds, fmin, fmax) {
  const data = getElementData(id);
  if (!data || data.type !== "drawing") throw new Error("Choose a drawing first.");

  const lines = data.strokes.map((s) => s.points).filter((pts) => pts.length >= 2);
  if (!lines.length) throw new Error("That drawing has no lines.");

  return patternFromPolylines(lines, B, seconds, fmin, fmax);
}

// --------------------------------------------------
// HERE STARTS THE BUTTON HELPER FUNCTIONS AND CONSTS
// --------------------------------------------------

const BUTTON_PRESETS = {
  solid: {
    label: "Solid", color: "#ffffff", background: "#3366ff",
    fontWeight: "600", borderWidth: 0, borderColor: null,
    borderRadius: 6, boxShadow: "none"
  },
  outline: {
    label: "Outline", color: "#3366ff", background: "transparent",
    fontWeight: "600", borderWidth: 2, borderColor: "text",
    borderRadius: 6, boxShadow: "none"
  },
  pill: {
    label: "Pill", color: "#ffffff",
    background: "linear-gradient(to right, #3366ff, #ff66cc)",
    fontWeight: "600", borderWidth: 0, borderColor: null,
    borderRadius: 999, boxShadow: "0 4px 12px rgba(51,102,255,0.35)"
  },
  soft: {
    label: "Soft", color: "#1f3fbf", background: "#e6ecff",
    fontWeight: "600", borderWidth: 0, borderColor: null,
    borderRadius: 10, boxShadow: "none"
  }
};

const GRADIENT_DIRECTIONS = [
  ["to right", "Left to right"],
  ["to left", "Right to left"],
  ["to bottom", "Top to bottom"],
  ["to top", "Bottom to top"],
  ["to bottom right", "Diagonal"],
  ["to bottom left", "Reverse diagonal"]
];

// Custom CSS may only use these properties. No url(), no layout properties
// (position, size, margin, display...), and no text color: use "Text paint".
const CUSTOM_CSS_ALLOWED = new Set([
  "background", "background-color", "background-image",
  "border", "border-width", "border-style", "border-color", "border-radius",
  "box-shadow", "outline", "opacity", "padding",
  "font-weight", "font-style", "letter-spacing", "line-height",
  "text-transform", "text-decoration", "text-shadow"
]);

function parseCustomCss(css) {
  const accepted = [];
  const rejected = [];

  String(css ?? "").split(";").forEach((raw) => {
    const declaration = raw.trim();
    if (!declaration) return;

    const colon = declaration.indexOf(":");
    const prop = declaration.slice(0, colon).trim().toLowerCase();
    const value = declaration.slice(colon + 1).trim();

    if (
      colon < 1 ||
      !CUSTOM_CSS_ALLOWED.has(prop) ||
      !value ||
      value.length > 200 ||
      /[<>{}\\@]|url\s*\(|expression|javascript|!important|var\(|\/\*/i.test(value)
    ) {
      rejected.push(declaration);
      return;
    }

    accepted.push([prop, value]);
  });

  return { accepted, rejected };
}

function serializeCustomCss(css) {
  return parseCustomCss(css).accepted
    .map(([prop, value]) => `${prop}: ${value}`)
    .join("; ");
}

// Returns "" (no link), a safe href, or null (rejected).
function safeHref(value) {
  const href = String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();

  if (!href) return "";

  const scheme = href.match(/^([a-z][a-z0-9+.-]*):/i);

  if (scheme) {
    return /^(https?|mailto|tel)$/i.test(scheme[1]) ? href : null;
  }

  return href; // relative path, #anchor, ?query
}

function getButtonBorderColor(preset, textColor) {
  if (preset.borderColor !== "text") return preset.borderColor;
  return /^#[0-9a-fA-F]{3,8}$/.test(textColor || "") ? textColor : "#3366ff";
}

// Styles ANY element as a button. Used by the canvas, the popup preview
// and the preset thumbnails, so what you see is what gets placed.
function applyButtonLook(element, data) {
  const preset = BUTTON_PRESETS[data.preset] || BUTTON_PRESETS.solid;
  const s = element.style;

  // Remove anything the previous custom CSS set.
  (element._customProps || []).forEach((prop) => s.removeProperty(prop));

  s.display = "flex";
  s.alignItems = "center";
  s.justifyContent = "center";
  s.boxSizing = "border-box";
  s.textAlign = "center";
  s.overflow = "hidden";
  s.userSelect = "none";
  s.lineHeight = "1.2";
  s.fontFamily = data.fontFamily || "Arial";
  s.fontSize = `${data.fontSize || 16}px`;
  s.fontWeight = preset.fontWeight;
  s.border = preset.borderWidth
    ? `${preset.borderWidth}px solid ${getButtonBorderColor(preset, data.color)}`
    : "none";
  s.borderRadius = `${preset.borderRadius}px`;
  s.boxShadow = preset.boxShadow;
  s.background = data.background || "transparent";

  // Custom CSS goes last so it can override the preset.
  const { accepted } = parseCustomCss(data.customCss);
  accepted.forEach(([prop, value]) => s.setProperty(prop, value));
  element._customProps = accepted.map(([prop]) => prop);

  let label = element.querySelector(".text-content");

  if (!label) {
    label = document.createElement("span");
    label.className = "text-content";
    element.appendChild(label);
  }

  // Allow button text to wrap -- New addition

  label.style.display = "block";
  label.style.width = "100%";
  label.style.minWidth = "0";
  label.style.whiteSpace = "normal";
  label.style.overflowWrap = "break-word";
  label.style.wordBreak = "normal";
  label.style.textAlign = "center";
  label.style.lineHeight = "1.2";

  label.textContent = data.text || "Button";
  applyParagraphTextColor(element, data); // solid or gradient text

  element.title = data.href ? `Link: ${data.href}` : "";
}

/* Rest of program logic here and listeners */

// Move the ghost with the cursor

canvas.addEventListener("mousemove", (event) => {

  pointerOverCanvas = true;

  if (!ghostAllowed()) {
    if (ghostBlock.style.display !== "none") ghostBlock.style.display = "none";
    return;
  }

  ghostBlock.style.left = event.clientX + "px";
  ghostBlock.style.top = event.clientY + "px";

  // Only restore visibility. Never overwrite a display value that's already visible.
  if (ghostBlock.style.display === "none") {
    ghostBlock.style.display = ghostDisplayValue();
  }
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

  // Edit mode selects on mousedown; nothing to do on click.
  if (editorMode.value === "edit") return;

  // Only Place mode can create elements.
  if (editorMode.value !== "place") return;

  if (!elementConfigs[activeType]) {
    alert(`Unknown element type "${activeType}". Check the element-type options.`);
    return;
  }

  // Do not place anything after drawing mousedown release == click
  if (activeType === "drawing") return;

  // Paragraphs and buttons are built in their tool popups.
  if (activeType === "text") {
    beginParagraphDraft(event);
    return;
  }

  if (activeType === "button") {
    beginButtonDraft(event);
    return;
  }

  if (activeType === "audio") {
    beginAudioDraft(event);
    return;
  }

  const rect = canvas.getBoundingClientRect();

  // Create element data using the existing structure.
  const elementData = {
    id: crypto.randomUUID(),
    type: activeType,

    x: event.clientX - rect.left,
    y: event.clientY - rect.top,

    width: activeConfig.width,
    height: activeConfig.height,

    background: activeConfig.background,
    color: activeConfig.color
  };

  // IMAGE-SPECIFIC DATA
  if (activeType === "image") {

    if (!uploadedImage) {
      alert("Please upload an image first.");
      return;
    }

    elementData.imageData = uploadedImage;
    elementData.aspectRatio = imageAspectRatio || elementData.width / elementData.height;
    elementData.objectFit = "fill";
    elementData.alt = "Uploaded image";
  }

  // Store element in project.
  storeInsert(elementData);

  // Add placement to undo history.
  undoStack.push({
    type: "place",
    element: structuredClone(elementData)
  });

  limitHistory(undoStack);

  // Clear redo history.
  redoStack.length = 0;

  // Render the placed element.
  renderElement(elementData);

  // Update canvas dimensions.
  updateCanvasHeight();
});


// Start of our moveHandler
let activeDrag = null;

canvas.addEventListener("mousedown", (event) => {

  if (event.target.closest(".paragraph-draft")) return;

  if (textEdit) {
    const inside =
      event.target.closest(".element")?.dataset.id === textEdit.id;

    if (inside) return; // let the browser place the caret / select text

    endTextEdit(true);
  }

  if (
    editorMode.value === "place" &&
    activeType === "drawing" &&
    event.button === 0
  ) {
    beginStroke(event);
    return;
  }

  if (editorMode.value === "edit") {
    // 1. Resize via a corner handle.
    const handle = event.target.closest(".resize-handle");

    if (handle && selectedElementId) {
      const data = getElementData(selectedElementId);
      if (!data) return;

      event.preventDefault();
      event.stopPropagation();

      // Natural ratio of the picture itself (works for old images too).
      let aspect = null;

      if (data.type === "image") {
        const img = domById.get(data.id)?.querySelector("img");

        aspect =
          data.aspectRatio ||
          (img?.naturalWidth && img.naturalHeight
            ? img.naturalWidth / img.naturalHeight
            : data.width / data.height);
      }

      activeResize = {
        id: data.id,
        corner: handle.dataset.corner,
        startMouseX: event.clientX,
        startMouseY: event.clientY,
        started: false,
        aspect,
        before: {
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height
        }
      };

      return;
    }

    // Presses on the dashed outline itself do nothing.
    if (event.target.closest("#selection-overlay")) return;

    // 2. Select the element UNDER THE CURSOR and start a drag.
    const element = event.target.closest(".element");

    if (!element) {
      // Empty canvas: deselect.
      selectedElementId = null;
      updateSelectionOverlay();
      updateToolbarForSelection();
      return;
    }

    const data = getElementData(element.dataset.id);
    if (!data) return;

    selectElement(element); // toolbar, paint sync and overlay

    event.preventDefault();

    activeDrag = {
      data,
      element,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: data.x,
      startY: data.y,
      started: false
    };

    return;
  }

  if (editorMode.value !== "move") return;

  const element = event.target.closest(".element");
  if (!element || !canvas.contains(element)) return;

  const data = getElementData(element.dataset.id);
  if (!data) return;

  event.preventDefault();

  activeDrag = {
    data,
    element,
    startMouseX: event.clientX,
    startMouseY: event.clientY,
    startX: data.x,
    startY: data.y,
    started: false
  };
});

function handleDocumentMouseMove(event) {
  // EDIT MODE: Resize the selected element.
  if (activeResize) {
    const resize = activeResize;

    const data = getElementData(resize.id);

    if (!data) return;

    const dx = event.clientX - resize.startMouseX;
    const dy = event.clientY - resize.startMouseY;

    // Ignore tiny movements so a click on a handle never resizes or snaps.
    if (!resize.started) {
      if (Math.hypot(dx, dy) < 3) return;
      resize.started = true;
    }

    const { x, y, width, height } = resize.before;

    const fromWest = resize.corner.includes("w");
    const fromNorth = resize.corner.includes("n");

    const sx = fromWest ? -1 : 1;
    const sy = fromNorth ? -1 : 1;

    // Locked when the checkbox is on; Shift flips it for this drag.
    const locked =
      Boolean(resize.aspect) &&
      lockImageAspect.checked !== event.shiftKey;

    let newWidth;
    let newHeight;

    if (locked) {
      // Follow whichever axis the mouse has moved further.
      const scale = Math.max(
        (width + sx * dx) / width,
        (height + sy * dy) / height
      );

      newWidth = Math.max(40, 30 * resize.aspect, width * scale);
      newHeight = newWidth / resize.aspect;
    } else {
      newWidth = Math.max(40, width + sx * dx);
      newHeight = Math.max(30, height + sy * dy);
    }

    data.width = newWidth;
    data.height = newHeight;

    // Keep the opposite corner fixed.
    data.x = x + sx * (newWidth - width) / 2;
    data.y = y + sy * (newHeight - height) / 2;

    const xEdge = fromWest ? "left" : "right";
    const yEdge = fromNorth ? "top" : "bottom";

    let xMatch = smartGuidesEnabled
      ? findBestResizeAlignment(data, "x", xEdge)
      : null;

    let yMatch = smartGuidesEnabled
      ? findBestResizeAlignment(data, "y", yEdge)
      : null;

    if (locked) {
      // Smallest size that still respects the minimums at this ratio.
      const minWidth = Math.max(40, 30 * resize.aspect);
      const minHeight = minWidth / resize.aspect;

      // Snap on whichever axis is closer; the other follows the ratio.
      const useX = xMatch && (!yMatch || xMatch.distance <= yMatch.distance);
      const useY = !useX && yMatch;

      if (useX) {
        const oldWidth = data.width;
        const oldHeight = data.height;

        data.width = Math.max(minWidth, data.width + sx * xMatch.delta);
        data.height = data.width / resize.aspect;

        data.x += sx * (data.width - oldWidth) / 2;
        data.y += sy * (data.height - oldHeight) / 2;

        yMatch = null; // the height is derived, so no guide for it
      } else if (useY) {
        const oldWidth = data.width;
        const oldHeight = data.height;

        data.height = Math.max(minHeight, data.height + sy * yMatch.delta);
        data.width = data.height * resize.aspect;

        data.x += sx * (data.width - oldWidth) / 2;
        data.y += sy * (data.height - oldHeight) / 2;

        xMatch = null; // the width is derived, so no guide for it
      }
    } else {
      // Free resize: each edge snaps independently.
      if (xMatch) {
        const oldWidth = data.width;

        data.width = Math.max(40, data.width + sx * xMatch.delta);
        data.x += sx * (data.width - oldWidth) / 2;
      }

      if (yMatch) {
        const oldHeight = data.height;

        data.height = Math.max(30, data.height + sy * yMatch.delta);
        data.y += sy * (data.height - oldHeight) / 2;
      }
    }

    // Show the matching guides during resize.
    if (smartGuidesEnabled) {
      updateAlignmentGuides(data, xMatch, yMatch);
    } else {
      hideAlignmentGuides();
    }


    // Update the visible element immediately.
    const element = domById.get(resize.id);


    if (element) {
      element.style.left = `${data.x}px`;
      element.style.top = `${data.y}px`;
      element.style.width = `${data.width}px`;
      element.style.height = `${data.height}px`;
    }

    // Keep the dashed outline and handles aligned during resizing.
    updateSelectionOverlay();

    return;
  }

  // MOVE MODE: Keep your existing movement behavior unchanged.

  if (!activeDrag) return;

  const drag = activeDrag;

  // Calculate the normal position from the original mouse position.
  const dx = event.clientX - drag.startMouseX;
  const dy = event.clientY - drag.startMouseY;

  if (!drag.started) {
    if (Math.hypot(dx, dy) < 3) return;
    drag.started = true;
  }

  drag.data.x = drag.startX + dx;
  drag.data.y = drag.startY + dy;

  // Only use smart guides in Move mode.
  if (
    smartGuidesEnabled &&
    (
      editorMode.value === "move" ||
      editorMode.value === "edit"
    )
  ) {
    const xMatch = findBestAlignment(drag.data, "x");
    const yMatch = findBestAlignment(drag.data, "y");

    // Snap the element into exact alignment.
    if (xMatch) {
      drag.data.x += xMatch.delta;
    }

    if (yMatch) {
      drag.data.y += yMatch.delta;
    }

    // Show guides for the active alignment(s).
    updateAlignmentGuides(drag.data, xMatch, yMatch);
  } else {
    hideAlignmentGuides();
  }

  // Render the updated position.
  drag.element.style.left = `${drag.data.x}px`;
  drag.element.style.top = `${drag.data.y}px`;
  updateSelectionOverlay();
}

let pendingMouseEvent = null;
let mouseFrame = 0;

document.addEventListener("mousemove", (event) => {
  // Nothing to throttle unless a drag or resize is active.
  if (!activeDrag && !activeResize) return;

  pendingMouseEvent = event;
  if (mouseFrame) return;

  mouseFrame = requestAnimationFrame(() => {
    mouseFrame = 0;
    const e = pendingMouseEvent;
    pendingMouseEvent = null;
    if (e) handleDocumentMouseMove(e);
  });
});

document.addEventListener("mouseup", (event) => {
  if (mouseFrame) {
    cancelAnimationFrame(mouseFrame);
    mouseFrame = 0;
  }
  pendingMouseEvent = null;

  // Apply the final position, but only for a real drag or resize.
  if (activeDrag || activeResize) handleDocumentMouseMove(event);

  snapCache = null;
  hideAlignmentGuides();

  // Finish resizing.
  if (activeResize) {
    const resize = activeResize;
    activeResize = null;

    const data = getElementData(resize.id);

    updateSelectionOverlay();
    if (!data) return;

    const before = resize.before;
    const after = {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height
    };

    const changed = Object.keys(before).some(
      (key) => before[key] !== after[key]
    );
    if (!changed) return;

    undoStack.push({ type: "resize", id: resize.id, before, after });
    limitHistory(undoStack);
    redoStack.length = 0;

    updateCanvasHeight();
    updateRenderedElement(data, ["size"]);
    return;
  }

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

function deleteSelectedElement() {
  if (editorMode.value !== "edit" || !selectedElementId) return;

  const data = getElementData(selectedElementId);
  if (!data) return;

  const index = storeRemove(data.id);

  undoStack.push({ type: "delete", element: { ...data }, index });
  limitHistory(undoStack);
  redoStack.length = 0;

  selectedElementId = null;
  reconcileCanvas();
}

// Helper function for undo history

function refreshAfterHistoryAction(action) {
  if (
    action.type === "place" ||
    action.type === "delete" ||
    action.type === "reorder"
  ) {
    reconcileCanvas();
    return;
  }

  const element = getElementData(action.id);

  if (!element) {
    reconcileCanvas();
    return;
  }

  if (action.type === "stroke") {
    // Redraws the SVG paths and updates box size and position.
    updateRenderedElement(element, ["position", "size", "strokes"]);
  }
  else if (action.type === "property") {
    updateRenderedElement(element, [action.property]);
  }
  else if (action.type === "move") {
    updateRenderedElement(element, ["position"]);
  }
  else if (action.type === "resize") {
    updateRenderedElement(element, ["position", "size"]);
  }
  else if (action.type === "padding") {
    updateRenderedElement(element, ["padding"]);

    if (selectedElementId === element.id) {
      syncPaddingControls(element);
      updateToolbarForSelection();
    }
  }
}

/* Logic for pushing elements to front and back in the project array
   Affects display hierarchy
 */

// direction: +1 = forward (toward the top), -1 = backward.
function reorderSelectedElement(direction) {
  if (editorMode.value !== "edit" || !selectedElementId) return;

  const index = project.elements.findIndex(
    (item) => item.id === selectedElementId
  );
  if (index === -1) return;

  const newIndex = Math.min(
    project.elements.length - 1,
    Math.max(0, index + direction)
  );

  // Already at the front or back.
  if (newIndex === index) return;

  storeMove(selectedElementId, newIndex);

  undoStack.push({
    type: "reorder",
    id: selectedElementId,
    before: index,
    after: newIndex
  });

  limitHistory(undoStack);
  redoStack.length = 0;

  reconcileCanvas();
}


// Remove an element from the store, clearing selection if it was selected.
function removeElementById(id) {
  storeRemove(id);
  if (selectedElementId === id) selectedElementId = null;
}

// Re-insert a stored copy at a given position and select it.
function restoreElement(snapshot, index) {
  storeInsert(
    { ...snapshot },
    Math.min(index ?? project.elements.length, project.elements.length)
  );

  if (editorMode.value === "edit") {
    selectedElementId = snapshot.id;

    const restored = getElementData(snapshot.id);

    if (restored) {
      activeType = restored.type;
      activeConfig = { ...elementConfigs[activeType] };
    }
  }
}

/*
function restoreElement(snapshot, index) {
  storeInsert(
    { ...snapshot },
    Math.min(index ?? project.elements.length, project.elements.length)
  );

  selectedElementId = snapshot.id;

  const restored = getElementData(snapshot.id);

  if (restored) {
    activeType = restored.type;
    activeConfig = { ...elementConfigs[activeType] };
  }
}
 */


// direction: "undo" applies the "before" state, "redo" the "after" state.
function applyHistoryAction(action, direction) {
  const isUndo = direction === "undo";
  const state = isUndo ? action.before : action.after;

  switch (action.type) {
    case "place":
      if (isUndo) removeElementById(action.element.id);
      else restoreElement(action.element);
      break;

    case "delete":
      if (isUndo) restoreElement(action.element, action.index);
      else removeElementById(action.element.id);
      break;

    case "reorder":
      storeMove(action.id, state);
      break;

    case "move":
    case "resize":
    case "padding": {
      const element = getElementData(action.id);
      if (element) Object.assign(element, state);
      break;
    }

    case "stroke": {
      const element = getElementData(action.id);
      // Clone so the live element never shares arrays with the history entry.
      if (element) Object.assign(element, structuredClone(state));
      break;
    }

    case "property": {
      const element = getElementData(action.id);
      if (element) element[action.property] = state;
      break;
    }

    default:
      console.warn("Unhandled history action:", action.type);
  }
}

function undoAction() {
  const action = undoStack.pop();
  if (!action) return;

  applyHistoryAction(action, "undo");

  redoStack.push(action);
  limitHistory(redoStack);

  refreshAfterHistoryAction(action);
  syncTypographyControls();
}

function redoAction() {
  const action = redoStack.pop();
  if (!action) return;

  applyHistoryAction(action, "redo");

  undoStack.push(action);
  limitHistory(undoStack);

  refreshAfterHistoryAction(action);
  syncTypographyControls();
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

  // Delete the selected element only in Edit mode.
  if (
    editorMode.value === "edit" &&
    selectedElementId &&
    (
      event.key === "Delete" ||
      (modifierPressed && key === "x")
    )
  ) {
    event.preventDefault();
    deleteSelectedElement();
    return;
  }

  // Stacking order: + brings forward, - sends backward.
  // Ctrl/Cmd are excluded so browser zoom (Ctrl +/-) keeps working.
  if (
    editorMode.value === "edit" &&
    selectedElementId &&
    !modifierPressed &&
    !event.altKey
  ) {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      reorderSelectedElement(1);
      return;
    }

    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      reorderSelectedElement(-1);
      return;
    }
  }

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

  applyProjectState(validateWebson({
    format: WEBSON_FORMAT,
    version: WEBSON_VERSION,
    project: version.project
  }));

}

saveButton.addEventListener("click", saveProjectVersion);
restoreButton.addEventListener("click", restoreProjectVersion);

function exportProject() {
  const payload = {
    format: WEBSON_FORMAT,
    version: WEBSON_VERSION,
    savedAt: new Date().toISOString(),
    project: structuredClone(project)
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: "application/json" }
  );

  const stamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[:T]/g, "-");

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `website-project-${stamp}.webson`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function validateWebson(data) {
  if (!data || data.format !== WEBSON_FORMAT) {
    throw new Error("This is not a .webson project file.");
  }

  if (typeof data.version !== "number" || data.version > WEBSON_VERSION) {
    throw new Error("This file was made with a newer version of the tool.");
  }

  const source = data.project;

  if (!source || !Array.isArray(source.elements)) {
    throw new Error("The project data is missing or damaged.");
  }

  const isNumber = (value) =>
    typeof value === "number" && Number.isFinite(value);

  const ids = new Set();

  const elements = source.elements.map((element, index) => {
    const label = `Element ${index + 1}`;

    if (!element || typeof element !== "object") {
      throw new Error(`${label} is invalid.`);
    }

    if (!Object.keys(elementConfigs).includes(element.type)) {
      throw new Error(`${label} has an unknown type.`);
    }

    if (
      typeof element.id !== "string" ||
      !/^[\w-]+$/.test(element.id) ||
      ids.has(element.id)
    ) {
      throw new Error(`${label} has a missing or duplicate id.`);
    }

    ids.add(element.id);

    for (const key of ["x", "y", "width", "height"]) {
      if (!isNumber(element[key])) {
        throw new Error(`${label} has an invalid ${key}.`);
      }
    }

    if (
      element.type === "image" &&
      !(
        typeof element.imageData === "string" &&
        element.imageData.startsWith("data:image/")
      )
    ) {
      throw new Error(`${label} has invalid image data.`);
    }

    if (element.type === "button") return sanitizeButton(element);
    if (element.type === "drawing") return sanitizeDrawing(element);
    if (element.type === "text") {
      return {
        ...element,
        text: normalizeParagraphText(element.text),
        typeAnimate: element.typeAnimate === true
      };
    }
    if (element.type === "audio") return sanitizeAudio(element);

    return { ...element };
  });

  // Only accept known background keys, falling back to current values.
  const background = { ...project.background };

  for (const key of Object.keys(background)) {
    if (typeof source.background?.[key] === "string") {
      background[key] = source.background[key];
    }
  }

  return { background, elements };
}

function applyProjectState(state) {
  project.background = { ...state.background };
  storeReplaceAll(state.elements.map((e) => ({ ...e })));

  // Drop anything tied to the old project.
  selectedElementId = null;
  endTextEdit(false);
  activeResize = null;
  activeDrag = null;

  // Restore the background controls.
  backgroundType.value = project.background.type;
  colorPicker.value = project.background.color;
  gradientStart.value = project.background.gradientStart;
  gradientEnd.value = project.background.gradientEnd;
  gradientDirection.value = project.background.gradientDirection;

  // History belongs to the previous project.
  undoStack.length = 0;
  redoStack.length = 0;

  updateBackgroundControls();
  updateGhost();
  renderProject();
}

importButton.addEventListener("click", () => importInput.click());

importInput.addEventListener("change", async () => {
  const file = importInput.files[0];

  // Reset so choosing the same file again still fires "change".
  importInput.value = "";

  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".webson")) {
    alert("Please choose a .webson file.");
    return;
  }

  try {
    const state = validateWebson(JSON.parse(await file.text()));

    if (
      project.elements.length > 0 &&
      !confirm("Loading replaces your current project. Continue?")
    ) {
      return;
    }

    applyProjectState(state);
  } catch (error) {
    alert(`Could not load project: ${error.message}`);
  }
});

exportButton.addEventListener("click", exportProject);

// Export helpers
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let exportUid = 0;

const SAFE_PAINT_RE =
  /^(transparent|#[0-9a-fA-F]{3,8}|linear-gradient\([a-z\s]+,\s*#[0-9a-fA-F]{3,8},\s*#[0-9a-fA-F]{3,8}\))$/;

function safePaint(value, fallback) {
  const paint = typeof value === "string" ? value.trim() : "";
  return SAFE_PAINT_RE.test(paint) ? paint : fallback;
}

function safeFont(value) {
  return typeof value === "string" && /^[\w\s,'"-]+$/.test(value)
    ? value
    : "Arial";
}

function sanitizeButton(element) {
  const fontSize = Number(element.fontSize);

  return {
    ...element,
    text: String(element.text ?? "Button").slice(0, 200),
    href: safeHref(element.href) ?? "",
    preset: BUTTON_PRESETS[element.preset] ? element.preset : "solid",
    color: safePaint(element.color, "#ffffff"),
    background: safePaint(element.background, "#3366ff"),
    customCss: serializeCustomCss(element.customCss),
    fontFamily: safeFont(element.fontFamily),
    fontSize: Number.isFinite(fontSize) ? Math.min(Math.max(fontSize, 8), 200) : 16
  };
}

function sanitizeDrawing(element) {
  const num = (v, min, max, fallback) =>
    Number.isFinite(v) ? Math.min(Math.max(v, min), max) : fallback;

  const strokes = (Array.isArray(element.strokes) ? element.strokes : [])
    .slice(0, 500)
    .map((s) => {
      const stops = Array.isArray(s?.stops)
        ? s.stops.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c)).slice(0, 8)
        : [];

      return {
        color: SAFE_HEX_RE.test(s?.color) ? s.color : "#111111",
        width: num(Number(s?.width), 1, 100, 4),
        ...(stops.length >= 2 ? { stops, hard: s.hard === true } : {}),
        points: (Array.isArray(s?.points) ? s.points : [])
          .slice(0, 20000)
          .filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]))
          .map((p) => [p[0], p[1]])
      };
    })
    .filter((s) => s.points.length > 0);

  return {
    ...element,
    background: "transparent",
    animate: element.animate === true,
    strokes,
    viewW: num(Number(element.viewW), 1, 100000, element.width),
    viewH: num(Number(element.viewH), 1, 100000, element.height)
  };
}

function sanitizeAudio(element) {
  const p = element.pattern;
  const frames = Number(p?.frames);
  const bands = Number(p?.bands);
  const clamp = (v, lo, hi, fallback) =>
    Number.isFinite(Number(v)) ? Math.min(Math.max(Number(v), lo), hi) : fallback;


  if (
    !Number.isInteger(frames) || frames < 2 || frames > 768 ||
    !Number.isInteger(bands) || bands < 2 || bands > 64
  ) {
    throw new Error("Audio pattern has an invalid size.");
  }

  const data = typeof p.data === "string" ? p.data : "";

  if (data.length > 100000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
    throw new Error("Audio pattern data is invalid.");
  }

  let length = -1;
  try { length = atob(data).length; } catch { /* stays -1 */ }

  const cells = frames * bands;
  // Either one byte per cell (older files) or two cells per byte.
  if (length !== cells && length !== Math.ceil(cells / 2)) {
    throw new Error("Audio pattern data does not match its size.");
  }

  let fmin = clamp(p.fmin, 20, 20000, 110);
  let fmax = clamp(p.fmax, 20, 20000, 3520);
  if (fmax <= fmin * 1.1) { fmin = 110; fmax = 3520; }

  return {
    ...element,
    background: safePaint(element.background, "#0b1020"),
    color: AUDIO_HEX_RE.test(element.color) ? element.color : "#33ccff",
    mode: element.mode === "bars" ? "bars" : "spectrogram",
    speed: clamp(element.speed, 0.25, 4, 1),
    wave: ["sawtooth", "noise", "drum"].includes(element.wave) ? element.wave : "sine",
    bass: element.bass === true,
    loop: element.loop === true,
    pattern: { frames, bands, duration: clamp(p.duration, 0.5, 60, 6), fmin, fmax, data }
  };
}

function getExportHeight(data) {
  return ["text", "button"].includes(data.type)
    ? measureTextElementHeight(data)
    : Number(data.height);
}

function buildButtonCss(data) {
  const preset = BUTTON_PRESETS[data.preset] || BUTTON_PRESETS.solid;
  const color = safePaint(data.color, "#ffffff");
  const background = safePaint(data.background, "#3366ff");

  const border = preset.borderWidth
    ? `${preset.borderWidth}px solid ${getButtonBorderColor(preset, color)}`
    : "none";

  const base = [
    "display:flex", "align-items:center", "justify-content:center",
    "box-sizing:border-box", "text-align:center", "text-decoration:none",
    "cursor:pointer", "overflow:hidden", "padding:0", "line-height:1.2",
    `font-family:${safeFont(data.fontFamily)}`,
    `font-size:${Number(data.fontSize) || 16}px`,
    `font-weight:${preset.fontWeight}`,
    `border:${border}`,
    `border-radius:${preset.borderRadius}px`,
    `box-shadow:${preset.boxShadow}`,
    `background:${background}`
  ];

  const custom = parseCustomCss(data.customCss).accepted
    .map(([prop, value]) => `${prop}:${value}`);

  return [...base, ...custom].join(";") + ";";
}

// Rows the paragraph wraps into, from the editor's own measurement.
/*
function typedRowCount(data) {
  const p = getParagraphPadding(data);
  const lineHeight = (Number(data.fontSize) || 16) * 1.5;
  const content = getExportHeight(data) - p.top - p.bottom;

  return Math.max(1, Math.round(content / lineHeight));
}

// CSS variables that drive the typing animation.
function typedStyle(data) {
  const chars = Array.from(String(data.text ?? "")).length;
  const rows = typedRowCount(data);
  const total = Math.min(0.04 * chars, 8);       // seconds, max 8
  const perRow = Math.max(1, Math.ceil(chars / rows));
  const lineHeight = (Number(data.fontSize) || 16) * 1.5;

  return (
    `display:block;` +
    `--L:${rows};--last:${rows - 1};--sj:${Math.max(2, rows)};` +
    `--lh:${lineHeight}px;--n:${perRow};` +
    `--rt:${(total / rows).toFixed(3)}s;--T:${total.toFixed(3)}s;`
  );
}

 */

// Makes pasted text predictable: one newline style, no hidden characters.
function normalizeParagraphText(text) {
  return String(text ?? "")
    .replace(/\r\n?|[\u2028\u2029\u0085]/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b\u2060\ufeff]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\t/g, "    ")
    .replace(/ +\n/g, "\n")     // trailing spaces before a newline
    .replace(/\n{3,}/g, "\n\n") // at most one blank line in a row
    .trim();                    // leading/trailing newlines and spaces
}

let exportExtraCss = []; // per-paragraph @keyframes, filled during export

// Lays the paragraph out off-screen exactly like the exported one and
// returns, per row: its index, character count and right edge in px.
function measureTypingRows(data) {
  const text = normalizeParagraphText(data.text);
  if (!text) return null;

  const p = getParagraphPadding(data);
  const fontSize = Number(data.fontSize) || 16;
  const lh = fontSize * 1.5;

  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "absolute", visibility: "hidden", left: "-100000px", top: "0",
    margin: "0", boxSizing: "border-box",
    width: `${Number(data.width)}px`,
    padding: `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`,
    fontFamily: safeFont(data.fontFamily),
    fontSize: `${fontSize}px`,
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word"
  });

  const span = document.createElement("span");
  span.style.display = "block";
  span.textContent = text;
  box.appendChild(span);
  document.body.appendChild(box);

  try {
    const node = span.firstChild;
    const origin = span.getBoundingClientRect();
    const range = document.createRange();

    const pieces = typeof Intl !== "undefined" && Intl.Segmenter
      ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (s) => s.segment)
      : Array.from(text);

    const rows = [];
    let offset = 0;
    let total = 0;

    for (const piece of pieces) {
      const start = offset;
      offset += piece.length;

      if (piece === "\n") continue; // a newline is not a keystroke

      range.setStart(node, start);
      range.setEnd(node, offset);

      const rect = range.getClientRects()[0];
      if (!rect) continue;

      const idx = Math.max(0, Math.floor(((rect.top + rect.bottom) / 2 - origin.top) / lh));
      const right = rect.right - origin.left;
      const last = rows[rows.length - 1];

      if (last && idx <= last.idx) {
        last.count++;
        last.right = Math.max(last.right, right);
      } else {
        rows.push({ idx, count: 1, right });
      }

      total++;
    }

    return total ? { rows, total, lh } : null;
  } finally {
    box.remove();
  }
}

// Returns the inline style that types the paragraph, or null.
function buildTypingAnimation(data) {
  const info = measureTypingRows(data);
  if (!info) return null;

  const { rows, total, lh } = info;
  const perChar = Math.min(0.04, 8 / total);   // 40ms per key, 8s max
  const duration = total * perChar;
  const EPS = 0.0001;                          // % gap between rows
  const pct = (n) => n.toFixed(4);

  let done = 0;

  const frames = rows.map((row, i) => {
    const start = i === 0 ? 0 : (done / total) * 100 + EPS;
    done += row.count;
    const end = i === rows.length - 1 ? 100 : (done / total) * 100;
    const width = Math.ceil(row.right) + 1;

    // Row start: width 0, sweeping to the row's right edge in one step per key.
    // Row end: hold, then jump to the next row's start.
    return (
      `${pct(start)}%{--r:${row.idx};--w:0px;animation-timing-function:steps(${row.count},jump-start)}` +
      `${pct(end)}%{--r:${row.idx};--w:${width}px;animation-timing-function:steps(1,jump-end)}`
    );
  }).join("");

  const name = `tw${exportUid++}`;
  exportExtraCss.push(`@keyframes ${name}{${frames}}`);

  return (
    `display:block;--lh:${lh}px;` +
    `animation:${name} ${duration.toFixed(3)}s linear forwards,` +
    `tw-done 0.001s ${(duration + 0.05).toFixed(3)}s forwards;`
  );
}

function buildElementHtml(data) {
  const width = Number(data.width);
  const height = getExportHeight(data);
  const left = Number(data.x) - width / 2;
  const top = Number(data.y) - height / 2;

  const geometry =
    `left:${left}px;top:${top}px;width:${width}px;`;

  const attr = (css) => escapeHtml(css);

  if (data.type === "header") {
    const bg = safePaint(data.background, "#3366ff");
    return `<header class="el" style="${attr(
      `${geometry}height:${height}px;background:${bg};`
    )}"></header>`;
  }

  if (data.type === "text") {
    const p = getParagraphPadding(data);
    const bg = safePaint(data.background, "transparent");
    const color = safePaint(data.color, "#000000");

    const outer =
      `${geometry}min-height:${height}px;` +
      `font-family:${safeFont(data.fontFamily)};` +
      `font-size:${Number(data.fontSize) || 16}px;` +
      `padding:${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;` +
      `background:${bg};`;

    const inner = isGradientValue(color)
      ? `color:transparent;background-image:${color};` +
      `-webkit-background-clip:text;background-clip:text;` +
      `-webkit-text-fill-color:transparent;`
      : `color:${color};`;

    const text = normalizeParagraphText(data.text);
    const typing =
      data.typeAnimate === true && text ? buildTypingAnimation(data) : null;

    const innerStyle = typing ? `${inner}${typing}` : inner;

    // No whitespace between tags: the paragraph uses white-space: pre-wrap.
    return `<p class="el" style="${attr(outer)}"><span${typing ? ` class="tw"` : ""} style="${attr(innerStyle)}">${escapeHtml(text)}</span></p>`;
  }

  if (data.type === "image") {
    if (
      typeof data.imageData !== "string" ||
      !data.imageData.startsWith("data:image/")
    ) {
      return "";
    }

    const fit = ["contain", "cover", "fill"].includes(data.objectFit)
      ? data.objectFit
      : "fill";

    return `<img class="el" src="${escapeHtml(data.imageData)}" alt="${escapeHtml(data.alt || "")}" style="${attr(
      `${geometry}height:${height}px;object-fit:${fit};display:block;`
    )}">`;
  }

  if (data.type === "button") {
    const color = safePaint(data.color, "#ffffff");
    const style = attr(`${geometry}height:${height}px;${buildButtonCss(data)}`);

    const labelStyle = isGradientValue(color)
      ? `color:transparent;background-image:${color};` +
      `-webkit-background-clip:text;background-clip:text;` +
      `-webkit-text-fill-color:transparent;`
      : `color:${color};`;

    const label =
      `<span style="${attr(labelStyle)}">${escapeHtml(data.text || "Button")}</span>`;

    const href = safeHref(data.href);

    return href
      ? `<a class="el" href="${escapeHtml(href)}" rel="noopener noreferrer" style="${style}">${label}</a>`
      : `<button type="button" class="el" style="${style}">${label}</button>`;
  }

  if (data.type === "drawing") {
    const w = width;
    const h = height;
    const sx = w / (Number(data.viewW) || w);
    const sy = h / (Number(data.viewH) || h);
    let delay = 0;

    const paths = (data.strokes || []).map((s) => {
      const sw = Math.min(Math.max(Number(s.width) || 4, 1), 100);
      const round = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;

      const dashAnim = () => {
        const style =
          ` pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;` +
          `animation:draw-line .8s ease forwards;animation-delay:${delay.toFixed(2)}s"`;
        delay += 0.8;
        return style;
      };

      // Gradient: colored bands, revealed by an animated mask when animating.
      if (hasGradient(s) && s.stops.every((c) => /^#[0-9a-fA-F]{6}$/.test(c))) {
        const bands = strokeParts(s, sx, sy)
          .map((part) => `<path d="${part.d}" ${round} stroke="${part.color}" stroke-width="${sw}"/>`)
          .join("");

        if (!data.animate) return bands;

        const id = `m${exportUid++}`;

        return (
          `<mask id="${id}" maskUnits="userSpaceOnUse" x="-50" y="-50" ` +
          `width="${w + 100}" height="${h + 100}">` +
          `<path d="${strokeToPath(s.points, sx, sy)}" ${round} stroke="#fff" ` +
          `stroke-width="${sw + 2}"${dashAnim()}/></mask>` +
          `<g mask="url(#${id})">${bands}</g>`
        );
      }

      // Solid stroke (unchanged behavior).
      const color = SAFE_HEX_RE.test(s.color) ? s.color : "#111111";

      return `<path d="${strokeToPath(s.points, sx, sy)}" ${round} stroke="${color}" ` +
        `stroke-width="${sw}"${data.animate ? dashAnim() : ""}/>`;
    }).join("");

    return `<svg class="el draw" viewBox="0 0 ${w} ${h}" style="${attr(
      `${geometry}height:${h}px;overflow:visible;`
    )}">${paths}</svg>`;
  }

  if (data.type === "audio") {
    const p = data.pattern;
    if (!p || !/^[A-Za-z0-9+/]+={0,2}$/.test(p.data || "")) return "";

    const cfg = {
      frames: Number(p.frames),
      bands: Number(p.bands),
      duration: Number(p.duration),
      fmin: Number(p.fmin),
      fmax: Number(p.fmax),
      data: p.data,
      color: AUDIO_HEX_RE.test(data.color) ? data.color : "#33ccff",
      mode: data.mode === "bars" ? "bars" : "spectrogram",
      loop: data.loop === true,
      bass: data.bass === true,
      speed: Math.min(4, Math.max(0.25, Number(data.speed) || 1)),
      wave: ["sawtooth", "noise", "drum"].includes(data.wave) ? data.wave : "sine",
    };

    const bg = safePaint(data.background, "#0b1020");

    return (
      `<div class="el ap" role="button" tabindex="0" aria-label="Play audio pattern" ` +
      `data-ap="${escapeHtml(JSON.stringify(cfg))}" ` +
      `style="${attr(`${geometry}height:${height}px;background:${bg};`)}">` +
      `<canvas style="width:100%;height:100%;display:block"></canvas>` +
      `<span class="ap-btn" aria-hidden="true">&#9654;</span></div>`
    );
  }

  return "";
}

function buildPageHtml(title) {
  const pageWidth = Math.round(canvas.clientWidth);

  const pageHeight = Math.ceil(
    project.elements.reduce((max, data) => {
      return Math.max(max, Number(data.y) + getExportHeight(data) / 2);
    }, 0)
  );

  // Reuse the canvas's solid background color if it has one.
  const canvasBg = getComputedStyle(canvas).backgroundColor;
  const pageBg =
    canvasBg &&
    canvasBg !== "transparent" &&
    canvasBg !== "rgba(0, 0, 0, 0)"
      ? canvasBg
      : "#ffffff";

  exportExtraCss = [];

  const hasAudio = project.elements.some((e) => e.type === "audio");

  const audioScript = hasAudio
    ? `<script>
${[bytesFromB64, drawPattern, playPattern].map((fn) => fn.toString()).join("\n")}
(function () {
  document.querySelectorAll(".ap").forEach(function (box) {
    var cfg;
    try { cfg = JSON.parse(box.getAttribute("data-ap")); } catch (e) { return; }

    var cv = box.querySelector("canvas");
    cv.width = box.clientWidth;
    cv.height = box.clientHeight;

    var ctx = cv.getContext("2d");
    var p = {
      frames: cfg.frames, bands: cfg.bands, duration: cfg.duration,
      fmin: cfg.fmin, fmax: cfg.fmax, bytes: bytesFromB64(cfg.data, cfg.frames * cfg.bands)
    };
    var cache = {};
    var stop = null;

    function paint(t) {
      drawPattern(ctx, cv.width, cv.height, p,
        { color: cfg.color, bg: "", progress: t, mode: cfg.mode, cache: cache });
    }

    function toggle() {
      if (stop) { stop(); return; }
      box.classList.add("playing");
            stop = playPattern(p, { loop: cfg.loop, speed: cfg.speed, wave: cfg.wave, bass: cfg.bass }, paint, function () {
        stop = null;
        box.classList.remove("playing");
        paint(-1);
      });
    }

    box.addEventListener("click", toggle);
    box.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });

    paint(-1);
  });
})();
<\/script>`
    : "";

  const body = project.elements
    .map(buildElementHtml)
    .filter(Boolean)
    .join("\n    ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: ${pageBg}; }
    .page {
      position: relative;
      width: ${pageWidth}px;
      height: ${pageHeight}px;
      margin: 0 auto;
      overflow-x: hidden;
    }
    .el { position: absolute; margin: 0; }
    p.el { line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }
    
    @keyframes draw-line { to { stroke-dashoffset: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .draw path {
        animation: none !important;
        stroke-dasharray: none !important;
        stroke-dashoffset: 0 !important;
      }
    }
    @property --w { syntax: "<length>"; inherits: false; initial-value: 0px; }
    @property --r { syntax: "<number>"; inherits: false; initial-value: 0; }

    .tw {
      --lh: 24px;
      -webkit-mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
      mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      /* layer 1: finished rows, layer 2: the row being typed */
      -webkit-mask-size: 100% calc(var(--r) * var(--lh)), var(--w) var(--lh);
      mask-size: 100% calc(var(--r) * var(--lh)), var(--w) var(--lh);
      -webkit-mask-position: 0 0, 0 calc(var(--r) * var(--lh));
      mask-position: 0 0, 0 calc(var(--r) * var(--lh));
    }
    @keyframes tw-done { to { -webkit-mask-image: none; mask-image: none; } }
    ${exportExtraCss.join("\n    ")}
    @media (prefers-reduced-motion: reduce) {
      .tw { animation: none !important; -webkit-mask: none !important; mask: none !important; }
    }
    
    .ap { cursor: pointer; overflow: hidden; }
    .ap:focus-visible { outline: 2px solid #fff; }
    .ap-btn {
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      width: 48px; height: 48px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0, 0, 0, 0.55); color: #fff;
      font: 20px/1 sans-serif; pointer-events: none;
    }
    .ap.playing .ap-btn { display: none; }
    
  </style>
</head>
<body>
  <main class="page">
    ${body}
  </main>
  ${audioScript}
</body>
</html>
`;
}

function exportHtml() {
  if (project.elements.length === 0) {
    alert("Nothing to export yet. Place some elements first.");
    return;
  }

  const title = prompt("Page title:", "My Website");
  if (title === null) return; // cancelled

  const html = buildPageHtml(title.trim() || "My Website");
  const blob = new Blob([html], { type: "text/html" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "index.html";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

exportHtmlButton.addEventListener("click", exportHtml);

// Initialize the ghost
loadSavedVersions();
updateBackgroundControls();
editorMode.value = "place";
elementType.value = "header";
setActiveElementType("header");
updateEditorMode();
//updateGhost();
renderProject();