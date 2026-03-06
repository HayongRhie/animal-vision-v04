console.log("✅ main.js loaded");

const $ = (id) => document.getElementById(id);

// Elements
const video = $("video");
const canvas = $("canvas");

const welcomeScreen = $("welcomeScreen");
const appShell = $("appShell");
const startBtn = $("startBtn");
const openIntroGuideBtn = $("openIntroGuideBtn");
const helpBtn = $("helpBtn");
const resetBtn = $("resetBtn");
const toggleControlsBtn = $("toggleControlsBtn");
const collapseControlsBtn = $("collapseControlsBtn");
const controls = $("controls");
const homeBtn = $("homeBtn");

const modeEl = $("mode");
const strengthEl = $("strength");
const uvEl = $("uv");
const compareEl = $("compare");
const splitEl = $("split");
const splitRow = $("splitRow");
const strengthLabel = $("strengthLabel");
const uvLabel = $("uvLabel");
const modeTitle = $("modeTitle");

const thermalLegend = $("thermalLegend");

const learnBtn = $("learnBtn");
const colourBtn = $("colourBtn");

const statusEl = $("status");

const modalBackdrop = $("modalBackdrop");
const modalTitleEl = $("modalTitle");
const modalBody = $("modalBody");
const modalClose = $("modalClose");

let cameraStarted = false;

/* ---------- Helpers ---------- */
function goHome() {

  // stop camera
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
  }

  cameraStarted = false;

  // hide app
  appShell.classList.remove("ready");
  appShell.setAttribute("aria-hidden", "true");

  // show welcome page
  welcomeScreen.style.display = "flex";

  setStatus("", false);
  document.body.classList.add("appRunning");
}

function setStatus(html, show = true) {
  if (!statusEl) return;
  statusEl.innerHTML = html;
  statusEl.style.display = show ? "block" : "none";
}

function safeOn(el, event, handler) {
  if (!el) {
    console.warn(`[UI] Missing element for ${event} listener.`);
    return;
  }
  el.addEventListener(event, handler);
}
safeOn(homeBtn, "click", goHome);

function showAppUI() {
  if (appShell) {
    appShell.classList.add("ready");
    appShell.setAttribute("aria-hidden", "false");
  }
  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
  }
  if (controls) {
    controls.classList.remove("controlsCollapsed");
  }
  updateControlsButton();
  document.body.classList.add("appRunning");
}

function resetControls() {
  if (modeEl) modeEl.value = "0";
  if (strengthEl) strengthEl.value = "0.85";
  if (uvEl) uvEl.value = "0.75";
  if (compareEl) compareEl.checked = true;
  if (splitEl) splitEl.value = "0.5";
  updateCompareUI();
  updateUIForMode();
  setStatus("Controls reset to default values.", true);
  setTimeout(() => setStatus("", false), 1400);
}

function updateControlsButton() {
  const controls = document.getElementById("controls");
  const btn = document.getElementById("toggleControlsBtn");
  if (!controls || !btn) return;

  btn.textContent = controls.classList.contains("controlsCollapsed")
    ? "Show"
    : "Hide";
}

