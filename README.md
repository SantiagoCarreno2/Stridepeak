# STRIDEPEAK — Documentación técnica

Tienda de sneakers desarrollada en React + Vite. Proyecto académico que demuestra los fundamentos de React aplicados a un caso real: catálogo de productos, carrito de compras, filtros, comparador y modo oscuro.

**Repositorio:** https://github.com/SantiagoCarreno2/Stridepeak  
**Hosting:** Vercel  
**Hosting:** https://stridepeak-3p79.vercel.app/
**Archivo principal:** `src/App.jsx`

---

## Estructura del proyecto

```
frontend/
├── public/
│   └── images/          ← fotos de los 6 sneakers
├── src/
│   ├── data/
│   │   └── productos.js ← array con los 6 productos
│   ├── App.jsx          ← toda la lógica de la aplicación
│   ├── App.css          ← todos los estilos
│   ├── index.css        ← estilos globales del body
│   └── main.jsx         ← punto de entrada de Vite
├── index.html
└── vite.config.js
```

---

## Requisito 1 — Formularios y controles con variables de estado

### Qué es
Un formulario controlado en React significa que cada campo del formulario tiene su valor ligado a una variable de estado (`useState`). Cuando el usuario escribe, el estado se actualiza; cuando el estado cambia, el input se re-renderiza. Esto le da a React control total sobre el formulario.

### Dónde está

| Control | Componente | Línea |
|---------|-----------|-------|
| `<input type="text">` buscador | `Catalogo` | 116 |
| `<select>` categoría | `Catalogo` | 126 |
| `<select>` rango de precio | `Catalogo` | 138 |
| `<button>` botones de talla | `TarjetaProducto` | 50 |
| `<input type="text">` nombre | `Contacto` | 322 |
| `<input type="email">` email | `Contacto` | 335 |
| `<textarea>` mensaje | `Contacto` | 348 |
| `<button type="submit">` enviar | `Contacto` | 361 |

### Fragmento de código

**`src/App.jsx` — líneas 90–92 y 116–122 (Catalogo)**
```jsx
// Variable de estado que controla el input del buscador
const [busqueda, setBusqueda] = useState('')

// Input controlado: su valor viene del estado, onChange actualiza el estado
<input
  type="text"
  placeholder="Buscar por nombre o marca..."
  value={busqueda}
  onChange={e => setBusqueda(e.target.value)}
  className="buscador"
/>
```

**`src/App.jsx` — líneas 274–280 (Contacto)**
```jsx
// Un solo estado maneja los tres campos del formulario
const [formulario, setFormulario] = useState({ nombre: '', email: '', mensaje: '' })

// handleChange actualiza solo el campo que cambió usando computed property
const handleChange = e => {
  setFormulario({ ...formulario, [e.target.name]: e.target.value })
}
```

**`src/App.jsx` — líneas 126–136 (selects de filtro)**
```jsx
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
```

---

## Requisito 2 — Componentes y comunicación entre ellos

### Qué es
React divide la interfaz en componentes reutilizables. Los componentes se comunican de dos formas: el padre le pasa datos al hijo mediante **props**, y el hijo le avisa al padre mediante **funciones callback** (lifting state up — "subir el estado").

### Dónde está

**Componentes definidos en `src/App.jsx`:**

| Componente | Línea de inicio |
|-----------|----------------|
| `TarjetaProducto` | 8 |
| `Catalogo` | 88 |
| `Carrito` | 175 |
| `Contacto` | 272 |
| `Nosotros` | 375 |
| `Comparador` | 417 |
| `App` (raíz) | 478 |

**Flujo de comunicación:**
- `App` → `Catalogo` (línea 639): pasa `onAgregar`, `comparador`, `onComparar`
- `Catalogo` → `TarjetaProducto` (línea 157): reenvía esas props
- `TarjetaProducto` → `App` (línea 22): llama `onAgregar(producto)` — lifting state up
- `App` → `Carrito` (línea 648): pasa `carrito`, `onEliminar`, `onReordenar`

### Fragmento de código

