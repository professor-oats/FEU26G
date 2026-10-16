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

// The element currently being previewed
let activeType = "header";
let activeConfig = elementConfigs[activeType];

// History of placed elements, used for undo
const placedElements = [];

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
function updateCanvasHeight() {
  const lowestPoint = placedElements.reduce((max, element) => {
    return Math.max(
      max,
      element.offsetTop + element.offsetHeight
    );
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

// Undo the last placed element with Ctrl+Z / Cmd+Z
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

// Initialize the ghost
updateGhost();