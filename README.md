# Mi Vaca - Aplicación para Compartir Cuentas de Restaurante

Una aplicación web construida con Next.js y React para compartir cuentas de restaurante con amigos. ¡Perfecta para cenas en grupo donde todos quieren dividir la cuenta de manera justa!

🎥 **Video tutorial**: [Ver en YouTube](https://www.youtube.com/watch?v=kh_TDaQsV8U)

🌐 **Versión en vivo**: [mivaca.onrender.com](https://mivaca.onrender.com)

## Características

- **Panel del Vaquer@**: Crea una nueva "vaca" (sesión para compartir cuenta), visualiza productos agregados por amigos en tiempo real y comparte códigos QR de pago
- **Modo Comensal**: Únete a una vaca mediante código QR, agrega productos que estás consumiendo y visualiza el QR de pago cuando esté listo
- **Actualizaciones en Tiempo Real**: Ve productos siendo agregados mientras suceden (actualiza cada 2 segundos)
- **Cálculo Automático de Propina**: Se agrega automáticamente una propina del 10% al total
- **Integración de Códigos QR**: Genera códigos QR para unirse y sube códigos QR para pagos
- **Gestión de Pagos**: Registra pagos realizados por comensales y visualiza el total recaudado vs. el total esperado
- **Llave Bre-B**: Soporte para llaves bancarias del sistema colombiano Bre-B
- **Cierre de Cuenta**: Distribución automática de diferencias entre el valor del restaurante y el calculado por la app
- **Exportación PDF**: Genera informes completos en PDF de la sesión

## Comenzando

### Requisitos Previos

- Node.js 18+ instalado
- npm o yarn como gestor de paquetes

### Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Cómo Usar

### Como Vaquer@ (Organizador)

1. Ve a la página principal e ingresa un nombre para tu vaca (ej: "Cena en el restaurante")
2. Ingresa tu nombre como vaquer@
3. Haz clic en "Crear Nueva Vaca"
4. Serás redirigido a tu panel donde puedes:
   - Ver el código QR para compartir con amigos
   - Agregar productos colectivos (distribuidos entre todos o asignados a un comensal)
   - Ver productos agregados por comensales
   - Ver productos agregados por ti (con opción de eliminarlos)
   - Ver los totales con propina del 10% automática
   - Cerrar la cuenta del restaurante y distribuir diferencias
   - Subir un código QR de pago cuando esté listo
   - Agregar la llave Bre-B para pagos bancarios
   - Ver pagos recibidos y el estado de recaudación
   - Exportar un informe completo en PDF

### Como Comensal (Amigo)

1. Escanea el código QR compartido por el vaquer@
2. Ingresa tu nombre para unirte a la vaca
3. Agrega productos que estás consumiendo:
   - Nombre del producto
   - Precio del menú
   - Cantidad
4. Puedes agregar múltiples productos
5. Puedes eliminar productos que agregaste
6. Cuando el vaquer@ comparta el QR de pago o la llave Bre-B, lo verás en tu pantalla
7. Registra tu pago cuando hayas realizado la consignación

## Stack Tecnológico

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Seguridad de tipos
- **Tailwind CSS** - Estilos
- **qrcode.react** - Generación de códigos QR
- **UUID** - Generación de IDs únicos
- **jsPDF** - Generación de PDFs
- **canvas-confetti** - Animaciones de celebración

## Estructura del Proyecto

```
/app
  /api          - Rutas API
  /vaquero      - Páginas del panel del vaquer@
  /comensal     - Páginas de comensales
  page.tsx      - Página principal
/lib            - Almacén y utilidades
/types          - Definiciones de tipos TypeScript
```

## Notas

- La aplicación usa un almacén en memoria por simplicidad. En producción, querrás usar una base de datos (PostgreSQL, MongoDB, etc.)
- Las actualizaciones en tiempo real usan polling (cada 2 segundos). Para mejor rendimiento, considera usar WebSockets o Server-Sent Events
- La autenticación está simplificada para MVP. En producción, agrega autenticación de usuarios adecuada
- Los valores monetarios se redondean al entero más cercano para facilitar el cálculo

## Despliegue

La aplicación incluye un Dockerfile para despliegue en contenedores. Consulta `DEPLOYMENT.md` para instrucciones detalladas de despliegue en Render u otras plataformas.

🧑‍💻 **Cómo fue desarrollada**: Esta app fue desarrollada usando *Vibe Coding* en Cursor, con ayuda de modelos de IA generativa (LLMs) para ideación, iteración de UI y generación/refactor de código, además de pruebas y ajustes manuales.

## Licencia

**Licencia Propietaria** - Copyright (c) 2026 Jorge I. Zuluaga, Dr. Z

Este software es propiedad privada y confidencial. Todos los derechos reservados.

**Restricciones principales:**
- ❌ **Sin uso comercial**: No se permite el uso comercial sin permiso escrito explícito
- ❌ **Sin redistribución**: No se puede redistribuir, copiar, modificar o compartir sin permiso escrito explícito
- ❌ **Sin obras derivadas**: No se pueden crear obras derivadas sin permiso escrito explícito
- ✅ **Uso personal únicamente**: El software se proporciona solo para uso personal y no comercial

**Permisos:**
Se otorga una licencia limitada, no exclusiva, no transferible y revocable para usar el Software únicamente con fines personales y no comerciales, sujeto a las restricciones anteriores.

Para consultas sobre licencias, permisos de uso comercial o redistribución, contacta a:
- **Jorge I. Zuluaga, Dr. Z**
- Email: zuluagajorge@gmail.com

Ver archivo `LICENSE` para los términos completos de la licencia.