**`src/App.jsx` — líneas 638–653 (App pasa props a los hijos)**
```jsx
// App le da a Catalogo la función agregarAlCarrito y el estado del comparador
<Catalogo
  onAgregar={agregarAlCarrito}
  comparador={comparador}
  onComparar={toggleComparador}
/>

// App le da al Carrito el array y las funciones para modificarlo
<Carrito
  carrito={carrito}
  onEliminar={eliminarDelCarrito}
  onReordenar={reordenarCarrito}
/>
```

**`src/App.jsx` — líneas 8 y 22 (TarjetaProducto avisa al padre — lifting state up)**
```jsx
// El hijo recibe la función del padre como prop
function TarjetaProducto({ producto, onAgregar, comparador, onComparar }) {

  const handleAgregar = () => {
    // El hijo ejecuta la función del padre con los datos del producto
    onAgregar({ ...producto, tallaSeleccionada })
  }
}
```

---

## Requisito 3 — Eventos generados por un componente

### Qué es
Los eventos son acciones del usuario (clic, escritura, envío de formulario) que React captura mediante atributos especiales (`onClick`, `onChange`, `onSubmit`, etc.). Cada evento ejecuta una función que normalmente actualiza el estado.

### Dónde está

| Evento | Qué hace | Línea |
|--------|----------|-------|
| `onClick` en botones de talla | Guarda la talla seleccionada | 52 |
| `onClick` en "Agregar al carrito" | Llama a `handleAgregar` | 65 |
| `onClick` en "Comparar" | Llama a `onComparar` | 73 |
| `onChange` en buscador | Actualiza estado `busqueda` | 120 |
| `onChange` en selects | Actualiza `categoria` / `rango` | 128, 140 |
| `onSubmit` en formulario | Ejecuta `handleSubmit` | 319 |
| `onChange` en campos del form | Ejecuta `handleChange` | 326, 339, 350 |
| `onClick` en navbar | Cambia `paginaActiva` | 580 |
| `onClick` toggle tema | Invierte `modoOscuro` | 591 |
| `onDragStart/Over/Drop/End` | Controlan el arrastre | 225–229 |

### Fragmento de código

**`src/App.jsx` — líneas 49–57 (onClick en botones de talla)**
```jsx
{producto.tallas.map(t => (
  <button
    key={t}
    onClick={() => setTallaSeleccionada(t)}  // evento onClick
    className={`talla-btn ${tallaSeleccionada === t ? 'activa' : ''}`}
  >
    {t}
  </button>
))}
```

**`src/App.jsx` — líneas 319 y 292–302 (onSubmit en formulario)**
```jsx
<form onSubmit={handleSubmit} className="formulario" noValidate>

// La función que se ejecuta al enviar:
const handleSubmit = e => {
  e.preventDefault()  // evita que la página se recargue
  const erroresEncontrados = validar()
  if (Object.keys(erroresEncontrados).length > 0) {
    setErrores(erroresEncontrados)
    return
  }
  setExitoso(true)
  setFormulario({ nombre: '', email: '', mensaje: '' })
}
```

---

## Requisito 4 — Hook useState()

### Qué es
`useState` es el hook principal de React para manejar estado local en un componente. Devuelve dos cosas: el valor actual del estado y una función para actualizarlo. Cada vez que el estado cambia, React vuelve a renderizar el componente.

### Dónde está

| Variable de estado | Componente | Línea |
|-------------------|-----------|-------|
| `tallaSeleccionada` | `TarjetaProducto` | 10 |
| `agregado` | `TarjetaProducto` | 11 |
| `imgError` | `TarjetaProducto` | 12 |
| `busqueda` | `Catalogo` | 90 |
| `categoria` | `Catalogo` | 91 |
| `rango` | `Catalogo` | 92 |
| `dragOver` | `Carrito` | 180 |
| `formulario` | `Contacto` | 274 |
| `errores` | `Contacto` | 275 |
| `exitoso` | `Contacto` | 276 |
| `carrito` | `App` | 481 |
| `comparador` | `App` | 490 |
| `paginaActiva` | `App` | 498 |
| `modoOscuro` | `App` | 502 |

### Fragmento de código

