import { useEffect, useRef } from 'react'

export default function LoadingScreen({ onFinish }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let W, H, lines = [], phase = 0, rafId, done = false

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    function buildLines() {
      lines = []
      const cols = 4, rows = 3
      const cw = W / cols, rh = H / rows

      // Líneas diagonales en cada celda de la cuadrícula (las X)
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x0 = c*cw, y0 = r*rh, x1 = (c+1)*cw, y1 = (r+1)*rh
          lines.push({ x0, y0, x1, y1,   delay: Math.random()*.35, speed: .9+Math.random()*.5 })
          lines.push({ x0:x1, y0, x1:x0, y1, delay: Math.random()*.35, speed: .9+Math.random()*.5 })
        }
      }
      // Líneas de cuadrícula (separadores)
      for (let c = 1; c < cols; c++)
        for (let r = 0; r < rows; r++)
          lines.push({ x0:c*cw, y0:r*rh, x1:c*cw, y1:(r+1)*rh, delay: Math.random()*.4, speed: 1+Math.random()*.4 })
      for (let r = 1; r < rows; r++)
        for (let c = 0; c < cols; c++)
          lines.push({ x0:c*cw, y0:r*rh, x1:(c+1)*cw, y1:r*rh, delay: Math.random()*.4, speed: 1+Math.random()*.4 })

      // Líneas grandes cruzando toda la pantalla
      lines.push({ x0:0, y0:0,   x1:W, y1:H,   delay:.0, speed:1.2 })
      lines.push({ x0:W, y0:0,   x1:0, y1:H,   delay:.05,speed:1.2 })
      lines.push({ x0:0, y0:H/2, x1:W, y1:H/2, delay:.1, speed:1.3 })
      lines.push({ x0:W/2,y0:0,  x1:W/2,y1:H,  delay:.1, speed:1.3 })

      lines.forEach(l => { l.progress = 0; l.drawn = false })
    }

    function drawLine(l) {
      const t = Math.max(0, Math.min(1, (phase - l.delay) * l.speed))
      if (t <= 0) return
      ctx.beginPath()
      ctx.moveTo(l.x0, l.y0)
      ctx.lineTo(l.x0 + (l.x1-l.x0)*t, l.y0 + (l.y1-l.y0)*t)
      ctx.stroke()
      if (t >= 1) l.drawn = true
    }

    function animate() {
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(245,240,235,0.18)'
      ctx.lineWidth = 0.8
      ctx.lineCap = 'round'

      phase += 0.007
      lines.forEach(drawLine)

      const allDone = lines.every(l => l.drawn)
      if (allDone && !done) {
        done = true
        // Espera 800ms tras terminar las líneas, luego llama onFinish
        setTimeout(onFinish, 800)
      }

      if (phase < 2.5) rafId = requestAnimationFrame(animate)
    }

    resize()
    buildLines()
    animate()

    window.addEventListener('resize', () => { resize(); buildLines() })
    return () => cancelAnimationFrame(rafId)
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(48px, 8vw, 120px)',
          letterSpacing: '.12em', color: '#f5f0eb', lineHeight: 1
        }}>
          STRIDEPEAK
        </h1>
        <p style={{
          fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase',
          color: 'rgba(245,240,235,.4)', marginTop: 10
        }}>
          Sneakers originales · Bogotá
        </p>
      </div>
    </div>
  )
}