# Espresso

A simple paint web app powered by WebAssembly (Rust + wasm-bindgen).

## Features

- Draw with adjustable brush sizes
- Color picker
- Clear canvas
- Smooth drawing with Bresenham's line algorithm
- Touch support for mobile devices
- High-performance pixel manipulation using WebAssembly

## Tech Stack

- **Rust** - Core drawing logic compiled to WebAssembly
- **wasm-bindgen** - JavaScript/WebAssembly interop
- **Vanilla JavaScript** - UI and event handling
- **HTML5 Canvas** - Rendering

## Running Locally

### Prerequisites

- Rust (with `wasm32-unknown-unknown` target)
- wasm-pack
- Python 3 (for local server)

### Quick Start

1. Clone the repository
2. Run the development server:

```bash
./serve.sh
```

3. Open your browser to http://localhost:8000

### Building from Source

If you make changes to the Rust code:

```bash
cd wasm-paint
wasm-pack build --target web --out-dir ../pkg
```

## Project Structure

```
espresso/
├── index.html          # Main HTML file
├── js/
│   └── app.js         # JavaScript application code
├── pkg/               # Compiled WebAssembly (generated)
├── wasm-paint/        # Rust source code
│   ├── src/
│   │   └── lib.rs    # WASM drawing functions
│   └── Cargo.toml
├── serve.sh          # Development server script
└── README.md
```

## How It Works

1. **Rust** handles the performance-critical pixel manipulation operations
2. **WebAssembly** provides near-native performance in the browser
3. **JavaScript** manages UI interactions, events, and canvas rendering
4. The WASM module exposes functions like `draw_line`, `draw_circle`, and `clear`
5. JavaScript reads the pixel buffer from WASM memory and renders it to the canvas

## License

MIT