**`src/App.jsx` — líneas 10–12 (TarjetaProducto)**
```jsx
const [tallaSeleccionada, setTallaSeleccionada] = useState(null)
// null = ninguna talla elegida todavía

const [agregado, setAgregado] = useState(false)
// false = el botón muestra "AGREGAR AL CARRITO"
// true  = el botón muestra "AGREGADO" por 2 segundos

const [imgError, setImgError] = useState(false)
// Si la imagen no carga, se muestra el nombre de la marca como fallback
```

**`src/App.jsx` — líneas 481–487 (carrito inicializado desde localStorage)**
```jsx
const [carrito, setCarrito] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('carrito')) || []
  } catch {
    return []
  }
})
```

---

## Requisito 5 — Hook useEffect()

### Qué es
`useEffect` ejecuta código con "efectos secundarios" (cosas que ocurren fuera del renderizado puro): guardar en localStorage, cambiar clases del DOM, hacer peticiones, etc. El array de dependencias al final indica cuándo debe re-ejecutarse.

### Dónde está

**`src/App.jsx` — líneas 509–522**

| useEffect | Qué hace | Dependencia | Línea |
|-----------|----------|-------------|-------|
| Sincroniza carrito | Guarda el carrito en localStorage | `[carrito]` | 509 |
| Sincroniza comparador | Guarda el comparador en localStorage | `[comparador]` | 514 |
| Sincroniza modo oscuro | Guarda la preferencia y aplica clase CSS al body | `[modoOscuro]` | 519 |

### Fragmento de código

**`src/App.jsx` — líneas 509–522**
```jsx
// Se ejecuta cada vez que el carrito cambia → guarda en localStorage
useEffect(() => {
  localStorage.setItem('carrito', JSON.stringify(carrito))
}, [carrito])

// Se ejecuta cada vez que el comparador cambia → guarda en localStorage
useEffect(() => {
  localStorage.setItem('comparador', JSON.stringify(comparador))
}, [comparador])

// Se ejecuta cuando cambia modoOscuro → persiste y aplica clase al body
useEffect(() => {
  localStorage.setItem('modoOscuro', String(modoOscuro))
  document.body.classList.toggle('oscuro', modoOscuro)
}, [modoOscuro])
```

---

## Requisito 6 — Peticiones fetch a un servidor web

### Qué es
`fetch` es la API nativa de JavaScript para hacer peticiones HTTP a un servidor. Se usa con `async/await` para manejar la respuesta de forma asíncrona. El proyecto tiene un backend en Node.js + Express que expone dos endpoints REST.

### Dónde está

El backend está en la carpeta `backend/` (separada del frontend). Tiene dos rutas:

| Endpoint | Archivo | Qué hace |
|----------|---------|----------|
| `GET /api/productos` | `backend/src/routes/productos.js` línea 5 | Devuelve el catálogo en JSON |
| `POST /api/contacto` | `backend/src/routes/contacto.js` línea 5 | Valida y procesa el formulario |

> El frontend fue desplegado en Vercel sin backend para simplificar el hosting. La implementación completa con fetch activo está en el backend y fue usada durante el desarrollo.

### Fragmento de código

**`backend/src/routes/productos.js` — el servidor que responde al fetch**
```js
const express = require('express')
const router = express.Router()
const productos = require('../data/productos')

// GET /api/productos → devuelve el array en formato JSON
router.get('/', (req, res) => {
  res.json(productos)
})
```

**Implementación del fetch en el frontend (versión con backend activo)**
```jsx
useEffect(() => {
  fetch('/api/productos')               // petición GET al servidor
    .then(res => {
      if (!res.ok) throw new Error('Error al cargar productos')
      return res.json()                 // convierte la respuesta a JSON
    })
    .then(data => setProductos(data))   // guarda los productos en el estado
    .catch(err => setError(err.message))
}, [])
```

---

## Requisito 7 — Propiedad key en listas

### Qué es
Cuando React renderiza una lista de elementos con `.map()`, necesita identificar cada elemento de forma única para saber cuáles cambiaron, se agregaron o eliminaron. La prop `key` cumple ese rol: debe ser un valor único y estable (preferiblemente un `id`, no el índice).

### Dónde está