function toggleControls() {
  const controls = document.getElementById("controls");
  if (!controls) return;

  controls.classList.toggle("controlsCollapsed");
  updateControlsButton();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* ---------- Tiny SVG graphics ---------- */

function wavelengthScaleSVG() {
  return `
  <svg class="learnSvg" viewBox="0 0 520 120" xmlns="http://www.w3.org/2000/svg" aria-label="Wavelength scale">
    <defs>
      <linearGradient id="visGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6b00ff"/>
        <stop offset="18%" stop-color="#0066ff"/>
        <stop offset="42%" stop-color="#00b0ff"/>
        <stop offset="58%" stop-color="#00ff6a"/>
        <stop offset="75%" stop-color="#ffe600"/>
        <stop offset="100%" stop-color="#ff3b3b"/>
      </linearGradient>
    </defs>

    <text x="10" y="20" fill="rgba(255,255,255,0.85)" font-size="14" font-family="system-ui">Electromagnetic spectrum (simplified)</text>

    <rect x="10" y="38" width="500" height="18" rx="9" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)"/>

    <rect x="10" y="38" width="130" height="18" rx="9" fill="rgba(155,80,255,0.25)"/>
    <text x="18" y="52" fill="rgba(255,255,255,0.8)" font-size="12" font-family="system-ui">UV</text>

    <rect x="140" y="38" width="220" height="18" rx="9" fill="url(#visGrad)"/>
    <text x="150" y="52" fill="rgba(0,0,0,0.8)" font-size="12" font-family="system-ui">Visible (≈400–700 nm)</text>

    <rect x="360" y="38" width="150" height="18" rx="9" fill="rgba(255,120,80,0.22)"/>
    <text x="370" y="52" fill="rgba(255,255,255,0.8)" font-size="12" font-family="system-ui">IR</text>

    <text x="10" y="80" fill="rgba(255,255,255,0.72)" font-size="12" font-family="system-ui">~300 nm</text>
    <text x="140" y="80" fill="rgba(255,255,255,0.72)" font-size="12" font-family="system-ui">400</text>
    <text x="250" y="80" fill="rgba(255,255,255,0.72)" font-size="12" font-family="system-ui">550</text>
    <text x="350" y="80" fill="rgba(255,255,255,0.72)" font-size="12" font-family="system-ui">700</text>
    <text x="470" y="80" fill="rgba(255,255,255,0.72)" font-size="12" font-family="system-ui">~1000+ nm</text>

    <text x="10" y="105" fill="rgba(255,255,255,0.65)" font-size="12" font-family="system-ui">
      A phone or laptop camera measures RGB in visible light only.
    </text>
  </svg>
  `;
}

function coneDiagramSVG() {
  return `
  <svg class="learnSvg" viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg" aria-label="Human photoreceptors diagram">
    <text x="10" y="20" fill="rgba(255,255,255,0.85)" font-size="14" font-family="system-ui">Human photoreceptors (simplified)</text>

    <g>
      <rect x="20" y="40" width="110" height="70" rx="16" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)"/>
      <text x="75" y="75" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="18" font-family="system-ui" font-weight="700">S</text>
      <text x="75" y="100" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="12" font-family="system-ui">short</text>
    </g>

    <g>
      <rect x="155" y="40" width="110" height="70" rx="16" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)"/>
      <text x="210" y="75" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="18" font-family="system-ui" font-weight="700">M</text>
      <text x="210" y="100" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="12" font-family="system-ui">medium</text>
    </g>

    <g>
      <rect x="290" y="40" width="110" height="70" rx="16" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)"/>
      <text x="345" y="75" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="18" font-family="system-ui" font-weight="700">L</text>
      <text x="345" y="100" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="12" font-family="system-ui">long</text>
    </g>

    <g>
      <rect x="425" y="40" width="75" height="70" rx="16" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)"/>
      <text x="462.5" y="75" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="15" font-family="system-ui" font-weight="700">Rods</text>
      <text x="462.5" y="100" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="12" font-family="system-ui">low-light</text>
    </g>

    <text x="10" y="145" fill="rgba(255,255,255,0.65)" font-size="12" font-family="system-ui">
      Colour comes from comparing cone responses; rods mainly encode brightness in dim light.
    </text>
  </svg>
  `;
}

/* ---------- Modal content ---------- */

const COLOUR_101_HTML = `
<h2>What is colour?</h2>

<p>
<b>Colour</b> is a perception built from how light interacts with surfaces and how eyes detect that reflected light.
It is not simply “stored” inside an object.
</p>

<div class="learnGrid">
  <div class="learnCard">
    <div class="learnCardTitle">Wavelengths</div>
    ${wavelengthScaleSVG()}
  </div>
  <div class="learnCard">
    <div class="learnCardTitle">Human vision channels</div>
    ${coneDiagramSVG()}
  </div>
</div>

<h3>Three basic steps</h3>
<ul>
  <li><b>Light source:</b> illumination provides a range of wavelengths.</li>
  <li><b>Surface interaction:</b> objects absorb some wavelengths and reflect others.</li>
  <li><b>Detection:</b> the eye samples that reflected light and the brain interprets it as colour.</li>
</ul>

<h3>Why different animals “see differently”</h3>
<ul>
  <li>Different animals may have <b>different numbers or types of photoreceptors</b>.</li>
  <li>Some species use extra cues such as <b>polarisation sensitivity</b>.</li>
  <li>Some visual systems prioritise <b>brightness, contrast, motion, or UV-related information</b> rather than human-like colour separation.</li>
</ul>

<h3>What this app can and cannot do</h3>
<ul>
  <li>Your camera captures only <b>RGB visible-light information</b>.</li>
  <li>So UV, thermal, and polarisation views here are <b>visual interpretations</b> inferred from RGB data.</li>
  <li>This makes the app useful for teaching and demonstration, but not for direct biological measurement.</li>
</ul>

<div class="smallNote">
Best demonstration method: turn on <b>Compare</b>, keep the split near the middle, and switch between modes while pointing at colourful or reflective objects.
</div>
`;

const INTRO_GUIDE_HTML = `
<h2>How to use this project</h2>

<h3>Step 1: Start the camera</h3>
<ul>
  <li>Click <b>Start Camera Experience</b> on the opening screen.</li>
  <li>When the browser asks for permission, click <b>Allow</b>.</li>
  <li>If you deny access, the live demonstration cannot run.</li>
</ul>

<h3>Step 2: Choose a mode</h3>
<ul>
  <li>Use the <b>Mode</b> dropdown in the control panel.</li>
  <li>This selects the animal-vision or colour-vision model to display.</li>
</ul>

<h3>Step 3: Adjust sliders</h3>
<ul>
  <li><b>Strength</b> controls how strong the selected effect is.</li>
  <li><b>UV / Overlay</b> is used only for modes that support extra overlay information.</li>
</ul>

<h3>Step 4: Compare with normal human view</h3>
<ul>
  <li>Turn on <b>Compare mode</b>.</li>
  <li>The left side shows a normal view, and the right side shows the selected mode.</li>
  <li>Use <b>Split position</b> to move the divider.</li>
</ul>

<h3>Buttons at the top</h3>
<ul>
  <li><b>Colour Guide</b> explains the science of colour perception.</li>
  <li><b>Learn This Mode</b> explains the currently selected mode.</li>
  <li><b>Help</b> opens quick instructions and troubleshooting.</li>
  <li><b>Controls</b> shows or hides the control panel if you want a cleaner screen.</li>
</ul>

<h3>If the camera does not work</h3>
<ul>
  <li>Check that the page is being opened from <b>https</b> or <b>localhost</b>.</li>
  <li>Reload the page.</li>
  <li>Check the camera permission icon near the address bar.</li>
  <li>Close other apps that may already be using the camera.</li>
</ul>

<div class="smallNote">
This project is designed as a teaching tool. Some visual modes are simplified conceptual demonstrations rather than literal reproductions.
</div>
`;

const MODE_INFO = {
  0: {
    name: "Human (baseline)",
    photoreceptors: "Typical human trichromat concept: 3 cone classes (S, M, L) plus rods for low-light vision.",
    what: [
      "No transformation is applied. This is the reference view.",
      "This is the best approximation to normal camera-to-screen colour within the limitations of the device."
    ],
    why: [
      "Humans normally compare the responses of three cone classes to estimate colour.",
      "Rods contribute mainly in dim lighting and are much less important for colour discrimination."
    ],
    science: [
      "S cones are most sensitive to shorter visible wavelengths.",
      "M cones respond more strongly in the medium-wavelength region.",
      "L cones respond more strongly in the longer-wavelength region.",
      "The brain compares relative cone outputs rather than reading colour from a single receptor."
    ],
    model: [
      "No shader transformation beyond the live camera display."
    ],
    limits: [
      "Still limited by the device camera, exposure, white balance, and the RGB screen."
    ],
    try: [
      "Turn on Compare and slide the divider to understand how other modes differ."
    ]
  },
  1: {
    name: "Mammal (dichromat: dog/cat/horse concept)",
    photoreceptors: "Conceptual dichromat model: 2 cone classes rather than 3. Many non-primate mammals have two cone types plus rods.",
    what: [
      "Some red–green differences become less distinct, while blue remains more noticeable.",
      "Colours that humans separate easily can collapse into more similar-looking tones."
    ],
    why: [
      "Dichromatic systems use fewer colour channels than human trichromatic vision.",
      "With one fewer independent cone signal, some colour pairs become harder to distinguish."
    ],
    science: [
      "Many mammals are broadly dichromatic, often with short-wavelength and medium/long-wavelength cone channels.",
      "They may still perform very well in brightness, motion, and low-light tasks due to rods and other retinal adaptations.",
      "Colour discrimination is not the same as visual intelligence or sharpness."
    ],
    model: [
      "Red and green are partially compressed into a shared response channel."
    ],
    limits: [
      "This is an educational RGB approximation and not species-specific retinal physiology."
    ],
    try: [
      "Point the camera at red and green objects or labels."
    ]
  },
  2: {
    name: "Bee (concept: UV inferred)",
    photoreceptors: "Bee-like concept: typically 3 cone-equivalent spectral channels, but shifted differently from humans, including UV, blue, and green sensitivity.",
    what: [
      "Bright areas may show a false-colour UV-like overlay.",
      "Patterns that appear plain to humans may gain extra contrast in the concept display."
    ],
    why: [
      "Many insects detect UV wavelengths that humans cannot see directly.",
      "Flowers and natural surfaces can contain UV-reflective patterns useful for pollination behaviour."
    ],
    science: [
      "Bees do not see ‘red’ the way humans do; their spectral world is shifted.",
      "A bee-like system can encode UV information that is absent from ordinary human perception.",
      "In insect vision, colour, contrast, motion, and spatial sampling can differ substantially from vertebrate eyes."
    ],
    model: [
      "A UV proxy is inferred from RGB relationships and displayed as false colour."
    ],
    limits: [
      "This is not real UV sensing, because a standard device camera does not directly measure bee-visible UV patterns."
    ],
    try: [
      "Try white paper, flowers, glossy surfaces, or bright printed packaging."
    ]
  },
  3: {
    name: "Bird (tetrachromat concept)",
    photoreceptors: "Bird-like concept: often 4 cone classes (tetrachromacy), and many species also have oil droplets that filter incoming light and sharpen spectral separation.",
    what: [
      "The image becomes more saturated and may show subtle inferred UV contribution.",
      "Objects with small colour differences may appear more separated in the concept display."
    ],
    why: [
      "Many birds have an additional cone type compared with human vision.",
      "Extra receptor channels can increase spectral discrimination."
    ],
    science: [
      "Bird retinas often contain four single-cone classes for colour vision.",
      "Many birds also have oil droplets in cones that act as spectral filters and can improve colour discrimination.",
      "Some birds detect UV or violet depending on species-specific cone tuning."
    ],
    model: [
      "Saturation is boosted and a UV-like inferred layer is blended in."
    ],
    limits: [
      "A 4-channel colour space cannot be shown perfectly on a normal RGB screen.",
      "This version represents the idea of tetrachromacy rather than a specific bird species."
    ],
    try: [
      "Use bright fabrics, posters, plants, or packaging."
    ]
  },
  4: {
    name: "Dragonfly (compound eye + polarisation concept)",
    photoreceptors: "Highly simplified dragonfly-like concept. Real dragonflies have compound eyes with many ommatidia and complex spectral specialisation; some insects also use UV and polarisation cues.",
    what: [
      "The image is broken into a faceted mosaic.",
      "The upper region is tuned differently from the lower region.",
      "A polarisation-like false colour pattern may appear.",
      "Fast motion is emphasised."
    ],
    why: [
      "Dragonflies are visual hunters with specialised compound eyes.",
      "Many insects use UV and polarisation-related cues, especially in navigation or detecting reflective surfaces."
    ],
    science: [
      "Compound eyes are made of many ommatidia, each sampling a small part of the visual field.",
      "Dragonflies are known for excellent motion detection and aerial hunting performance.",
      "Some insect visual systems contain regional specialisations rather than a single uniform camera-like image sensor.",
      "Polarisation sensitivity is not simply ‘more colour’; it is sensitivity to the orientation of light waves."
    ],
    model: [
      "Facet-style pixelation.",
      "Top/bottom tuning differences.",
      "Gradient-based polarisation proxy.",
      "Motion emphasis using frame-to-frame change."
    ],
    limits: [
      "This is a conceptual teaching mode, not literal compound-eye capture or exact dragonfly neurobiology."
    ],
    try: [
      "Point between ceiling/window and room objects, or move your hand quickly."
    ]
  },
  5: {
    name: "Deep-sea fish (bioluminescence concept)",
    photoreceptors: "Deep-sea concept emphasising rod-dominated or low-light-specialised vision; many deep-sea species have visual adaptations for extremely dim environments, sometimes with narrow spectral tuning.",
    what: [
      "The scene darkens, with bright points and reflections glowing more strongly.",
      "Blue-green tones are emphasised."
    ],
    why: [
      "In very dark environments, small bright signals can become extremely important.",
      "Bioluminescent light in the ocean is often concentrated in blue-green wavelengths because those travel relatively well through seawater."
    ],
    science: [
      "Many deep-sea organisms rely on extreme light sensitivity rather than broad daylight-style colour vision.",
      "Some species emphasise contrast and point-source detection.",
      "Visual ecology in the deep sea is shaped by darkness, scattering, and bioluminescence."
    ],
    model: [
      "Darkening, vignette, glow bloom, and blue-green emphasis."
    ],
    limits: [
      "Not a physical underwater optics simulation and not a species-specific deep-sea retina model."
    ],
    try: [
      "Try LEDs, screens, shiny plastic, reflective metal, or specular highlights."
    ]
  },
  6: {
    name: "Shark (low-light / monochrome concept)",
    photoreceptors: "Conceptual low-light shark-like mode: many sharks rely strongly on rod-dominated, luminance-sensitive vision; colour vision varies across species and is often limited.",
    what: [
      "The image becomes grayscale with stronger contrast.",
      "Brightness structure becomes more important than hue."
    ],
    why: [
      "Low-light vision often relies more on brightness and contrast than on colour separation.",
      "In many dim marine environments, hue may be less informative than edge and luminance."
    ],
    science: [
      "Many cartilaginous fishes are thought to have limited colour discrimination relative to humans.",
      "Rods are highly useful for sensitivity in dim conditions.",
      "A monochrome display can help teach the idea that colour is not always the most important visual variable."
    ],
    model: [
      "Luminance conversion with adjustable contrast."
    ],
    limits: [
      "General educational low-light concept, not species-specific shark physiology."
    ],
    try: [
      "Try dimmer scenes or high-contrast edges."
    ]
  },
  7: {
    name: "Snake (thermal concept)",
    photoreceptors: "Standard visible-light photoreceptors are still part of snake vision, but this mode adds the concept of infrared-sensitive pit organs found in some snakes such as pit vipers.",
    what: [
      "A thermal-style false-colour overlay is blended onto the scene.",
      "Warm-looking regions are visually emphasised."
    ],
    why: [
      "Some snakes can detect infrared-related thermal information using specialised pit organs.",
      "This thermal information is not the same as normal colour vision."
    ],
    science: [
      "Pit organs are separate sensory structures rather than ordinary retinal colour photoreceptors.",
      "Infrared sensitivity in snakes is often described as thermal scene detection, not visible-light colour.",
      "The brain can combine multiple sensory channels to guide prey detection and targeting."
    ],
    model: [
      "A heat-like proxy is inferred from brightness and red-weighted information."
    ],
    limits: [
      "This is not a real thermal camera and does not measure actual infrared radiation."
    ],
    try: [
      "Point at your hand, face, or objects with noticeable brightness differences."
    ]
  },
  8: {
    name: "Mantis shrimp (concept)",
    photoreceptors: "Strongly simplified mantis shrimp concept. Real mantis shrimps are famous for having many receptor classes and complex polarisation-related sensitivity.",
    what: [
      "Colours become grouped into distinct hue bands.",
      "The image can look more segmented and artificial."
    ],
    why: [
      "This mode is meant to communicate the idea of many specialised channels, not to literally reproduce mantis shrimp perception."
    ],
    science: [
      "Mantis shrimps are often discussed for their unusually complex visual systems.",
      "They are associated with multiple receptor classes and polarisation sensitivity.",
      "Having many receptor channels does not automatically mean they see a simple ‘superhuman rainbow’; the neural coding strategy matters too."
    ],
    model: [
      "Hue quantisation is increased as Strength rises."
    ],
    limits: [
      "Highly conceptual and intentionally stylised."
    ],
    try: [
      "Use rainbow objects, gradients, or colourful posters."
    ]
  },
  10: {
    name: "Deuteranopia",
    photoreceptors: "Human colour-vision deficiency concept: missing or non-functional M-cone channel, leaving two main cone comparisons instead of three.",
    what: [
      "Strong red–green confusion.",
      "Some colours that differ for most trichromats become much harder to separate."
    ],
    why: [
      "The M-cone contribution is absent or greatly reduced in this concept model.",
      "Without normal three-channel comparison, some colour axes collapse."
    ],
    science: [
      "Deuteranopia is one form of red–green colour vision deficiency.",
      "It does not mean ‘seeing only black and white’; many colours remain visible but are organised differently.",
      "Brightness cues and context can still help object recognition."
    ],
    model: [
      "Red and green are collapsed toward a shared channel."
    ],
    limits: [
      "Educational approximation only; real individual experience varies."
    ],
    try: [
      "Use charts, wires, labels, or packaging with red and green."
    ]
  },
  11: {
    name: "Protanopia",
    photoreceptors: "Human colour-vision deficiency concept: missing or non-functional L-cone channel.",
    what: [
      "Reds darken or shift, producing red–green confusion.",
      "Some red objects may lose salience."
    ],
    why: [
      "The L-cone contribution is absent or greatly reduced in this concept model."
    ],
    science: [
      "Protanopia differs from deuteranopia because the affected receptor class is different.",
      "Long-wavelength information is altered, so some red tones may appear darker as well as differently coloured.",
      "Again, this is not full grayscale vision."
    ],
    model: [
      "Red response is pulled toward green."
    ],
    limits: [
      "Educational approximation only; real individual experience varies."
    ],
    try: [
      "Try red text, stop-sign-like colours, or dark red objects."
    ]
  },
  12: {
    name: "Tritanopia",
    photoreceptors: "Human colour-vision deficiency concept: missing or non-functional S-cone channel.",
    what: [
      "Blue–yellow differences become less distinct."
    ],
    why: [
      "The S-cone contribution is absent or greatly reduced in this concept model."
    ],
    science: [
      "Tritan-type deficiencies affect a different axis from the more familiar red–green deficiencies.",
      "Blue/yellow separation is altered because short-wavelength signalling is disrupted.",
      "It is generally less common than red–green deficiencies."
    ],
    model: [
      "Blue variation is reduced relative to luminance."
    ],
    limits: [
      "Educational approximation only."
    ],
    try: [
      "Use blue and yellow objects side by side."
    ]
  },
  13: {
    name: "Deuteranomaly",
    photoreceptors: "Human colour-vision deficiency concept: M-cone present but spectrally shifted, rather than fully absent.",
    what: [
      "A milder form of red–green confusion.",
      "Some colours remain separable, but distinctions are weaker."
    ],
    why: [
      "Cone responses are shifted rather than fully absent."
    ],
    science: [
      "Anomalous trichromacy means the eye still has three cone classes, but one class is altered.",
      "This can compress colour differences along a particular discrimination axis.",
      "Experience varies from subtle to substantial depending on the degree of shift."
    ],
    model: [
      "Green is gently pulled toward red."
    ],
    limits: [
      "Educational approximation only."
    ],
    try: [
      "Use subtle pastel reds and greens."
    ]
  },
  14: {
    name: "Protanomaly",
    photoreceptors: "Human colour-vision deficiency concept: L-cone present but spectrally shifted, rather than fully absent.",
    what: [
      "A milder protan-type effect."
    ],
    why: [
      "Red response is shifted rather than fully absent."
    ],
    science: [
      "This is another form of anomalous trichromacy.",
      "Hue differences involving reds, oranges, and nearby tones may compress.",
      "Brightness and context still contribute strongly to visual interpretation."
    ],
    model: [
      "Red is gently pulled toward green."
    ],
    limits: [
      "Educational approximation only."
    ],
    try: [
      "Try pink, orange, and red materials."
    ]
  },
  15: {
    name: "Achromatopsia (total colour blindness concept)",
    photoreceptors: "Conceptual achromatopsia-like mode: colour cone function is absent or severely reduced, so luminance dominates perception.",
    what: [
      "The scene becomes nearly grayscale.",
      "Contrast becomes more important than hue."
    ],
    why: [
      "If colour-cone function contributes very little, the visual system relies heavily on brightness information."
    ],
    science: [
      "Achromatopsia is very different from ordinary red–green colour deficiency.",
      "It involves profound loss of colour discrimination rather than a shift along one colour axis.",
      "Real achromatopsia can also involve other visual symptoms not represented here."
    ],
    model: [
      "Luminance conversion with adjustable contrast."
    ],
    limits: [
      "Educational approximation only and not a clinical simulation of all symptoms."
    ],
    try: [
      "Point at a very colourful scene and compare."
    ]
  }
};

function list(arr) {
  return `<ul>${(arr || []).map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
}

function modeLearnHTML(info) {
  return `
    <h2>${escapeHtml(info.name)}</h2>

    <div class="learnMetaBox">
      <div class="learnMetaRow">
        <span class="learnMetaLabel">Photoreceptors / sensory basis</span>
        <div>${escapeHtml(info.photoreceptors || "Not specified.")}</div>
      </div>
    </div>

    <h3>What you should notice</h3>
    ${list(info.what)}

    <h3>Why this happens</h3>
    ${list(info.why)}

    <h3>Scientific background</h3>
    ${list(info.science)}

    <h3>What the app is doing</h3>
    ${list(info.model)}

    <h3>Limits</h3>
    ${list(info.limits)}

    <h3>Try this</h3>
    ${list(info.try)}

    <div class="smallNote">
      Best demonstration: enable <b>Compare mode</b> so the audience can see the normal view and the selected mode side by side.
    </div>
  `;
}

/* ---------- Modal helpers ---------- */

function openModal(title, html) {
  if (!modalBackdrop || !modalTitleEl || !modalBody) return;
  modalTitleEl.textContent = title;
  modalBody.innerHTML = html;

  document.body.classList.add("modalOpen");
  modalBackdrop.style.display = "block";
  modalBody.scrollTop = 0;
}

function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.style.display = "none";
  document.body.classList.remove("modalOpen");
}

safeOn(modalClose, "click", closeModal);
safeOn(modalBackdrop, "click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

safeOn(colourBtn, "click", () => openModal("Colour Guide", COLOUR_101_HTML));
safeOn(openIntroGuideBtn, "click", (e) => {
  e.preventDefault();
  openModal("How to Use This Project", INTRO_GUIDE_HTML);
});
safeOn(helpBtn, "click", () => openModal("Quick Help", INTRO_GUIDE_HTML));

safeOn(learnBtn, "click", () => {
  const m = parseInt(modeEl?.value ?? "0", 10);
  const info = MODE_INFO[m] || MODE_INFO[0];
  openModal("Learn This Mode", modeLearnHTML(info));
});

safeOn(resetBtn, "click", resetControls);
safeOn(toggleControlsBtn, "click", toggleControls);

/* ---------- UI plumbing ---------- */

function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (allocPrevTexture) allocPrevTexture();
}
window.addEventListener("resize", resize);

function updateCompareUI() {
  if (!splitRow || !compareEl) return;
  splitRow.style.display = compareEl.checked ? "grid" : "none";
}

safeOn(compareEl, "change", updateCompareUI);

function updateUIForMode() {
  const m = parseInt(modeEl?.value ?? "0", 10);
  const info = MODE_INFO[m] || MODE_INFO[0];
  if (modeTitle) modeTitle.textContent = info.name;

  if (thermalLegend) thermalLegend.style.display = "none";

  if (strengthEl) strengthEl.disabled = true;
  if (uvEl) uvEl.disabled = true;

  if (strengthLabel) {
    strengthLabel.innerHTML = `Strength <span class="labelHint">This mode does not use the strength slider</span>`;
  }
  if (uvLabel) {
    uvLabel.innerHTML = `UV / Overlay <span class="labelHint">This mode does not use the overlay slider</span>`;
  }

  if (m === 1) {
    strengthEl.disabled = false;
    strengthLabel.innerHTML = `Strength <span class="labelHint">How strong the dichromat effect should be</span>`;
  } else if (m === 2) {
    uvEl.disabled = false;
    uvLabel.innerHTML = `UV emphasis <span class="labelHint">Controls the inferred UV-style false-colour overlay</span>`;
  } else if (m === 3) {
    strengthEl.disabled = false;
    uvEl.disabled = false;
    strengthLabel.innerHTML = `Saturation boost <span class="labelHint">Increases colour vividness in the bird concept</span>`;
    uvLabel.innerHTML = `UV layer <span class="labelHint">Adds the inferred UV-style contribution</span>`;
  } else if (m === 4) {
    strengthEl.disabled = false;
    uvEl.disabled = false;
    strengthLabel.innerHTML = `Facet / polarisation strength <span class="labelHint">Makes the compound-eye and motion effect stronger</span>`;
    uvLabel.innerHTML = `UV emphasis <span class="labelHint">Increases the concept UV-style component</span>`;
  } else if (m === 5) {
    strengthEl.disabled = false;
    strengthLabel.innerHTML = `Glow intensity <span class="labelHint">Controls how strongly bright points bloom</span>`;
  } else if (m === 6) {
    strengthEl.disabled = false;
    strengthLabel.innerHTML = `Contrast <span class="labelHint">Adjusts grayscale contrast</span>`;
  } else if (m === 7) {
    strengthEl.disabled = false;
    uvEl.disabled = false;
    strengthLabel.innerHTML = `Thermal contrast <span class="labelHint">Controls how strongly hot/cool regions separate</span>`;
    uvLabel.innerHTML = `Thermal intensity <span class="labelHint">Controls the false-colour thermal overlay strength</span>`;
    if (thermalLegend) thermalLegend.style.display = "block";
  } else if (m === 8) {
    strengthEl.disabled = false;
    strengthLabel.innerHTML = `Channelisation <span class="labelHint">Controls how strongly colours become grouped into bands</span>`;
  } else if (m === 15) {
    strengthEl.disabled = false;
    strengthLabel.innerHTML = `Contrast <span class="labelHint">Adjusts grayscale contrast</span>`;
  }
}

safeOn(modeEl, "change", updateUIForMode);



/* ---------- WebGL ---------- */

if (!canvas) {
  setStatus("<b>Error:</b> canvas element missing.", true);
  throw new Error("Canvas missing");
}

const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
if (!gl) {
  setStatus("<b>Error:</b> WebGL is not available on this device/browser.", true);
  throw new Error("WebGL not available");
}

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

// Shaders
const vertexShaderSource = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = (position + 1.0) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform sampler2D tex;
uniform sampler2D prevTex;
uniform vec2 texelSize;

uniform int mode;
uniform float strength;
uniform float uvIntensity;
uniform float split;
uniform int compareEnabled;

varying vec2 uv;

float luma(vec3 rgb) { return dot(rgb, vec3(0.299, 0.587, 0.114)); }

float uvProxy(vec3 rgb){
  return clamp(rgb.b - 0.5*rgb.r, 0.0, 1.0);
}

vec3 falseUV(float u){
  vec3 a = vec3(0.05, 0.00, 0.08);
  vec3 b = vec3(0.65, 0.10, 0.95);
  vec3 c = vec3(0.20, 0.95, 0.95);
  float t = clamp(u, 0.0, 1.0);
  float mid = smoothstep(0.0, 0.7, t);
  float hi  = smoothstep(0.6, 1.0, t);
  vec3 ab = mix(a, b, mid);
  return mix(ab, c, hi);
}

vec3 mammalDichromat(vec3 rgb){
  float rg = 0.55*rgb.g + 0.45*rgb.r;
  return vec3(rg, rg, rgb.b);
}

vec3 beeConcept(vec3 rgb, float uvi){
  vec3 base = vec3(0.60*rgb.r, rgb.g, rgb.b);
  float u = uvProxy(rgb);
  vec3 col = falseUV(u);
  return mix(base, col, clamp(uvi, 0.0, 1.0));
}

vec3 saturateBoost(vec3 rgb, float s){
  float y = luma(rgb);
  vec3 gray = vec3(y);
  return clamp(mix(gray, rgb, s), 0.0, 1.0);
}

vec3 birdConcept(vec3 rgb, float satBoost, float uvi){
  vec3 sat = saturateBoost(rgb, 1.0 + 1.2*satBoost);
  float u = uvProxy(rgb);
  vec3 uvCol = falseUV(u);
  float a = clamp(uvi, 0.0, 1.0) * 0.6;
  return mix(sat, uvCol, a);
}

vec3 monoContrast(vec3 rgb, float c){
  float y = luma(rgb);
  float cc = 1.0 + 1.8*c;
  float v = clamp((y - 0.5)*cc + 0.5, 0.0, 1.0);
  return vec3(v);
}

vec3 heatColor(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 a = vec3(0.0, 0.0, 0.0);
  vec3 b = vec3(0.3, 0.0, 0.6);
  vec3 c = vec3(0.9, 0.1, 0.1);
  vec3 d = vec3(1.0, 0.9, 0.1);
  vec3 e = vec3(1.0, 1.0, 1.0);

  float t1 = smoothstep(0.0, 0.35, t);
  float t2 = smoothstep(0.25, 0.6, t);
  float t3 = smoothstep(0.55, 0.85, t);
  float t4 = smoothstep(0.8, 1.0, t);

  vec3 ab = mix(a, b, t1);
  vec3 bc = mix(b, c, t2);
  vec3 cd = mix(c, d, t3);
  vec3 de = mix(d, e, t4);

  vec3 mid = mix(ab, bc, smoothstep(0.2, 0.5, t));
  vec3 high = mix(cd, de, smoothstep(0.7, 1.0, t));
  return mix(mid, high, smoothstep(0.55, 0.9, t));
}

vec3 snakeThermal(vec3 rgb, float contrastAmt, float intensity){
  float y = luma(rgb);
  float heat = clamp(0.55*rgb.r + 0.45*y, 0.0, 1.0);
  float cc = 1.0 + 2.0*contrastAmt;
  heat = clamp((heat - 0.5)*cc + 0.5, 0.0, 1.0);

  vec3 col = heatColor(heat);
  float a = clamp(intensity, 0.0, 1.0);
  return mix(rgb, col, a);
}

vec3 rainbow(float t){
  float r = 0.5 + 0.5*cos(6.28318*(t + 0.00));
  float g = 0.5 + 0.5*cos(6.28318*(t + 0.33));
  float b = 0.5 + 0.5*cos(6.28318*(t + 0.67));
  return vec3(r,g,b);
}

float hueApprox(vec3 c) {
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  float d = mx - mn;
  if (d < 1e-5) return 0.0;
  float h;
  if (mx == c.r) h = (c.g - c.b) / d;
  else if (mx == c.g) h = 2.0 + (c.b - c.r) / d;
  else h = 4.0 + (c.r - c.g) / d;
  h = h / 6.0;
  if (h < 0.0) h += 1.0;
  return h;
}

vec3 mantisConcept(vec3 rgb, float amt){
  float h = hueApprox(rgb);
  float n = mix(6.0, 16.0, clamp(amt, 0.0, 1.0));
  float band = floor(h * n) / n;
  vec3 pseudo = rainbow(band);
  return mix(rgb, pseudo, clamp(amt, 0.0, 1.0));
}

vec3 protanopia(vec3 rgb){ return vec3(0.15*rgb.r + 0.85*rgb.g, rgb.g, rgb.b); }
vec3 deuteranopia(vec3 rgb){ float rg = 0.5*(rgb.r + rgb.g); return vec3(rg, rg, rgb.b); }
vec3 tritanopia(vec3 rgb){ float y = 0.5*(rgb.r + rgb.g); return vec3(rgb.r, rgb.g, 0.2*rgb.b + 0.8*y); }
vec3 protanomaly(vec3 rgb){ float r = mix(rgb.r, rgb.g, 0.45); return vec3(r, rgb.g, rgb.b); }
vec3 deuteranomaly(vec3 rgb){ float g = mix(rgb.g, rgb.r, 0.35); return vec3(rgb.r, g, rgb.b); }
vec3 achromatopsia(vec3 rgb, float contrastAmt){ return monoContrast(rgb, contrastAmt); }

/* Dragonfly */
vec3 pixelateSample(sampler2D t, vec2 uv0, float cells){
  vec2 grid = vec2(cells, cells);
  vec2 uvp = (floor(uv0 * grid) + 0.5) / grid;
  return texture2D(t, uvp).rgb;
}

vec3 angleToColour(float a){
  return rainbow(a);
}

vec2 grad2(sampler2D t, vec2 uv0){
  vec3 c  = texture2D(t, uv0).rgb;
  vec3 cx = texture2D(t, uv0 + vec2(texelSize.x, 0.0)).rgb;
  vec3 cy = texture2D(t, uv0 + vec2(0.0, texelSize.y)).rgb;
  float gx = luma(cx) - luma(c);
  float gy = luma(cy) - luma(c);
  return vec2(gx, gy);
}

vec3 dragonflyConcept(sampler2D t, sampler2D prevT, vec2 uv0, float facetAmt, float uvAmt){
  float f = clamp(facetAmt, 0.0, 1.0);
  float uvi = clamp(uvAmt, 0.0, 1.0);

  float cells = mix(70.0, 260.0, f);
  vec3 fac = pixelateSample(t, uv0, cells);

  float top = step(0.52, uv0.y);
  vec3 skyTuned = vec3(0.50*fac.r, 0.95*fac.g, min(1.0, fac.b + 0.22));
  vec3 groundTuned = vec3(min(1.0, fac.r*1.05), fac.g, fac.b*0.95);
  vec3 tuned = mix(groundTuned, skyTuned, top);

  float u = uvProxy(fac);
  vec3 uvCol = falseUV(u);
  float uvBlend = uvi * (0.10 + 0.70*top);
  tuned = mix(tuned, uvCol, uvBlend);

  vec2 g = grad2(t, uv0);
  float mag = clamp(length(g) * (5.0 + 14.0*f), 0.0, 1.0);
  float ang = atan(g.y, g.x);
  float a01 = (ang + 3.14159) / 6.28318;
  vec3 pol = angleToColour(a01);

  float polBlend = mag * (0.10 + 0.55*f) * (0.25 + 0.75*top);
  tuned = mix(tuned, pol, polBlend);

  vec3 prev = texture2D(prevT, uv0).rgb;
  float motion = clamp(length(tuned - prev) * (3.0 + 10.0*f), 0.0, 1.0);

  float y = luma(tuned);
  float boosted = clamp(y + motion*(0.10 + 0.30*f), 0.0, 1.0);
  return mix(tuned, vec3(boosted), 0.20*motion);
}

/* Deep-sea fish */
vec3 blur9(sampler2D t, vec2 uv0){
  vec3 s = vec3(0.0);
  s += texture2D(t, uv0).rgb * 0.20;
  s += texture2D(t, uv0 + vec2(texelSize.x, 0.0)).rgb * 0.10;
  s += texture2D(t, uv0 - vec2(texelSize.x, 0.0)).rgb * 0.10;
  s += texture2D(t, uv0 + vec2(0.0, texelSize.y)).rgb * 0.10;
  s += texture2D(t, uv0 - vec2(0.0, texelSize.y)).rgb * 0.10;
  s += texture2D(t, uv0 + vec2(texelSize.x, texelSize.y)).rgb * 0.10;
  s += texture2D(t, uv0 + vec2(-texelSize.x, texelSize.y)).rgb * 0.10;
  s += texture2D(t, uv0 + vec2(texelSize.x, -texelSize.y)).rgb * 0.10;
  s += texture2D(t, uv0 + vec2(-texelSize.x, -texelSize.y)).rgb * 0.10;
  return s;
}

vec3 deepSeaFishConcept(sampler2D t, vec2 uv0, vec3 rgb, float amt){
  float a = clamp(amt, 0.0, 1.0);

  float y = luma(rgb);
  float dark = pow(y, mix(1.7, 2.6, a));
  vec3 base = rgb * mix(0.55, 0.25, a);
  base = mix(base, vec3(dark) * 0.65, 0.35);

  base.r *= mix(0.80, 0.35, a);
  base.g *= mix(1.00, 1.10, a);
  base.b *= mix(1.05, 1.35, a);

  float brightMask = smoothstep(mix(0.78, 0.62, a), 1.0, y);
  float blueMask = smoothstep(0.55, 0.95, rgb.b);
  float mask = clamp(0.65*brightMask + 0.35*blueMask, 0.0, 1.0);

  vec3 blur = blur9(t, uv0);
  float by = luma(blur);
  float bloomMask = smoothstep(mix(0.70, 0.50, a), 1.0, by) * mask;

  vec3 cyanTint = vec3(0.20, 0.95, 0.90);
  vec3 glow = blur * mix(1.2, 3.0, a);
  glow = mix(glow, cyanTint * by, 0.55);
  glow *= bloomMask;

  vec2 p = uv0 * 2.0 - 1.0;
  float r = dot(p, p);
  float vig = smoothstep(1.05, 0.25, r);
  base *= mix(0.55, 1.0, vig);

  vec3 outCol = base + glow * mix(0.6, 1.4, a);
  return clamp(outCol, 0.0, 1.0);
}

void main() {
  vec3 rgb = texture2D(tex, uv).rgb;

  bool isLeftHuman = (compareEnabled == 1) && (uv.x < split);
  vec3 result = rgb;

  if (!isLeftHuman) {
    if (mode == 0) result = rgb;
    else if (mode == 1) result = mix(rgb, mammalDichromat(rgb), clamp(strength, 0.0, 1.0));
    else if (mode == 2) result = beeConcept(rgb, uvIntensity);
    else if (mode == 3) result = birdConcept(rgb, strength, uvIntensity);
    else if (mode == 4) result = dragonflyConcept(tex, prevTex, uv, strength, uvIntensity);
    else if (mode == 5) result = deepSeaFishConcept(tex, uv, rgb, strength);
    else if (mode == 6) result = monoContrast(rgb, strength);
    else if (mode == 7) result = snakeThermal(rgb, strength, uvIntensity);
    else if (mode == 8) result = mantisConcept(rgb, strength);

    else if (mode == 10) result = deuteranopia(rgb);
    else if (mode == 11) result = protanopia(rgb);
    else if (mode == 12) result = tritanopia(rgb);
    else if (mode == 13) result = deuteranomaly(rgb);
    else if (mode == 14) result = protanomaly(rgb);
    else if (mode == 15) result = achromatopsia(rgb, strength);
  }

  gl_FragColor = vec4(result, 1.0);
}
`;

function compile(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    console.error("Shader compile error:", log);
    setStatus(`<b>Shader error:</b> ${escapeHtml(log)}`, true);
    throw new Error(log);
  }
  return shader;
}

const vs = compile(gl.VERTEX_SHADER, vertexShaderSource);
const fs = compile(gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  const log = gl.getProgramInfoLog(program);
  console.error("Program link error:", log);
  setStatus(`<b>WebGL link error:</b> ${escapeHtml(log)}`, true);
  throw new Error(log);
}

gl.useProgram(program);

// Fullscreen quad
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,  1,-1,  -1,1,  1,1]), gl.STATIC_DRAW);

