# PWA Caja - Sistema de Punto de Venta

Aplicación web progresiva (PWA) para gestión de ventas y control de caja. Permite gestionar productos, categorías y realizar ventas con diferentes métodos de pago.

## Características

- Interfaz de usuario intuitiva y responsiva
- Gestión de productos organizados por categorías
- Control de ventas en efectivo y transferencia
- Generación de reportes en PDF
- Funciona sin conexión (offline)
- Instalable en dispositivos móviles y de escritorio

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Node.js (solo para desarrollo)
- npm o yarn (solo para desarrollo)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd pwa_caja
   ```

2. Instala las dependencias (si es necesario):
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npx http-server -c-1
   ```
   O simplemente abre el archivo `index.html` en tu navegador.

## Uso

1. **Agregar Productos**:
   - Haz clic en "Agregar Nuevo Producto"
   - Completa el formulario con nombre, precio y categoría
   - Haz clic en "Guardar Producto"

2. **Realizar una Venta**:
   - Selecciona una categoría
   - Haz clic en el producto vendido
   - Elige el método de pago (Efectivo o Transferencia)
   - La venta se registrará automáticamente

3. **Ver Resumen**:
   - Haz clic en "Ver Total y Detalle" para ver el resumen del día
   - Descarga un reporte en PDF si es necesario

4. **Cerrar Caja**:
   - Al finalizar el día, haz clic en "Cerrar y Reiniciar Caja"
   - Se generará un reporte final y se reiniciarán los contadores

## Estructura del Proyecto

```
pwa_caja/
├── index.html          # Página principal
├── app.js             # Lógica de la aplicación
├── style.css          # Estilos CSS
├── productos.json     # Base de datos de productos
├── manifest.json      # Configuración de PWA
└── README.md          # Este archivo
```

## Personalización

### Agregar Categorías y Productos

Edita el archivo `productos.json` para agregar o modificar categorías y productos:

```json
{
  "categorias": [
    {
      "nombre": "Comida",
      "productos": [
        { "nombre": "Hamburguesa", "precio": 5000 },
        { "nombre": "Papas Fritas", "precio": 2500 }
      ]
    }
  ]
}
```

### Personalizar Estilos

Puedes modificar los colores y estilos en el archivo `style.css`. Las variables CSS están definidas al principio del archivo:

```css
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --danger-color: #e74c3c;
  --bg-light: #ffffff;
  --text-light: #333333;
  /* ... más variables ... */
}
```

## Despliegue

Para desplegar la aplicación en producción:

1. Sube todos los archivos a tu servidor web
2. Asegúrate de que el archivo `service-worker.js` se sirva con el tipo MIME correcto
3. La aplicación estará disponible en `https://tudominio.com`

## Soporte

Si encuentras algún problema o tienes preguntas, por favor [abre un issue](https://github.com/tu-usuario/pwa_caja/issues) en el repositorio.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
