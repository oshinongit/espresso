use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct PaintCanvas {
    width: u32,
    height: u32,
    pixels: Vec<u8>,
}

#[wasm_bindgen]
impl PaintCanvas {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> PaintCanvas {
        let size = (width * height * 4) as usize;
        let pixels = vec![255; size]; // Start with white background

        PaintCanvas {
            width,
            height,
            pixels,
        }
    }

    pub fn get_pixels(&self) -> *const u8 {
        self.pixels.as_ptr()
    }

    pub fn clear(&mut self, r: u8, g: u8, b: u8) {
        for i in (0..self.pixels.len()).step_by(4) {
            self.pixels[i] = r;
            self.pixels[i + 1] = g;
            self.pixels[i + 2] = b;
            self.pixels[i + 3] = 255;
        }
    }

    pub fn draw_point(&mut self, x: i32, y: i32, r: u8, g: u8, b: u8) {
        if x < 0 || y < 0 || x >= self.width as i32 || y >= self.height as i32 {
            return;
        }

        let index = ((y as u32 * self.width + x as u32) * 4) as usize;

        if index + 3 < self.pixels.len() {
            self.pixels[index] = r;
            self.pixels[index + 1] = g;
            self.pixels[index + 2] = b;
            self.pixels[index + 3] = 255;
        }
    }

    pub fn draw_circle(&mut self, center_x: i32, center_y: i32, radius: i32, r: u8, g: u8, b: u8) {
        let r_squared = radius * radius;

        for dy in -radius..=radius {
            for dx in -radius..=radius {
                if dx * dx + dy * dy <= r_squared {
                    self.draw_point(center_x + dx, center_y + dy, r, g, b);
                }
            }
        }
    }

    pub fn draw_line(&mut self, x0: i32, y0: i32, x1: i32, y1: i32, r: u8, g: u8, b: u8, brush_size: i32) {
        // Bresenham's line algorithm with brush size
        let dx = (x1 - x0).abs();
        let dy = -(y1 - y0).abs();
        let sx = if x0 < x1 { 1 } else { -1 };
        let sy = if y0 < y1 { 1 } else { -1 };
        let mut err = dx + dy;

        let mut x = x0;
        let mut y = y0;

        loop {
            if brush_size > 1 {
                self.draw_circle(x, y, brush_size / 2, r, g, b);
            } else {
                self.draw_point(x, y, r, g, b);
            }

            if x == x1 && y == y1 {
                break;
            }

            let e2 = 2 * err;

            if e2 >= dy {
                err += dy;
                x += sx;
            }

            if e2 <= dx {
                err += dx;
                y += sy;
            }
        }
    }

    pub fn draw_line_gradient_size(&mut self, x0: i32, y0: i32, x1: i32, y1: i32, r: u8, g: u8, b: u8, start_size: i32, end_size: i32) {
        // Bresenham's line algorithm with gradual brush size increase (for latte art foam effect)
        let dx = (x1 - x0).abs();
        let dy = -(y1 - y0).abs();
        let sx = if x0 < x1 { 1 } else { -1 };
        let sy = if y0 < y1 { 1 } else { -1 };
        let mut err = dx + dy;

        let mut x = x0;
        let mut y = y0;

        // Calculate total distance for size interpolation
        let total_distance = ((dx * dx + dy * dy) as f32).sqrt();
        let mut current_distance = 0.0;

        loop {
            // Interpolate brush size based on distance traveled
            let progress = if total_distance > 0.0 {
                current_distance / total_distance
            } else {
                0.0
            };

            let current_size = start_size as f32 + (end_size - start_size) as f32 * progress;
            let brush_radius = (current_size / 2.0) as i32;

            if brush_radius > 0 {
                self.draw_circle(x, y, brush_radius, r, g, b);
            } else {
                self.draw_point(x, y, r, g, b);
            }

            if x == x1 && y == y1 {
                break;
            }

            let e2 = 2 * err;
            let mut moved = false;

            if e2 >= dy {
                err += dy;
                x += sx;
                moved = true;
            }

            if e2 <= dx {
                err += dx;
                y += sy;
                moved = true;
            }

            if moved {
                current_distance += 1.0;
            }
        }
    }
}
