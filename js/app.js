import init, { PaintCanvas } from '../pkg/wasm_paint.js';

// Wait for WASM to initialize
const wasm = await init();

// Get canvas and context
const canvas = document.getElementById('paint-canvas');
const ctx = canvas.getContext('2d');

// Initialize WASM paint canvas
const paintCanvas = new PaintCanvas(canvas.width, canvas.height);

// Get UI elements
const colorPicker = document.getElementById('color-picker');
const brushSizeSlider = document.getElementById('brush-size');
const sizeValue = document.getElementById('size-value');
const clearBtn = document.getElementById('clear-btn');

// State
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = { r: 255, g: 255, b: 255 }; // Start with white (milk foam)
let brushSize = 30; // Max size for foam
const minBrushSize = 3; // Starting size for foam pour
let strokeStartTime = 0;

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Helper function to copy WASM pixel data to canvas
function renderCanvas() {
    const pixelPtr = paintCanvas.get_pixels();
    const pixels = new Uint8ClampedArray(
        // Access WASM memory
        wasm.memory.buffer,
        pixelPtr,
        canvas.width * canvas.height * 4
    );
    const imageData = new ImageData(pixels, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
}

// Event handlers - Latte art foam effect
function startDrawing(e) {
    isDrawing = true;
    strokeStartTime = Date.now();
    const rect = canvas.getBoundingClientRect();
    lastX = Math.floor(e.clientX - rect.left);
    lastY = Math.floor(e.clientY - rect.top);

    // Draw initial small point (start of foam pour)
    paintCanvas.draw_circle(lastX, lastY, Math.floor(minBrushSize / 2), currentColor.r, currentColor.g, currentColor.b);
    renderCanvas();
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    // Calculate how long this stroke has been going (for foam expansion)
    const strokeDuration = Date.now() - strokeStartTime;
    const expansionRate = 1.5; // How fast the foam expands per second
    const currentMaxSize = Math.min(
        minBrushSize + (strokeDuration / 1000) * expansionRate * brushSize,
        brushSize
    );

    // Draw line with gradient size (foam expanding effect)
    paintCanvas.draw_line_gradient_size(
        lastX, lastY, x, y,
        currentColor.r, currentColor.g, currentColor.b,
        minBrushSize,
        Math.floor(currentMaxSize)
    );
    renderCanvas();

    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

// UI event handlers
colorPicker.addEventListener('input', (e) => {
    const rgb = hexToRgb(e.target.value);
    if (rgb) {
        currentColor = rgb;
    }
});

brushSizeSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    sizeValue.textContent = brushSize;
});

clearBtn.addEventListener('click', () => {
    // Clear to espresso brown color
    paintCanvas.clear(101, 67, 33); // Coffee brown #654321
    renderCanvas();
});

// Color preset buttons
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        e.target.classList.add('active');

        // Set color
        const color = e.target.getAttribute('data-color');
        colorPicker.value = color;
        const rgb = hexToRgb(color);
        if (rgb) {
            currentColor = rgb;
        }
    });
});

// Canvas events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

// Initial render with coffee background
paintCanvas.clear(101, 67, 33); // Start with espresso brown
renderCanvas();

console.log('☕ Espresso Latte Art loaded! WASM is ready.');
