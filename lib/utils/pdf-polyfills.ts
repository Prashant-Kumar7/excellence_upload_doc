// Polyfill DOM APIs for pdf-parse in Node.js environment
// This must be imported BEFORE pdf-parse is required

if (typeof global !== 'undefined') {
  // Only polyfill if not already defined
  if (typeof (global as any).DOMMatrix === 'undefined') {
    try {
      // Try to use canvas package
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createCanvas } = require('canvas')
      const canvas = createCanvas(1, 1)
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // Get DOMMatrix from canvas context
        try {
          const transform = ctx.getTransform()
          if (transform && transform.constructor) {
            (global as any).DOMMatrix = transform.constructor
          }
        } catch {
          // Fallback: create minimal DOMMatrix
          (global as any).DOMMatrix = class DOMMatrix {
            a = 1
            b = 0
            c = 0
            d = 1
            e = 0
            f = 0
            constructor() {}
          }
        }
        
        // Get ImageData from canvas
        try {
          const imgData = ctx.createImageData(1, 1)
          if (imgData && imgData.constructor) {
            (global as any).ImageData = imgData.constructor
          }
        } catch {
          (global as any).ImageData = class ImageData {
            data: Uint8ClampedArray
            width: number
            height: number
            constructor(width: number, height: number) {
              this.width = width
              this.height = height
              this.data = new Uint8ClampedArray(width * height * 4)
            }
          }
        }
        
        // Path2D polyfill
        (global as any).Path2D = class Path2D {
          constructor() {}
        }
      }
    } catch (error) {
      // If canvas fails, create minimal stubs
      (global as any).DOMMatrix = class DOMMatrix {
        a = 1
        b = 0
        c = 0
        d = 1
        e = 0
        f = 0
        constructor() {}
      }
      
      ;(global as any).ImageData = class ImageData {
        data: Uint8ClampedArray
        width: number
        height: number
        constructor(width: number, height: number) {
          this.width = width
          this.height = height
          this.data = new Uint8ClampedArray(width * height * 4)
        }
      }
      
      ;(global as any).Path2D = class Path2D {
        constructor() {}
      }
    }
  }
}