| Lista | Valor de key | Línea |
|-------|-------------|-------|
| Botones de talla | `key={t}` (número de talla) | 51 |
| Tarjetas de producto | `key={p.id}` (id único del producto) | 158 |
| Opciones del select categoría | `key={c}` (nombre de categoría) | 132 |
| Links de navegación | `key={key}` (nombre de la ruta) | 579 |
| Items del carrito | `key={index}` (posición en el array) | 222 |
| Filas del comparador | `key={f.label}` (etiqueta de la fila) | 452 |

### Fragmento de código

**`src/App.jsx` — líneas 156–164 (lista de productos)**
```jsx
<div className="grid-productos">
  {productosFiltrados.map(p => (
    <TarjetaProducto
      key={p.id}        {/* ← React usa este id para identificar cada tarjeta */}
      producto={p}
      onAgregar={onAgregar}
      comparador={comparador}
      onComparar={onComparar}
    />
  ))}
</div>
```

**`src/App.jsx` — líneas 49–57 (botones de talla)**
```jsx
{producto.tallas.map(t => (
  <button
    key={t}            {/* ← cada talla es única dentro del producto */}
    onClick={() => setTallaSeleccionada(t)}
  >
    {t}
  </button>
))}
```

---

## Requisito 8 — Imágenes

### Qué es
Las imágenes se muestran con la etiqueta `<img>` de HTML. En React se pueden manejar eventos sobre ellas, como `onError`, que permite mostrar un contenido alternativo (fallback) si la imagen no carga. Los archivos físicos de imagen están en `public/images/`.

### Dónde está

| Imagen | Componente | Línea |
|--------|-----------|-------|
| Foto de cada producto en el catálogo | `TarjetaProducto` | 31 |
| Imagen hero (Jordan 1) en la página de inicio | `App` | 628 |
| Imagen pequeña en cada item del carrito | `Carrito` | 235 |
| Imagen en el panel comparador | `Comparador` | 426 |
| Fallback de texto si la imagen falla | `TarjetaProducto` | 38 |

**Archivos de imagen en `public/images/`:**
`af1.png` · `tn.png` · `jordan1.png` · `samba.png` · `nb550.png` · `chuck70.png`

### Fragmento de código

**`src/App.jsx` — líneas 30–39 (imagen con fallback en TarjetaProducto)**
```jsx
{!imgError ? (
  <img
    src={producto.imagen}        // ruta: /images/af1.png, etc.
    alt={producto.nombre}
    className="tarjeta-img"
    onError={() => setImgError(true)}  // si falla, activa el fallback
  />
) : (
  // Fallback: muestra el nombre de la marca si la imagen no carga
  <div className="tarjeta-img-fallback">{producto.marca}</div>
)}
```

**`src/App.jsx` — líneas 628–633 (imagen hero con animación CSS)**
```jsx
<img
  src="/images/jordan1.png"
  alt="Jordan 1"
  className="hero-img"           // tiene animación de flotación en App.css
  onError={e => { e.target.style.display = 'none' }}
/>
```

---

## Requisito 9 — Filtros

### Qué es
Los filtros permiten mostrar solo los productos que cumplan ciertos criterios. Se implementan con el método `.filter()` de JavaScript aplicado sobre el array de productos. Al estar dentro del componente y depender de variables de estado, se recalculan automáticamente cada vez que el usuario cambia un selector.

### Dónde está

**`src/App.jsx` — líneas 98–110 (Catalogo)**

Hay tres filtros encadenados que se aplican en secuencia:
1. **Búsqueda de texto** (línea 99): filtra por nombre, marca o categoría
2. **Categoría** (línea 103): Lifestyle, Running o Basketball
3. **Rango de precio** (líneas 104–110): cuatro rangos predefinidos

### Fragmento de código

**`src/App.jsx` — líneas 98–110**
```jsx
const productosFiltrados = productosData
  // Filtro 1: búsqueda de texto libre (nombre, marca o categoría)
  .filter(p => {
    const texto = `${p.nombre} ${p.marca} ${p.categoria}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })
  // Filtro 2: por categoría seleccionada en el <select>
  .filter(p => categoria === 'todas' || p.categoria === categoria)
  // Filtro 3: por rango de precio seleccionado en el <select>
  .filter(p => {
    if (rango === 'todos')    return true
    if (rango === 'menos300') return p.precio < 300000
    if (rango === '300a500')  return p.precio >= 300000 && p.precio <= 500000
    if (rango === 'mas500')   return p.precio > 500000
    return true
  })
