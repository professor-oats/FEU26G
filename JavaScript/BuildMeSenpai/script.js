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

const colorControls = document.getElementById("color-controls");
const imageControls = document.getElementById("image-controls");

const imageUpload = document.getElementById("image-upload");
const imageWidth = document.getElementById("image-width");
const imageHeight = document.getElementById("image-height");
const lockImageAspect = document.getElementById("lock-image-aspect");

const exportButton = document.getElementById("export-project");
const importButton = document.getElementById("import-project");
const importInput = document.getElementById("import-project-input");
const exportHtmlButton = document.getElementById("export-html");

const WEBSON_FORMAT = "webson";
const WEBSON_VERSION = 1;

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

      const width = 640;
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

/*
colorPicker.addEventListener("input", () => {
  const target = getColorTarget();

  if (editorMode.value === "edit" && selectedElementId) {
    if (target === "color") {
      updateSelectedElementProperty("color", colorPicker.value);
    } else {
      updateBackground();
    }

    return;
  }

  if (editorMode.value === "place") {
    updateBackground();
    updateGhost();
  }
});
 */

editorMode.addEventListener("change", () => {
  if (editorMode.value === "paragraph") {
    paragraphDraftPaint = {
      color: "#000000",
      background: "transparent"
    };

    document.querySelector(
      'input[name="colorTarget"][value="color"]'
    ).checked = true;

    colorPicker.value = paragraphDraftPaint.color;

    applyParagraphTypography();
  }
  /*
  else if (editorMode.value === "place" && activeType === "header") {
    // Restore the header's saved color in the picker.
    colorPicker.value = elementConfigs.header.background;
  }

   */

  else if (editorMode.value === "place") {
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
    editableProperties: ["background"]
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
    editableProperties: ["background", "color", "text"]
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
/* Separate functions for store operations parallell to project array data as source of truth */

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
  const element = document.createElement("div");

  element.classList.add("element", ...config.className.split(/\s+/));
  element.dataset.id = data.id;

  element.style.left = data.x + "px";
  element.style.top = data.y + "px";
  element.style.width = data.width + "px";

  element.style.height =
    data.type === "text"
      ? `${measureParagraphHeight(data)}px`
      : `${data.height}px`;

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
    img.style.objectFit = data.objectFit || "contain";
    img.style.display = "block";

    element.appendChild(img);
  }

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

  const affectsTextLayout =
    isText &&
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

  if (isText && affectsTextLayout) {
    data.height = measureParagraphHeight(data);
    element.style.height = `${data.height}px`;
  } else if (!isText && (changed("size") || changed("height"))) {
    element.style.height = `${data.height}px`;
  }

  // Background belongs to the outer element.
  if (changed("background")) {
    element.style.background = data.background || "transparent";
  }

  // Text-specific appearance.
  if (isText) {
    if (changed("fontFamily")) {
      element.style.fontFamily = data.fontFamily || "Arial";
    }

    if (changed("fontSize")) {
      element.style.fontSize = `${data.fontSize || 16}px`;
    }

    if (changed("padding")) {
      const p = getParagraphPadding(data);

      element.style.padding =
        `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
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

// Keep the old function name temporarily so existing callers still work.
function updateRenderedTextElement(data) {
  updateRenderedElement(data, ["padding"]);
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
  selectionOverlay.hidden = false;
}

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
  canvas.classList.toggle("paragraph-mode", mode === "paragraph");
  canvas.classList.toggle("edit-mode", mode === "edit");

  if (mode !== "place") {
    ghostBlock.style.display = "none";
  }

  if (mode !== "move") {
    hideAlignmentGuides();
  }

  updateGhost();
  updateSelectionOverlay();
  updateToolbarForSelection();
}

// Helper functions for padding updates in toolbar

function getParagraphPadding(data) {
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

function applySelectedPadding(p) {
  // Padding changes are only allowed in Edit mode.
  if (editorMode.value !== "edit" || !selectedElementId) {
    return;
  }

  const data = getElementData(selectedElementId);

  if (!data || data.type !== "text") return;

  // Capture the original padding values.
  const before = {
    paddingTop: data.paddingTop,
    paddingRight: data.paddingRight,
    paddingBottom: data.paddingBottom,
    paddingLeft: data.paddingLeft,
    paddingX: data.paddingX,
    paddingY: data.paddingY
  };

  // Prepare the new padding values.
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
    (key) => before[key] !== after[key]
  );

  if (!changed) return;

  // Apply the new values.
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

  // Refresh the visible paragraph.
  updateRenderedTextElement(data);
  syncPaddingControls(data);
  updateToolbarForSelection();
}

function handlePaddingXChange() {
  const data = getSelectedData();
  if (!data || data.type !== "text") return;

  const x = Number(paddingX.value);
  const p = getParagraphPadding(data);
  p.left = x;
  p.right = x;

  applySelectedPadding(p);
}

function handlePaddingYChange() {
  const data = getSelectedData();
  if (!data || data.type !== "text") return;

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

  if (!data || data.type !== "text") {
    paddingCssError.textContent = "Select a text paragraph first.";
    return;
  }

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

  setHidden(
    paddingControls,
    !(isEditMode && hasSelection && data.type === "text")
  );

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

  if (data.type === "text") {
    fontFamily.value = data.fontFamily || "Arial";
    paragraphFontSize.value = String(data.fontSize || 16);
    syncPaddingControls(data);
  }

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
function updateGhost() {
  if (editorMode.value !== "place") {
    ghostBlock.style.display = "none";
    return;
  }

  ghostBlock.style.display = "block";

  ghostBlock.style.width = activeConfig.width + "px";
  ghostBlock.style.height = activeConfig.height + "px";

  ghostBlock.className = activeConfig.className;

  if (elementType.value === "image") {
    if (uploadedImage) {
      ghostBlock.style.backgroundImage = `url("${uploadedImage}")`;
      ghostBlock.style.backgroundSize = "100% 100%";
      ghostBlock.style.backgroundRepeat = "no-repeat";
      ghostBlock.style.backgroundPosition = "center";
    } else {
      ghostBlock.style.backgroundImage = "none";
      ghostBlock.style.backgroundColor = "#d3d3d3";
    }

    return;
  }

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

  // Fresh copy of the defaults; also resets image state for non-image types.
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

  updateGhost();
});

/*
elementType.addEventListener("change", () => {
  activeType = elementType.value;

  activeConfig = {
    ...elementConfigs[activeType]
  };

  updateGhost();
});

 */

/*
elementType.addEventListener("change", () => {
  activeType = elementType.value;
  activeConfig = elementConfigs[activeType];

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

  // Capture the related configuration before changing anything.
  const configBefore =
    data.type === "header" && property === "background"
      ? elementConfigs.header.background
      : undefined;

  data[property] = value;

  // Keep the default header appearance synchronized.
  if (data.type === "header" && property === "background") {
    elementConfigs.header.background = value;
    updateGhost();
  }

  // Update only the affected DOM property.
  updateRenderedElement(data, [property]);

  // Record the complete history action.
  undoStack.push({
    type: "property",
    id: data.id,
    property,
    before,
    after: value,

    configBefore,
    configAfter:
      data.type === "header" && property === "background"
        ? value
        : undefined
  });

  limitHistory(undoStack);
  redoStack.length = 0;

}



function updateSelectedParagraphProperty(property, value) {
  if (editorMode.value !== "edit" || !selectedElementId) {
    return;
  }

  const data = getElementData(selectedElementId)

  if (!data || data.type !== "text") {
    return;
  }

  const before = data[property];

  // Ignore changes that don't actually change the value.
  if (before === value) return;

  // Update the project data.
  data[property] = value;

  // Update only the affected properties in the existing DOM element.
  updateRenderedElement(data, [property]);

  // Record the change so it can be undone and redone.
  undoStack.push({
    type: "property",
    id: data.id,
    property,
    before,
    after: value
  });

  limitHistory(undoStack);

  // A new edit clears the redo history.
  redoStack.length = 0;
}



// Start of ParagraphHandler

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

  // --------------------------------------------------
  // BUILD THE POPUP
  // --------------------------------------------------

  toolbar.append(
    textColorLabel,
    textColorControls,
    backgroundLabel,
    backgroundControls,
    fontFamilyLabel,
    fontSizeLabel
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
      width: textarea.offsetWidth,
      height: textarea.scrollHeight,
      text,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      color: settings.color,
      background: settings.background,
      paddingX: 10,
      paddingY: 8
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
}

function syncTypographyControls() {
  const data = getSelectedData();

  if (data?.type === "text") {
    fontFamily.value = data.fontFamily || "Arial";
    paragraphFontSize.value = String(data.fontSize || 16);
    syncPaddingControls(data);
  }

  updateToolbarForSelection();
}


paragraphFontSize.addEventListener("input", () => {
  if (editorMode.value === "edit") {
    updateSelectedParagraphProperty(
      "fontSize",
      Number(paragraphFontSize.value)
    );
  }
});

/* Rest of program logic here and listeners */

// Move the ghost with the cursor

canvas.addEventListener("mousemove", (event) => {
  if (editorMode.value !== "place" || activeDrag) {
    if (ghostBlock.style.display !== "none") ghostBlock.style.display = "none";
    return;
  }

  ghostBlock.style.left = event.clientX + "px";
  ghostBlock.style.top = event.clientY + "px";

  if (ghostBlock.style.display !== "block") ghostBlock.style.display = "block";
});

/*
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

 */

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

  // Edit mode selects on mousedown; nothing to do on click.
  if (editorMode.value === "edit") return;

  // Only Place mode can create regular elements.
  if (editorMode.value !== "place") return;

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
    elementData.objectFit = "contain";
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


/*
canvas.addEventListener("click", (event) => {
  // Ignore clicks inside the temporary paragraph editor.
  if (event.target.closest(".paragraph-draft")) return;

  // Paragraph mode opens the text editor.
  if (editorMode.value === "paragraph") {
    beginParagraphDraft(event);
    return;
  }

  if (editorMode.value === "edit") {
    // Clicking a resize handle should not clear the selection.
    if (event.target.closest("#selection-overlay")) return;

    const element = event.target.closest(".element");

    if (element && canvas.contains(element)) {
      selectElement(element);
    } else {
      selectedElementId = null;
      updateSelectionOverlay();
    }

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
    background: activeConfig.background,
    color: activeConfig.color
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

 */

// Start of our moveHandler
let activeDrag = null;

canvas.addEventListener("mousedown", (event) => {
  if (editorMode.value === "edit") {
    // 1. Resize via a corner handle.
    const handle = event.target.closest(".resize-handle");

    if (handle && selectedElementId) {
      const data = getElementData(selectedElementId);
      if (!data) return;

      event.preventDefault();
      event.stopPropagation();

      activeResize = {
        id: data.id,
        corner: handle.dataset.corner,
        startMouseX: event.clientX,
        startMouseY: event.clientY,
        started: false,
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

    const newWidth = Math.max(
      40,
      width + (fromWest ? -dx : dx)
    );

    const newHeight = Math.max(
      30,
      height + (fromNorth ? -dy : dy)
    );

    // Update the project data while dragging.
    data.width = newWidth;
    data.height = newHeight;

    // Keep the opposite corner in the same position.
    data.x =
      x + (fromWest ? -1 : 1) * (newWidth - width) / 2;

    data.y =
      y + (fromNorth ? -1 : 1) * (newHeight - height) / 2;


    // Find alignments for the edges currently being dragged.
    const xEdge = fromWest ? "left" : "right";
    const yEdge = fromNorth ? "top" : "bottom";

    const xMatch = smartGuidesEnabled
      ? findBestResizeAlignment(data, "x", xEdge)
      : null;

    const yMatch = smartGuidesEnabled
      ? findBestResizeAlignment(data, "y", yEdge)
      : null;

    // Snap the dragged vertical edge.
    if (xMatch) {
      const oldWidth = data.width;

      data.width = Math.max(
        40,
        data.width + (fromWest ? -xMatch.delta : xMatch.delta)
      );

      // Keep the opposite edge anchored, including at minimum width.
      const appliedDelta = fromWest
        ? oldWidth - data.width
        : data.width - oldWidth;

      data.x += appliedDelta / 2;
    }

    // Snap the dragged horizontal edge.
    if (yMatch) {
      const oldHeight = data.height;

      data.height = Math.max(
        30,
        data.height + (fromNorth ? -yMatch.delta : yMatch.delta)
      );

      // Keep the opposite edge anchored, including at minimum height.
      const appliedDelta = fromNorth
        ? oldHeight - data.height
        : data.height - oldHeight;

      data.y += appliedDelta / 2;
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

  if (action.type === "property") {
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

  selectedElementId = snapshot.id;

  const restored = getElementData(snapshot.id);

  if (restored) {
    activeType = restored.type;
    activeConfig = { ...elementConfigs[activeType] };
  }
}

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
      // before/after are array indices.
      storeMove(action.id, state);
      break;

    case "move":     // { x, y }
    case "resize":   // { x, y, width, height }
    case "padding": { // padding fields
      const element = getElementData(action.id);
      if (element) Object.assign(element, state);
      break;
    }

    case "property": {
      const element = getElementData(action.id);
      if (!element) break;

      element[action.property] = state;

      // Restore the header's default color when applicable.
      const configValue = isUndo
        ? action.configBefore
        : action.configAfter;

      if (configValue !== undefined) {
        elementConfigs[element.type].background = configValue;
        updateGhost();
      }
      break;
    }
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

  /*
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

   */
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

function getExportHeight(data) {
  return data.type === "text"
    ? measureParagraphHeight(data)
    : Number(data.height);
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

    // No whitespace between tags: the paragraph uses white-space: pre-wrap.
    return `<p class="el" style="${attr(outer)}"><span style="${attr(inner)}">${escapeHtml(data.text)}</span></p>`;
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
      : "contain";

    return `<img class="el" src="${escapeHtml(data.imageData)}" alt="${escapeHtml(data.alt || "")}" style="${attr(
      `${geometry}height:${height}px;object-fit:${fit};display:block;`
    )}">`;
  }

  if (data.type === "button") {
    const bg = safePaint(data.background, "#3366ff");
    const color = safePaint(data.color, "#ffffff");

    return `<button type="button" class="el" style="${attr(
      `${geometry}height:${height}px;background:${bg};color:${color};` +
      `border:0;font:inherit;cursor:pointer;`
    )}">${escapeHtml(data.text || "")}</button>`;
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
  </style>
</head>
<body>
  <main class="page">
    ${body}
  </main>
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
updateGhost();
renderProject();