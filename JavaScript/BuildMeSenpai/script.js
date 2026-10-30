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

const paddingControls = document.getElementById("padding-controls");
const paddingX = document.getElementById("padding-x");
const paddingY = document.getElementById("padding-y");
const paddingXValue = document.getElementById("padding-x-value");
const paddingYValue = document.getElementById("padding-y-value");
const paddingCss = document.getElementById("padding-css");
const applyPaddingCssButton = document.getElementById("apply-padding-css");
const paddingCssError = document.getElementById("padding-css-error");

// EVENT LISTENERS
backgroundType.addEventListener("change", updateBackgroundControls);
gradientStart.addEventListener("input", updateBackground);
gradientEnd.addEventListener("input", updateBackground);
gradientDirection.addEventListener("change", updateBackground);
gradientDirection.addEventListener("change", updateBackgroundControls);

paddingX.addEventListener("input", handlePaddingXChange);
paddingY.addEventListener("input", handlePaddingYChange);
applyPaddingCssButton.addEventListener("click", handleApplyPaddingCss);



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
  else if (editorMode.value === "place" && activeType === "header") {
    // Restore the header's saved color in the picker.
    colorPicker.value = elementConfigs.header.background;
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

// GENERAL HELPER FUNCTIONS HERE FOR NOW
// Helper function to get dynamic for Paragraph Height
function measureParagraphHeight(data) {
  const measure = document.createElement("div");

  measure.style.position = "absolute";
  measure.style.visibility = "hidden";
  measure.style.left = "-100000px";
  measure.style.top = "0";
  measure.style.width = `${data.width}px`;
  measure.style.boxSizing = "border-box";
  measure.style.fontFamily = data.fontFamily || "Arial";
  measure.style.fontSize = `${data.fontSize || 16}px`;
  measure.style.lineHeight = "1.5";
  measure.style.overflowWrap = "break-word";
  measure.style.whiteSpace = "pre-wrap";

  const p = getParagraphPadding(data);
  measure.style.padding =
    `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;

  measure.textContent = data.text || "";
  document.body.appendChild(measure);

  const height = measure.scrollHeight;
  measure.remove();

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


function renderElement(data) {
  const config = elementConfigs[data.type];
  const element = document.createElement("div");

  element.classList.add("element", config.className);
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

    const p = getParagraphPadding(data);

    element.style.padding =
      `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;

    const textContent = document.createElement("span");
    textContent.className = "text-content";
    textContent.textContent = data.text || "";

    element.appendChild(textContent);

    applyParagraphTextColor(element, data);
  }

  canvas.appendChild(element);
}