```

---

## Requisito 10 — Drag and Drop

### Qué es
Drag and Drop permite al usuario arrastrar elementos de la interfaz y soltarlos en una nueva posición. Se implementa con la API nativa de HTML5 (atributos `draggable` y eventos `onDragStart`, `onDragOver`, `onDrop`) sin necesidad de librerías externas. En este proyecto se usa para reordenar los productos dentro del carrito.

### Dónde está

**`src/App.jsx` — componente `Carrito`, líneas 178–207**

| Elemento | Línea |
|---------|-------|
| `useRef` para guardar índice origen | 178 |
| `handleDragStart` — registra qué item se arrastra | 184 |
| `handleDragOver` — previene el comportamiento por defecto | 189 |
| `handleDrop` — ejecuta el reordenamiento | 195 |
| `handleDragEnd` — limpia los estados al terminar | 204 |
| Atributo `draggable` en cada item | 224 |
| `reordenarCarrito` en App — hace el splice del array | 548 |

### Fragmento de código

**`src/App.jsx` — líneas 184–207 (handlers del DnD)**
```jsx
const handleDragStart = (e, index) => {
  dragIndex.current = index          // guarda de dónde viene el item
  e.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (e, index) => {
  e.preventDefault()                 // sin esto, onDrop no funciona
  if (dragOver !== index) setDragOver(index)  // resalta la fila destino
}

const handleDrop = (e, index) => {
  e.preventDefault()
  if (dragIndex.current !== null && dragIndex.current !== index) {
    onReordenar(dragIndex.current, index)  // avisa al padre para reordenar
  }
  dragIndex.current = null
  setDragOver(null)
}
```

**`src/App.jsx` — líneas 548–555 (reordenarCarrito en App)**
```jsx
const reordenarCarrito = (indexOrigen, indexDestino) => {
  setCarrito(prev => {
    const nuevo = [...prev]
    const [item] = nuevo.splice(indexOrigen, 1)   // saca el item
    nuevo.splice(indexDestino, 0, item)            // lo inserta en la nueva posición
    return nuevo
  })
}
```

---

## Requisito 11 — Hosting en Vercel

### Qué es
Vercel es una plataforma de hosting para aplicaciones frontend. Detecta automáticamente proyectos Vite, instala las dependencias con `npm install`, construye el proyecto con `npm run build` y sirve la carpeta `dist/` resultante en una URL pública con HTTPS.

### Configuración

**`vite.config.js` — configuración del proyecto**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

**`package.json` — scripts que usa Vercel**
```json
{
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview"
  }
}
```

**`.gitignore` — archivos excluidos del repositorio**
```
node_modules/
dist/
.env
```

Vercel conecta directamente con el repositorio de GitHub. Cada `git push` a `main` dispara un nuevo despliegue automático.

---

## Requisito 12 — Comparador de productos (valor agregado)

### Qué es
El comparador permite seleccionar hasta 2 productos del catálogo y ver una tabla comparativa lado a lado con sus características: imagen, nombre, marca, precio, categoría y tallas disponibles. El estado del comparador se persiste en `localStorage` para que sobreviva recargas. Es un valor agregado que va más allá de los requisitos básicos.

### Dónde está

| Elemento | Archivo | Línea |
|---------|---------|-------|
| Componente `Comparador` | `src/App.jsx` | 417 |
| Estado `comparador` en App | `src/App.jsx` | 490 |
| Función `toggleComparador` | `src/App.jsx` | 534 |
| Función `cerrarComparador` | `src/App.jsx` | 545 |
| Botón "Comparar/Quitar" en tarjeta | `src/App.jsx` | 72 |
| Estilos del panel | `src/App.css` | ~700 |

### Fragmento de código

**`src/App.jsx` — líneas 534–543 (lógica del comparador)**
```jsx
const toggleComparador = producto => {
  const yaEsta = comparador.some(p => p.id === producto.id)
  if (yaEsta) {
    // Si ya está, lo quita
    setComparador(prev => prev.filter(p => p.id !== producto.id))
  } else if (comparador.length >= 2) {
    // Si ya hay 2, avisa al usuario
    alert('Ya tienes 2 productos para comparar. Cierra el comparador o quita uno.')
  } else {
    // Si no está y hay espacio, lo agrega
    setComparador(prev => [...prev, producto])
  }
}
```

**`src/App.jsx` — líneas 417–418 (el componente solo aparece con 2 productos)**
```jsx
function Comparador({ comparador, onCerrar }) {
  if (comparador.length < 2) return null  // no renderiza nada si hay menos de 2
  // ...
}
```

**`src/App.jsx` — líneas 72–77 (botón en cada tarjeta)**
```jsx
<button
  onClick={() => onComparar(producto)}
  className={`btn-comparar ${enComparador ? 'en-comparador' : ''}`}