const posLoc = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

// Textures
const texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

const prevTexture = gl.createTexture();
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, prevTexture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

function allocPrevTexture() {
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, prevTexture);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGB,
    canvas.width, canvas.height,
    0, gl.RGB, gl.UNSIGNED_BYTE, null
  );
}
allocPrevTexture();

// Uniforms
const uTex = gl.getUniformLocation(program, "tex");
const uPrevTex = gl.getUniformLocation(program, "prevTex");
const uTexel = gl.getUniformLocation(program, "texelSize");

const uMode = gl.getUniformLocation(program, "mode");
const uStrength = gl.getUniformLocation(program, "strength");
const uUV = gl.getUniformLocation(program, "uvIntensity");
const uSplit = gl.getUniformLocation(program, "split");
const uCompare = gl.getUniformLocation(program, "compareEnabled");

gl.uniform1i(uTex, 0);
gl.uniform1i(uPrevTex, 1);

// Initial UI setup
resize();
updateCompareUI();
updateUIForMode();
updateControlsButton();

/* ---------- Camera ---------- */

function isSecureEnoughForCamera() {
  const h = window.location.hostname;
  const isLocalhost = (h === "localhost" || h === "127.0.0.1");
  return window.isSecureContext || isLocalhost;
}

async function initCamera() {
  if (cameraStarted) return;

  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus("<b>Camera error:</b> getUserMedia is not supported in this browser.", true);
    return;
  }

  if (!isSecureEnoughForCamera()) {
    setStatus(
      "<b>Camera blocked:</b> this page must be opened from <b>https</b> or <b>http://localhost</b> for camera access.",
      true
    );
    return;
  }

  try {
    setStatus("<b>Step 1:</b> requesting camera permission. Please click <b>Allow</b> in your browser.", true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();

    cameraStarted = true;
    showAppUI();
    setStatus("✅ Camera started successfully. Choose a mode below to begin.", true);
    setTimeout(() => setStatus("", false), 2200);

  } catch (err) {
    console.error("getUserMedia error:", err);

    let extra = "Check site permissions and reload the page.";
    if (err.name === "NotAllowedError") {
      extra = "Camera permission was denied. Click the camera icon near the address bar, allow access, then reload.";
    } else if (err.name === "NotFoundError") {
      extra = "No camera was found on this device.";
    } else if (err.name === "NotReadableError") {
      extra = "The camera may already be in use by another application.";
    }

    setStatus(
      `<b>Camera error:</b> ${escapeHtml(err.name)} — ${escapeHtml(err.message)}<br><span class="smallNote">${escapeHtml(extra)}</span>`,
      true
    );
  }
}

safeOn(startBtn, "click", initCamera);

/* ---------- Render loop ---------- */

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);

  if (video.readyState >= 2) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
  }

  gl.uniform2f(uTexel, 1.0 / canvas.width, 1.0 / canvas.height);

  gl.uniform1i(uMode, parseInt(modeEl?.value ?? "0", 10));
  gl.uniform1f(uStrength, parseFloat(strengthEl?.value ?? "0.85"));
  gl.uniform1f(uUV, parseFloat(uvEl?.value ?? "0.75"));
  gl.uniform1f(uSplit, parseFloat(splitEl?.value ?? "0.5"));
  gl.uniform1i(uCompare, compareEl?.checked ? 1 : 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Save previous frame for dragonfly motion emphasis
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, prevTexture);
  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGB, 0, 0, canvas.width, canvas.height, 0);
  gl.activeTexture(gl.TEXTURE0);

  requestAnimationFrame(render);
}
render();