// Targeted render of element
function updateRenderedElement(data, changedProperties = null) {
  const element = Array.from(
    canvas.querySelectorAll(".element")
  ).find((item) => item.dataset.id === data.id);

  // Recovery path if the element is missing from the canvas.
  if (!element) {
    renderProject();
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
let selectedElement = null;  // unused for now
let selectedElementData = null;
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
function findBestAlignment(movingData, axis) {
  const moving = getElementBounds(movingData);
  const movingValues = axis === "x"
    ? [moving.left, moving.centerX, moving.right]
    : [moving.top, moving.centerY, moving.bottom];

  const threshold = 6;
  let bestMatch = null;

  for (const targetData of project.elements) {
    if (targetData.id === movingData.id) continue;

    const target = getElementBounds(targetData);
    const targetValues = axis === "x"
      ? [target.left, target.centerX, target.right]
      : [target.top, target.centerY, target.bottom];

    for (const movingValue of movingValues) {
      for (const targetValue of targetValues) {
        const delta = targetValue - movingValue;
        const distance = Math.abs(delta);

        if (
          distance <= threshold &&
          (!bestMatch || distance < bestMatch.distance)
        ) {
          bestMatch = {
            delta,
            distance,
            position: targetValue,
            targetData
          };
        }
      }
    }
  }

  return bestMatch;
}


function findBestResizeAlignment(movingData, axis, edge) {
  const moving = getElementBounds(movingData);

  // Only the edge being dragged can trigger a resize snap.
  const movingValue = moving[edge];

  const threshold = 6;
  let bestMatch = null;

  for (const targetData of project.elements) {
    if (targetData.id === movingData.id) continue;

    const target = getElementBounds(targetData);

    const targetValues = axis === "x"
      ? [target.left, target.centerX, target.right]
      : [target.top, target.centerY, target.bottom];

    for (const targetValue of targetValues) {
      const delta = targetValue - movingValue;
      const distance = Math.abs(delta);

      if (
        distance <= threshold &&
        (!bestMatch || distance < bestMatch.distance)
      ) {
        bestMatch = {
          delta,
          distance,
          position: targetValue,
          targetData
        };
      }
    }
  }

  return bestMatch;
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

function selectElement(element) {
  selectedElementId = element.dataset.id;

  const data = project.elements.find(
    (item) => item.id === selectedElementId
  );

  if (!data) return;

  selectedElementData = data;
  activeType = data.type;
  activeConfig = elementConfigs[activeType];

  if (data.type === "text") {
    fontFamily.value = data.fontFamily || "Arial";
    paragraphFontSize.value = String(data.fontSize || 16);
    syncPaddingControls(data);
  }

  updateToolbarForSelection();
  updateSelectionOverlay();
}

function updateSelectionOverlay() {
  if (editorMode.value !== "edit" || !selectedElementId) {
    selectionOverlay.hidden = true;
    return;
  }

  const data = project.elements.find(
    (item) => item.id === selectedElementId
  );

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
  canvas.querySelectorAll(".element").forEach((element) => {
    element.remove();
  });

  project.elements.forEach(renderElement);

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

  const data = project.elements.find(
    (item) => item.id === selectedElementId
  );

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

  selectedElementData = data;

  syncPaddingControls(data);
  updateToolbarForSelection();
}

function handlePaddingXChange() {
  const x = Number(paddingX.value);

  const p = getParagraphPadding(selectedElementData);
  p.left = x;
  p.right = x;

  applySelectedPadding(p);
}

function handlePaddingYChange() {
  const y = Number(paddingY.value);

  const p = getParagraphPadding(selectedElementData);
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

  if (
    !selectedElementData ||
    selectedElementData.type !== "text"
  ) {
    paddingCssError.textContent = "Select a text paragraph first.";
    return;
  }

  applySelectedPadding(parsed);
}


function updateToolbarForSelection() {
  const isEditMode = editorMode.value === "edit";
  const hasSelection = Boolean(selectedElementData && activeConfig);

  // Hide the padding panel unless a text element is selected in Edit mode.
  paddingControls.hidden = !(
    isEditMode &&
    hasSelection &&
    selectedElementData.type === "text"
  );

  // Keep the existing property controls selection-aware.
  if (!hasSelection) {
    return;
  }

  const editable = activeConfig.editableProperties;

  backgroundControls.hidden = !editable.includes("background");
  colorControls.hidden = !editable.includes("color");
  fontFamilyControls.hidden = !editable.includes("fontFamily");
  fontSizeControls.hidden = !editable.includes("fontSize");
  textControls.hidden = !editable.includes("text");
}

/* Check what type of color change that will be wanted - background || color for example */

function getColorTarget() {
  return document.querySelector(
    'input[name="colorTarget"]:checked'
  )?.value || "color";
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
      const data = project.elements.find(
        (item) => item.id === selectedElementId
      );

      if (!data) return;

      if (target === "color") {
        colorPicker.value = data.color || "#000000";
      }

      if (
        target === "background" &&
        data.background &&
        !data.background.startsWith("linear-gradient")
      ) {
        colorPicker.value = data.background;
      }
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
  const selectedData = selectedElementId
    ? project.elements.find(
      (item) => item.id === selectedElementId
    )
    : null;

  // When editing an element, update the selected paint target.
  if (selectedData) {
    const property = target === "color" ? "color" : "background";
    const config = elementConfigs[selectedData.type];

    if (!config?.editableProperties?.includes(property)) {
      return;
    }

    const value =
      backgroundType.value === "solid"
        ? colorPicker.value
        : createGradientValue(
          gradientDirection.value,
          gradientStart.value,
          gradientEnd.value
        );

    updateSelectedElementProperty(property, value);
    return;
  }


  // Preserve the existing background behavior when no element is selected.
  const config = elementConfigs.header;

  if (backgroundType.value === "solid") {
    config.background = colorPicker.value;
  } else {
    config.background =
      createGradientValue(
        gradientDirection.value,
        gradientStart.value,
        gradientEnd.value
      );
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

});

// Helper function for the paragraphHandler
function applyParagraphTypography() {
  if (!activeParagraphDraft) return;

  const { textarea, textareaWrap, settings } = activeParagraphDraft;

  textarea.style.fontFamily = settings.fontFamily;
  textarea.style.fontSize = `${settings.fontSize}px`;

  const textIsGradient = isGradientValue(settings.color);
  const backgroundIsGradient = isGradientValue(settings.background);

  // Reset previous preview paint on both elements
  textarea.style.backgroundImage = "none";
  textarea.style.backgroundClip = "";
  textarea.style.webkitBackgroundClip = "";
  textarea.style.MozBackgroundClip = "";
  textarea.style.backgroundOrigin = "";

  if (textareaWrap) {
    textareaWrap.style.backgroundImage = "none";
    textareaWrap.style.backgroundColor = "transparent";
  }

  // 1. Handle Text Color / Text Gradient
  if (!textIsGradient) {
    textarea.style.color = settings.color || "#000000";
    textarea.style.webkitTextFillColor = settings.color || "#000000";
  } else {
    // Gradient text needs transparent text fill to show the gradient
    textarea.style.color = "transparent";
    textarea.style.webkitTextFillColor = "transparent";
    textarea.style.backgroundImage = settings.color;
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

/*
function updateSelectedParagraphProperty(property, value) {
  if (editorMode.value !== "edit" || !selectedElementId) {
    return;
  }

  const data = project.elements.find(
    (item) => item.id === selectedElementId
  );

  if (!data || data.type !== "text") {
    return;
  }

  const before = data[property];

  // Ignore changes that don't actually change the value.
  if (before === value) return;

  // Update the project data.
  data[property] = value;

  // Update the visible paragraph immediately.
  const element = [...canvas.querySelectorAll(".element")]
    .find((item) => item.dataset.id === selectedElementId);

  if (element) {
    if (property === "fontFamily") {
      element.style.fontFamily = value;
    }

    if (property === "fontSize") {
      element.style.fontSize = `${value}px`;
    }
  }

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
 */

// Function to update element property that checks for the editabeProperties of each element
// In project data set


function updateSelectedElementProperty(property, value) {
  if (editorMode.value !== "edit" || !selectedElementId) {
    return;
  }

  const data = project.elements.find(
    (item) => item.id === selectedElementId
  );

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

  selectedElementData = data;
}



function updateSelectedParagraphProperty(property, value) {
  if (editorMode.value !== "edit" || !selectedElementId) {
    return;
  }

  const data = project.elements.find(
    (item) => item.id === selectedElementId
  );

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


paragraphFontSize.addEventListener("input", () => {
  if (editorMode.value === "edit") {
    updateSelectedParagraphProperty(
      "fontSize",
      Number(paragraphFontSize.value)
    );
  }
});


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

// Start of our moveHandler
let activeDrag = null;

canvas.addEventListener("mousedown", (event) => {
  // Edit mode: resize using a corner handle.
  if (editorMode.value === "edit") {
    // 1. KEEP your existing resize-handle code here.
    const handle = event.target.closest(".resize-handle");

    if (handle && selectedElementId) {
      const data = project.elements.find(
        (item) => item.id === selectedElementId
      );

      if (!data) return;

      event.preventDefault();
      event.stopPropagation();

      activeResize = {
        id: data.id,
        corner: handle.dataset.corner,
        startMouseX: event.clientX,
        startMouseY: event.clientY,
        before: {
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height
        }
      };

      return;
    }

    // 2. NEW: Start moving an element in Edit mode.
    const element = event.target.closest(".element");
    if (!element) return;

    const data = project.elements.find(
      (item) => item.id === element.dataset.id
    );

    if (!data) return;

    /* Update selected element and selectionoverlay properly */
    selectedElementId = data.id;
    updateSelectionOverlay();

    event.preventDefault();

    activeDrag = {
      data,
      element,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: data.x,
      startY: data.y
    };

    return;
  }


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
  // EDIT MODE: Resize the selected element.
  if (activeResize) {
    const resize = activeResize;

    const data = project.elements.find(
      (item) => item.id === resize.id
    );

    if (!data) return;

    const dx = event.clientX - resize.startMouseX;
    const dy = event.clientY - resize.startMouseY;

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
    const element = canvas.querySelector(
      `.element[data-id="${resize.id}"]`
    );

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
});

document.addEventListener("mouseup", () => {

  hideAlignmentGuides();

  // Finish resizing.
  if (activeResize) {
    const resize = activeResize;
    activeResize = null;

    const data = project.elements.find(
      (item) => item.id === resize.id
    );

    // Refresh the outline using the final dimensions.
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

    undoStack.push({
      type: "resize",
      id: resize.id,
      before,
      after
    });

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
  // Deletion is only allowed in Edit mode.
  if (editorMode.value !== "edit" || !selectedElementId) {
    return;
  }

  const index = project.elements.findIndex(
    (element) => element.id === selectedElementId
  );

  if (index === -1) return;

  // Save the element and its original position in the array.
  const element = { ...project.elements[index] };

  project.elements.splice(index, 1);

  undoStack.push({
    type: "delete",
    element,
    index
  });

  limitHistory(undoStack);
  redoStack.length = 0;

  // Clear the selection because that element no longer exists.
  selectedElementId = null;

  // Rebuild the canvas and hide the selection outline.
  renderProject();
}

// Helper function for undo history

function refreshAfterHistoryAction(action) {
  // Adding or removing elements changes the canvas structure.
  if (action.type === "place" || action.type === "delete") {
    renderProject();
    return;
  }

  const element = project.elements.find(
    (item) => item.id === action.id
  );

  if (!element) {
    renderProject();
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
    updateRenderedTextElement(element);

    if (selectedElementId === element.id) {
      selectedElementData = element;

      syncPaddingControls(element);
      updateToolbarForSelection();
    }
  }

}


function undoAction() {
  const action = undoStack.pop();

  if (!action) return;

  if (action.type === "place") {
    project.elements = project.elements.filter(
      (element) => element.id !== action.element.id
    );
  }

  else if (action.type === "delete") {
    // Restore the deleted element at its original position.
    project.elements.splice(
      Math.min(action.index, project.elements.length),
      0,
      { ...action.element }
    );

    // Restore its selection.
    selectedElementId = action.element.id;

    const restoredElement = project.elements.find(
      (element) => element.id === selectedElementId
    );

    if (restoredElement) {
      activeType = restoredElement.type;
      activeConfig = elementConfigs[activeType];
    }
  }

  else if (action.type === "move") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      element.x = action.before.x;
      element.y = action.before.y;
    }
  }

  else if (action.type === "resize") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      Object.assign(element, action.before);
    }
  }

  else if (action.type === "padding") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      Object.assign(element, action.before);
    }
  }


  else if (action.type === "property") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      element[action.property] = action.before;

      // Restore the associated configuration when applicable.
      if (action.configBefore !== undefined) {
        elementConfigs[element.type].background =
          action.configBefore;

        updateGhost();
      }
    }
  }


  redoStack.push(action);
  limitHistory(redoStack);
  refreshAfterHistoryAction(action);
  syncTypographyControls();

}

function redoAction() {
  const action = redoStack.pop();

  if (!action) return;

  if (action.type === "place") {
    project.elements.push({ ...action.element });
  }

  else if (action.type === "delete") {
    project.elements = project.elements.filter(
      (element) => element.id !== action.element.id
    );

    if (selectedElementId === action.element.id) {
      selectedElementId = null;
    }
  }

  else if (action.type === "move") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      element.x = action.after.x;
      element.y = action.after.y;
    }
  }

  else if (action.type === "resize") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      Object.assign(element, action.after);
    }
  }


  else if (action.type === "padding") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      Object.assign(element, action.after);
    }
  }


  else if (action.type === "property") {
    const element = project.elements.find(
      (item) => item.id === action.id
    );

    if (element) {
      element[action.property] = action.after;

      // Restore the associated configuration when applicable.
      if (action.configAfter !== undefined) {
        elementConfigs[element.type].background =
          action.configAfter;

        updateGhost();
      }
    }
  }



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