>
  {enComparador ? 'QUITAR' : 'COMPARAR'}
</button>
```

---

## Requisito 13 — Almacenamiento en localStorage

### Qué es
`localStorage` es una API del navegador que permite guardar datos de forma persistente entre sesiones. A diferencia del estado de React (que se borra al recargar), los datos en `localStorage` sobreviven incluso si el usuario cierra el navegador. Se usa `JSON.stringify` para guardar objetos y `JSON.parse` para leerlos.

### Dónde está

**`src/App.jsx` — tres usos de localStorage:**

| Dato guardado | Se inicializa en | Se sincroniza en | Clave en localStorage |
|--------------|-----------------|------------------|-----------------------|
| Carrito | línea 481 | línea 509 | `'carrito'` |
| Comparador | línea 490 | línea 514 | `'comparador'` |
| Modo oscuro | línea 502 | línea 519 | `'modoOscuro'` |

### Fragmento de código

**`src/App.jsx` — líneas 481–511 (inicialización y sincronización del carrito)**
```jsx
// Al iniciar la app, lee el carrito guardado (si existe)
const [carrito, setCarrito] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('carrito')) || []
  } catch {
    return []   // si el dato está corrupto, empieza con array vacío
  }
})

// Cada vez que el carrito cambia, lo guarda en localStorage
useEffect(() => {
  localStorage.setItem('carrito', JSON.stringify(carrito))
}, [carrito])
```

**`src/App.jsx` — líneas 502–521 (modo oscuro sin parpadeo al recargar)**
```jsx
// La clase CSS se aplica ANTES del primer render para evitar parpadeo
const [modoOscuro, setModoOscuro] = useState(() => {
  const guardado = localStorage.getItem('modoOscuro') === 'true'
  if (guardado) document.body.classList.add('oscuro')
  return guardado
})

// Mantiene localStorage y el DOM sincronizados
useEffect(() => {
  localStorage.setItem('modoOscuro', String(modoOscuro))
  document.body.classList.toggle('oscuro', modoOscuro)
}, [modoOscuro])
```

---

## Requisito 14 — Conversor de moneda con API externa (Open Exchange Rates)

### Qué es
El conversor de moneda conecta la app a la API pública de **Open Exchange Rates** para obtener tasas de cambio en tiempo real. El usuario puede elegir entre COP, USD y EUR desde un selector en el catálogo; todos los precios se recalculan automáticamente usando las tasas descargadas. La moneda seleccionada se guarda en `localStorage` para persistir entre sesiones.

### Dónde está

| Elemento | Archivo | Línea aprox. |
|---------|---------|-------------|
| Función `formatearPrecio` (conversión + símbolo) | `src/App.jsx` | 9–16 |
| Estado `moneda` (inicializado desde localStorage) | `src/App.jsx` | `App` — estado |
| Estado `tasas` (tasas de cambio de la API) | `src/App.jsx` | `App` — estado |
| `useEffect` que hace `fetch` a la API | `src/App.jsx` | `App` — efectos |
| `useEffect` que guarda `moneda` en localStorage | `src/App.jsx` | `App` — efectos |
| Selector `<select>` de moneda en el catálogo | `src/App.jsx` | `Catalogo` — filtros |
| Precios convertidos en tarjetas de producto | `src/App.jsx` | `TarjetaProducto` |
| Precios convertidos en el carrito | `src/App.jsx` | `Carrito` |
| Precios convertidos en el comparador | `src/App.jsx` | `Comparador` |
| Estilos del selector de moneda | `src/App.css` | `.filtro-moneda-wrap` |

### Endpoint de la API

```
GET https://openexchangerates.org/api/latest.json?app_id=<API_KEY>
```

La respuesta contiene un objeto `rates` con todas las tasas relativas al dólar (USD = 1):

```json
{
  "base": "USD",
  "rates": {
    "COP": 4100.5,
    "EUR": 0.92,
    "USD": 1
  }
}
```

### Fórmula de conversión

Los precios originales en `productos.js` están en **COP**. Para convertir a otra moneda:

```
precioDolar   = precioCOP / rates.COP
precioDestino = precioDolar * rates[monedaDestino]
```

### Fragmento de código

**`src/App.jsx` — función `formatearPrecio` (conversión y símbolo)**
```jsx
function formatearPrecio(precioCOP, moneda, tasas) {
  // Sin tasas o moneda COP → muestra el precio original
  if (!tasas || moneda === 'COP') {
    return `$${precioCOP.toLocaleString('es-CO')} COP`
  }
  // COP → USD → moneda destino
  const valor = (precioCOP / tasas.COP) * tasas[moneda]
  if (moneda === 'EUR') return `€${valor.toFixed(2)} EUR`  // símbolo €
  return `$${valor.toFixed(2)} USD`                        // símbolo $
}
```

**`src/App.jsx` — estado y fetch en el componente `App`**
```jsx
// Moneda seleccionada — se inicializa desde localStorage
const [moneda, setMoneda] = useState(() => {
  return localStorage.getItem('moneda') || 'COP'
})

