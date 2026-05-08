import { useState, useEffect, useRef } from 'react'
import productosData from './data/productos'
import LoadingScreen from './LoadingScreen'
import './App.css'

// ============================================================
// COMPONENTE: TarjetaProducto
// ============================================================
function TarjetaProducto({ producto, onAgregar, comparador, onComparar }) {

  const [tallaSeleccionada, setTallaSeleccionada] = useState(null)
  const [agregado, setAgregado] = useState(false)
  const [imgError, setImgError] = useState(false)

  const enComparador = comparador.some(p => p.id === producto.id)

  const handleAgregar = () => {
    if (!tallaSeleccionada) {
      alert('Por favor selecciona una talla.')
      return
    }
    onAgregar({ ...producto, tallaSeleccionada })
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="tarjeta">
      <div className="tarjeta-img-box">
        {!imgError ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="tarjeta-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="tarjeta-img-fallback">{producto.marca}</div>
        )}
      </div>

      <div className="tarjeta-info">
        <span className="tarjeta-marca">{producto.marca}</span>
        <h3 className="tarjeta-nombre">{producto.nombre}</h3>
        <p className="tarjeta-cat">{producto.categoria}</p>

        <div className="tallas-label">TALLA EU:</div>
        <div className="tallas">
          {producto.tallas.map(t => (
            <button
              key={t}
              onClick={() => setTallaSeleccionada(t)}
              className={`talla-btn ${tallaSeleccionada === t ? 'activa' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="tarjeta-precio">
          {`$${producto.precio.toLocaleString('es-CO')} COP`}
        </p>

        <button
          onClick={handleAgregar}
          className={`btn-agregar ${agregado ? 'agregado' : ''}`}
        >
          {agregado ? 'AGREGADO' : 'AGREGAR AL CARRITO'}
        </button>

        <button
          onClick={() => onComparar(producto)}
          className={`btn-comparar ${enComparador ? 'en-comparador' : ''}`}
        >
          {enComparador ? 'QUITAR' : 'COMPARAR'}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// COMPONENTE: Catalogo
// ============================================================
function Catalogo({ onAgregar, comparador, onComparar }) {

  const [busqueda, setBusqueda]   = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [rango, setRango]         = useState('todos')

  const categorias = ['todas', ...new Set(productosData.map(p => p.categoria))]

  const productosFiltrados = productosData
    .filter(p => {
      const texto = `${p.nombre} ${p.marca} ${p.categoria}`.toLowerCase()
      return texto.includes(busqueda.toLowerCase())
    })
    .filter(p => categoria === 'todas' || p.categoria === categoria)
    .filter(p => {
      if (rango === 'todos')    return true
      if (rango === 'menos300') return p.precio < 300000
      if (rango === '300a500')  return p.precio >= 300000 && p.precio <= 500000
      if (rango === 'mas500')   return p.precio > 500000
      return true
    })

  return (
    <section id="catalogo" className="seccion-catalogo">
      <h2 className="seccion-titulo">CATÁLOGO</h2>

      <input
        type="text"
        placeholder="Buscar por nombre o marca..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="buscador"
      />

      <div className="filtros">
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className="filtro-select"
        >
          {categorias.map(c => (
            <option key={c} value={c}>
              {c === 'todas' ? 'TODAS LAS CATEGORÍAS' : c.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={rango}
          onChange={e => setRango(e.target.value)}
          className="filtro-select"
        >
          <option value="todos">TODOS LOS PRECIOS</option>
          <option value="menos300">MENOS DE $300.000</option>
          <option value="300a500">$300.000 – $500.000</option>
          <option value="mas500">MÁS DE $500.000</option>
        </select>
      </div>

      <p className="resultado-count">
        {`${productosFiltrados.length} productos encontrados`}
      </p>

      <div className="grid-productos">
        {productosFiltrados.map(p => (
          <TarjetaProducto
            key={p.id}
            producto={p}
            onAgregar={onAgregar}
            comparador={comparador}
            onComparar={onComparar}
          />
        ))}
      </div>
    </section>
  )
}

// ============================================================
// COMPONENTE: Carrito
// ============================================================
function Carrito({ carrito, onEliminar, onReordenar }) {

  const dragIndex = useRef(null)
  const [dragOver, setDragOver] = useState(null)

  const total = carrito.reduce((suma, item) => suma + item.precio, 0)

  const handleDragStart = (e, index) => {
    dragIndex.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOver !== index) setDragOver(index)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    if (dragIndex.current !== null && dragIndex.current !== index) {
      onReordenar(dragIndex.current, index)
    }
    dragIndex.current = null
    setDragOver(null)
  }

  const handleDragEnd = () => {
    dragIndex.current = null
    setDragOver(null)
  }

  return (
    <section id="carrito" className="seccion-carrito">
      <h2 className="seccion-titulo">CARRITO</h2>

      {carrito.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío.</p>
      ) : (
        <>
          <p className="carrito-hint">Arrastra los items para reordenarlos.</p>

          {carrito.map((item, index) => (
            <div
              key={index}
              className={`carrito-item ${dragOver === index ? 'drag-over' : ''}`}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={e => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onDragLeave={() => setDragOver(null)}
            >
              <span className="drag-handle" title="Arrastra para reordenar">⠿</span>

              <img
                src={item.imagen}
                alt={item.nombre}
                className="carrito-img"
                onError={e => { e.target.style.display = 'none' }}
              />

              <div className="carrito-item-info">
                <span className="carrito-item-marca">{item.marca}</span>
                <span className="carrito-item-nombre">{item.nombre}</span>
                <span className="carrito-item-talla">
                  {`Talla: EU ${item.tallaSeleccionada}`}
                </span>
              </div>

              <span className="carrito-item-precio">
                ${item.precio.toLocaleString('es-CO')}
              </span>

              <button onClick={() => onEliminar(index)} className="btn-eliminar">
                ✕
              </button>
            </div>
          ))}

          <div className="carrito-total">
            {`TOTAL: $${total.toLocaleString('es-CO')} COP`}
          </div>
        </>
      )}
    </section>
  )
}

// ============================================================
// COMPONENTE: Contacto
// ============================================================
function Contacto() {

  const [formulario, setFormulario] = useState({ nombre: '', email: '', mensaje: '' })
  const [errores, setErrores]       = useState({})
  const [exitoso, setExitoso]       = useState(false)

  const handleChange = e => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
    if (errores[e.target.name]) setErrores({ ...errores, [e.target.name]: '' })
  }

  const validar = () => {
    const nuevosErrores = {}
    if (!formulario.nombre.trim())       nuevosErrores.nombre  = 'El nombre es obligatorio'
    if (!formulario.email.includes('@')) nuevosErrores.email   = 'El email no es válido'
    if (formulario.mensaje.length < 10)  nuevosErrores.mensaje = 'El mensaje debe tener al menos 10 caracteres'
    return nuevosErrores
  }

  const handleSubmit = e => {
    e.preventDefault()
    const erroresEncontrados = validar()
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    setErrores({})
    setExitoso(true)
    setFormulario({ nombre: '', email: '', mensaje: '' })
  }

  return (
    <section id="contacto" className="seccion-contacto">
      <h2 className="seccion-titulo">CONTACTO</h2>
      <div className="contacto-layout">
        <div className="contacto-info">
          <p className="info-label">DIRECCIÓN</p>
          <p className="info-valor">Calle 72 #10-34, Bogotá</p>
          <p className="info-label">TELÉFONO</p>
          <p className="info-valor">+57 301 234 5678</p>
          <p className="info-label">EMAIL</p>
          <p className="info-valor">hola@stridepeak.co</p>
          <p className="info-label">HORARIO</p>
          <p className="info-valor">Lun – Sab: 8am – 8pm</p>
        </div>

        <form onSubmit={handleSubmit} className="formulario" noValidate>
          <div className="campo">
            <label className="campo-label">NOMBRE *</label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              className={`campo-input ${errores.nombre ? 'error' : ''}`}
            />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>

          <div className="campo">
            <label className="campo-label">EMAIL *</label>
            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              className={`campo-input ${errores.email ? 'error' : ''}`}
            />
            {errores.email && <p className="campo-error">{errores.email}</p>}
          </div>

          <div className="campo">
            <label className="campo-label">MENSAJE *</label>
            <textarea
              name="mensaje"
              value={formulario.mensaje}
              onChange={handleChange}
              placeholder="¿En qué podemos ayudarte?"
              rows={4}
              className={`campo-input campo-textarea ${errores.mensaje ? 'error' : ''}`}
            />
            {errores.mensaje && <p className="campo-error">{errores.mensaje}</p>}
          </div>

          {errores.general && <p className="campo-error">{errores.general}</p>}

          <button type="submit" className="btn-enviar">
            ENVIAR MENSAJE
          </button>

          {exitoso && <p className="campo-exito">Mensaje enviado correctamente.</p>}
        </form>
      </div>
    </section>
  )
}

// ============================================================
// COMPONENTE: Nosotros
// ============================================================
function Nosotros() {
  return (
    <section id="nosotros" className="seccion-nosotros">
      <h2 className="seccion-titulo">NOSOTROS</h2>
      <div className="nosotros-grid">
        <div className="nosotros-card">
          <span className="nosotros-num">01</span>
          <h3 className="nosotros-card-titulo">LA MOTIVACIÓN</h3>
          <p className="nosotros-card-texto">
            Los tennis representan cultura, identidad y expresión personal.
            En Colombia la comunidad sneaker crece cada año y quisimos crear
            el espacio digital que esa cultura merecía.
          </p>
        </div>
        <div className="nosotros-card">
          <span className="nosotros-num">02</span>
          <h3 className="nosotros-card-titulo">EL PROYECTO</h3>
          <p className="nosotros-card-texto">
            Aplicamos React, componentes, objetos literales, useState,
            formularios con validaciones y eventos — todo lo visto en clase —
            en un proyecto real con impacto en el mercado colombiano.
          </p>
        </div>
        <div className="nosotros-card">
          <span className="nosotros-num">03</span>
          <h3 className="nosotros-card-titulo">EL EQUIPO</h3>
          <p className="nosotros-card-texto">
            Somos tres estudiantes apasionados por la tecnología y la cultura
            urbana. STRIDEPEAK nació de combinar esas dos pasiones en un
            solo proyecto.
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// COMPONENTE: Comparador
// ============================================================
function Comparador({ comparador, onCerrar }) {
  if (comparador.length < 2) return null

  const [a, b] = comparador

  const filas = [
    {
      label: 'IMAGEN',
      render: p => (
        <img
          src={p.imagen}
          alt={p.nombre}
          className="comp-img"
          onError={e => { e.target.style.display = 'none' }}
        />
      ),
    },
    { label: 'NOMBRE',    render: p => p.nombre },
    { label: 'MARCA',     render: p => <span className="comp-marca">{p.marca}</span> },
    { label: 'PRECIO',    render: p => `$${p.precio.toLocaleString('es-CO')} COP` },
    { label: 'CATEGORÍA', render: p => p.categoria },
    { label: 'TALLAS',    render: p => p.tallas.join(' · ') },
  ]

  return (
    <div className="comparador-panel">
      <div className="comparador-header">
        <span className="comparador-titulo">COMPARADOR</span>
        <button onClick={onCerrar} className="comparador-cerrar">✕ CERRAR</button>
      </div>

      <div className="comparador-tabla">
        <div className="comp-col comp-col-labels">
          {filas.map(f => (
            <div key={f.label} className="comp-celda comp-label">{f.label}</div>
          ))}
        </div>
        <div className="comp-col">
          {filas.map(f => (
            <div key={f.label} className="comp-celda">{f.render(a)}</div>
          ))}
        </div>
        <div className="comp-col">
          {filas.map(f => (
            <div key={f.label} className="comp-celda">{f.render(b)}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COMPONENTE PRINCIPAL: App
// ============================================================
function App() {

  // ← LOADING SCREEN: se muestra al inicio y desaparece sola
  const [cargando, setCargando] = useState(true)

  const [carrito, setCarrito] = useState(() => {
    try { return JSON.parse(localStorage.getItem('carrito')) || [] }
    catch { return [] }
  })

  const [comparador, setComparador] = useState(() => {
    try { return JSON.parse(localStorage.getItem('comparador')) || [] }
    catch { return [] }
  })

  const [paginaActiva, setPaginaActiva] = useState('inicio')

  const [modoOscuro, setModoOscuro] = useState(() => {
    const guardado = localStorage.getItem('modoOscuro') === 'true'
    if (guardado) document.body.classList.add('oscuro')
    return guardado
  })

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito))
  }, [carrito])

  useEffect(() => {
    localStorage.setItem('comparador', JSON.stringify(comparador))
  }, [comparador])

  useEffect(() => {
    localStorage.setItem('modoOscuro', String(modoOscuro))
    document.body.classList.toggle('oscuro', modoOscuro)
  }, [modoOscuro])

  const agregarAlCarrito = producto => setCarrito(prev => [...prev, producto])

  const eliminarDelCarrito = index => setCarrito(prev => prev.filter((_, i) => i !== index))

  const toggleComparador = producto => {
    const yaEsta = comparador.some(p => p.id === producto.id)
    if (yaEsta) {
      setComparador(prev => prev.filter(p => p.id !== producto.id))
    } else if (comparador.length >= 2) {
      alert('Ya tienes 2 productos para comparar. Cierra el comparador o quita uno.')
    } else {
      setComparador(prev => [...prev, producto])
    }
  }

  const cerrarComparador = () => setComparador([])

  const reordenarCarrito = (indexOrigen, indexDestino) => {
    setCarrito(prev => {
      const nuevo = [...prev]
      const [item] = nuevo.splice(indexOrigen, 1)
      nuevo.splice(indexDestino, 0, item)
      return nuevo
    })
  }

  const navegar = pagina => {
    setPaginaActiva(pagina)
    window.scrollTo(0, 0)
  }

  // ← Mientras carga, solo muestra la pantalla de carga
  if (cargando) return <LoadingScreen onFinish={() => setCargando(false)} />

  return (
    <div className={`app${modoOscuro ? ' oscuro' : ''}`}>

      <nav className="navbar">
        <button onClick={() => navegar('inicio')} className="navbar-logo">
          <img src="/images/logo.png" alt="SP" className="navbar-logo-img" />
          STRIDE<span className="logo-acento">PEAK</span>
        </button>

        <div className="navbar-links">
          {[
            ['inicio',   'INICIO'   ],
            ['catalogo', 'CATÁLOGO' ],
            ['nosotros', 'NOSOTROS' ],
            ['contacto', 'CONTACTO' ],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => navegar(key)}
              className={`navbar-link ${paginaActiva === key ? 'activo' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="navbar-acciones">
          <button
            onClick={() => setModoOscuro(m => !m)}
            className="navbar-tema"
            title={modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {modoOscuro ? '◐ CLARO' : '◑ OSCURO'}
          </button>

          <button onClick={() => navegar('carrito')} className="navbar-carrito">
            Carrito
            {carrito.length > 0 && (
              <span className="carrito-badge">{carrito.length}</span>
            )}
          </button>
        </div>
      </nav>

      <main className="main">

        {paginaActiva === 'inicio' && (
          <section className="hero">
            <div className="hero-texto">
              <p className="hero-eyebrow">NUEVA COLECCIÓN 2025</p>
              <h1 className="hero-titulo">
                EL SNEAKER<br />
                <span className="hero-titulo-rojo">PERFECTO</span><br />
                TE ESPERA
              </h1>
              <p className="hero-desc">
                Sneakers originales de las marcas que definen la cultura.
                Nike, Jordan, Adidas y más — directo a Bogotá.
              </p>
              <button onClick={() => navegar('catalogo')} className="hero-btn">
                VER CATÁLOGO
              </button>
            </div>
            <div className="hero-imagen">
              <img
                src="/images/jordan1.png"
                alt="Jordan 1"
                className="hero-img"
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
          </section>
        )}

        {paginaActiva === 'catalogo' && (
          <Catalogo
            onAgregar={agregarAlCarrito}
            comparador={comparador}
            onComparar={toggleComparador}
          />
        )}

        {paginaActiva === 'carrito' && (
          <Carrito
            carrito={carrito}
            onEliminar={eliminarDelCarrito}
            onReordenar={reordenarCarrito}
          />
        )}

        {paginaActiva === 'contacto' && <Contacto />}
        {paginaActiva === 'nosotros' && <Nosotros />}

      </main>

      <Comparador comparador={comparador} onCerrar={cerrarComparador} />

      <footer className="footer">
        <span className="footer-logo">STRIDEPEAK</span>
        <p className="footer-copy">© 2025 — Bogotá, Colombia</p>
      </footer>

    </div>
  )
}

export default App