// Tasas de cambio descargadas de la API (null mientras carga)
const [tasas, setTasas] = useState(null)

// Se ejecuta una sola vez al montar → descarga las tasas de cambio
useEffect(() => {
  fetch('https://openexchangerates.org/api/latest.json?app_id=...')
    .then(r => r.json())
    .then(data => setTasas(data.rates))
    .catch(() => {})  // ante un error de red se queda en COP
}, [])

// Persiste la moneda elegida cada vez que cambia
useEffect(() => {
  localStorage.setItem('moneda', moneda)
}, [moneda])
```

**`src/App.jsx` — selector de moneda en `Catalogo`**
```jsx
<div className="filtro-moneda-wrap">
  <select
    value={moneda}
    onChange={e => setMoneda(e.target.value)}
    className="filtro-select filtro-moneda"
  >
    <option value="COP">$ COP</option>
    <option value="USD">$ USD</option>
    <option value="EUR">€ EUR</option>
  </select>
  {/* Aviso mientras las tasas no han llegado */}
  {!tasas && <span className="moneda-cargando">cargando tasas…</span>}
</div>
```

### Flujo completo

```
Usuario abre el catálogo
       ↓
App monta → useEffect dispara fetch a Open Exchange Rates
       ↓
API responde con { rates: { COP, USD, EUR, ... } }
       ↓
setTasas(data.rates) → estado tasas disponible
       ↓
Usuario elige USD en el selector
       ↓
setMoneda('USD') → se guarda en localStorage
       ↓
formatearPrecio() recalcula todos los precios con la fórmula
       ↓
Tarjetas, carrito y comparador muestran precios en USD
```

### Símbolos por moneda

| Moneda | Símbolo | Ejemplo |
|--------|---------|---------|
| COP | `$` | `$420.000 COP` |
| USD | `$` | `$102.42 USD` |
| EUR | `€` | `€94.87 EUR` |

---

## Tecnologías utilizadas

| Tecnología | Versión | Para qué |
|-----------|---------|----------|
| React | 19 | Librería de UI con componentes y estado |
| Vite | 6 | Bundler y servidor de desarrollo rápido |
| CSS puro | — | Todos los estilos (sin frameworks) |
| HTML5 Drag & Drop API | nativa | Reordenar items del carrito |
| localStorage API | nativa | Persistencia del carrito, comparador, tema y moneda |
| Open Exchange Rates API | — | Tasas de cambio en tiempo real (COP, USD, EUR) |
| Node.js + Express | — | Backend con API REST (desarrollo local) |
| Vercel | — | Hosting del frontend en producción |
| GitHub | — | Control de versiones y CI/CD con Vercel |
