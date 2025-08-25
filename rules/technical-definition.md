---
trigger: always_on
---

# Definición técnica

- Stack tecnologico
  - Nest.js (front+back)
  - Supabase (para el login y db postgres)
  - tailwind + **Preline UI**

- Font-family: Poppins
- Colores

```css
/* CSS HEX */
--argentinian-blue: #5aa9e6ff;
--cinereous: #987d7cff;
--black: #020202ff;
--fern-green: #50723cff;
--light-green: #a1e887ff;
```

```css
/* CSS HSL */
--argentinian-blue: hsla(206, 74%, 63%, 1);
--cinereous: hsla(2, 12%, 54%, 1);
--black: hsla(0, 0%, 1%, 1);
--fern-green: hsla(98, 31%, 34%, 1);
--light-green: hsla(104, 68%, 72%, 1);
```

```jsx
/* SCSS HEX */
$argentinian-blue: #5aa9e6ff;
$cinereous: #987d7cff;
$black: #020202ff;
$fern-green: #50723cff;
$light-green: #a1e887ff;
```

```jsx
/* SCSS HSL */
$argentinian-blue: hsla(206, 74%, 63%, 1);
$cinereous: hsla(2, 12%, 54%, 1);
$black: hsla(0, 0%, 1%, 1);
$fern-green: hsla(98, 31%, 34%, 1);
$light-green: hsla(104, 68%, 72%, 1);
```

```jsx
/* SCSS RGB */
$argentinian-blue: rgba(90, 169, 230, 1);
$cinereous: rgba(152, 125, 124, 1);
$black: rgba(2, 2, 2, 1);
$fern-green: rgba(80, 114, 60, 1);
$light-green: rgba(161, 232, 135, 1);
```

```jsx
/* SCSS Gradient */
$gradient-top: linear-gradient(0deg, #5aa9e6ff, #987d7cff, #020202ff, #50723cff, #a1e887ff);
$gradient-right: linear-gradient(90deg, #5aa9e6ff, #987d7cff, #020202ff, #50723cff, #a1e887ff);
$gradient-bottom: linear-gradient(180deg, #5aa9e6ff, #987d7cff, #020202ff, #50723cff, #a1e887ff);
$gradient-left: linear-gradient(270deg, #5aa9e6ff, #987d7cff, #020202ff, #50723cff, #a1e887ff);
$gradient-top-right: linear-gradient(45deg, #5aa9e6ff, #987d7cff, #020202ff, #50723cff, #a1e887ff);
$gradient-bottom-right: linear-gradient(135deg, #5aa9e6ff, #987d7cff, #020202ff, #50723cff, #a1e887ff);
$gradient-top-left: linear-gradient(225deg, #5aa9e6ff, #987d7cff, #020202ff, #50723cff, #a1e887ff);
$gradient-bottom-left: linear-gradient(315deg, #5aa9e6ff, #987d7cff, #020202ff, #50723cff, #a1e887ff);
$gradient-radial: radial-gradient(#5aa9e6ff, #987d7cff, #020202ff, #50723cff, #a1e887ff);
```

- Entidades

A continuación, se definen las entidades principales, sus atributos y las relaciones entre ellas.

### Modelo de Entidades y Atributos

### 1. Entidad: `Usuario`

Almacena la información de las personas que se registran en la plataforma, ya sean jugadores o administradores de complejos.

- **`id`** (PK, Entero, Autoincremental): Identificador único para cada usuario.
- **`nombre`** (Texto): Nombre del usuario.
- **`apellido`** (Texto): Apellido del usuario.
- **`email`** (Texto, Único): Correo electrónico para el inicio de sesión y comunicaciones. Debe ser único.
- **`password_hash`** (Texto): Contraseña del usuario almacenada de forma segura (hasheada).
- **`telefono`** (Texto, Opcional): Número de contacto.
- **`rol`** (Enum/Texto): Define el tipo de usuario ('jugador', 'admin_complejo'). Es crucial para gestionar permisos.
- **`fecha_registro`** (Fecha y Hora): Cuándo se creó la cuenta.

### 2. Entidad: `Complejo`

Representa el lugar físico que cuenta con una o más canchas para alquilar.

- **`id`** (PK, Entero, Autoincremental): Identificador único del complejo.
- **`id_usuario_propietario`** (FK, Entero): Referencia al `Usuario` que administra este complejo.
- **`nombre`** (Texto): Nombre comercial del complejo (ej: "La Diez Fútbol").
- **`direccion`** (Texto): Dirección física del complejo.
- **`ciudad`** (Texto): Ciudad donde se encuentra.
- **`latitud`** (Decimal): Coordenada geográfica para la ubicación en el mapa.
- **`longitud`** (Decimal): Coordenada geográfica para la ubicación en el mapa.
- **`descripcion`** (Texto largo): Descripción de las instalaciones, ambiente, etc.
- **`telefono_contacto`** (Texto): Teléfono público del complejo.
- **`horario_apertura`** (Hora): Hora a la que abre el complejo.
- **`horario_cierre`** (Hora): Hora a la que cierra el complejo.

### 3. Entidad: `Cancha`

Cada una de las canchas específicas que pertenecen a un complejo.

- **`id`** (PK, Entero, Autoincremental): Identificador único de la cancha.
- **`id_complejo`** (FK, Entero): Referencia al `Complejo` al que pertenece.
- **`nombre`** (Texto): Nombre o número que identifica a la cancha dentro del complejo (ej: "Cancha 3", "Cancha Central").
- **`tipo_futbol`** (Enum/Entero): Tipo de fútbol (5, 7, 8, 11).
- **`tipo_superficie`** (Enum/Texto): Tipo de césped ("sintético", "natural", "cemento").
- **`es_techada`** (Booleano): Verdadero o falso si la cancha es techada.
- **`precio_hora`** (Decimal): Costo base del alquiler por hora.
- **`fotos`** (JSON/Texto): Una lista de URLs de las imágenes de la cancha.

### 4. Entidad: `Reserva`

El corazón de la aplicación. Representa el alquiler de una cancha por un usuario en un horario específico.

- **`id`** (PK, Entero, Autoincremental): Identificador único de la reserva.
- **`id_usuario`** (FK, Entero): Referencia al `Usuario` que realizó la reserva.
- **`id_cancha`** (FK, Entero): Referencia a la `Cancha` que fue reservada.
- **`fecha_hora_inicio`** (Fecha y Hora): Momento exacto en que comienza el turno.
- **`fecha_hora_fin`** (Fecha y Hora): Momento exacto en que finaliza el turno.
- **`estado`** (Enum/Texto): Estado actual de la reserva ("pendiente_pago", "confirmada", "cancelada", "completada").
- **`precio_total`** (Decimal): Precio final pagado, podría variar del precio base por promociones o precios dinámicos.
- **`fecha_creacion`** (Fecha y Hora): Cuándo se solicitó la reserva.

### 5. Entidad: `Pago`

Registra la información de la transacción financiera asociada a una reserva.

- **`id`** (PK, Entero, Autoincremental): Identificador único del pago.
- **`id_reserva`** (FK, Entero): Referencia a la `Reserva` que se está pagando.
- **`monto`** (Decimal): Cantidad de dinero abonada.
- **`metodo_pago`** (Enum/Texto): Método utilizado ("Mercado Pago", "efectivo").
- **`estado_pago`** (Enum/Texto): Estado de la transacción ("aprobado", "rechazado", "pendiente").
- **`id_transaccion_externa`** (Texto, Opcional): ID de la transacción en la pasarela de pago (ej: ID de Mercado Pago).
- **`fecha_pago`** (Fecha y Hora): Cuándo se efectuó o registró el pago.

### 6. Entidad: `Reseña`

Permite a los usuarios calificar y dejar comentarios sobre los complejos que visitaron.

- **`id`** (PK, Entero, Autoincremental): Identificador único de la reseña.
- **`id_usuario`** (FK, Entero): `Usuario` que escribe la reseña.
- **`id_complejo`** (FK, Entero): `Complejo` que está siendo calificado.
- **`calificacion`** (Entero): Puntuación, por ejemplo, de 1 a 5 estrellas.
- **`comentario`** (Texto largo, Opcional): Opinión escrita del usuario.
- **`fecha_creacion`** (Fecha y Hora): Cuándo se publicó la reseña.

### 7. Entidades para Servicios (Relación Muchos a Muchos)

Para manejar servicios como "parrilla", "estacionamiento", etc., se necesita una relación de muchos a muchos entre `Complejo` y `Servicio`.

- **Entidad: `Servicio`**
  - **`id`** (PK, Entero, Autoincremental): ID del servicio.
  - **`nombre`** (Texto, Único): Nombre del servicio ("Parrilla", "Estacionamiento", "Vestuarios").
  - **`icono`** (Texto, Opcional): Referencia a un ícono para mostrar en la interfaz.
- **Entidad: `Complejo_Servicio` (Tabla Pivote)**
  - **`id_complejo`** (FK, Entero): Referencia al `Complejo`.
  - **`id_servicio`** (FK, Entero): Referencia al `Servicio`.
  - _(Clave primaria compuesta por ambos campos)_.

---

### Resumen de Relaciones Principales

- Un `Usuario` (con rol 'admin_complejo') puede ser propietario de uno o varios `Complejos`.
- Un `Complejo` tiene muchas `Canchas`.
- Una `Cancha` puede tener muchas `Reservas`, pero una `Reserva` pertenece a una sola `Cancha`.
- Un `Usuario` (con rol 'jugador') puede hacer muchas `Reservas`.
- Una `Reserva` tiene asociado un `Pago`.
- Un `Usuario` puede escribir muchas `Reseñas`, pero solo una por `Complejo`.
- Un `Complejo` puede ser calificado en muchas `Reseñas`.
- Un `Complejo` puede ofrecer muchos `Servicios`, y un `Servicio` puede estar en muchos `Complejos` (a través de la tabla `Complejo_Servicio`).

Este modelo de datos proporciona una base sólida y bien estructurada para construir todas las funcionalidades que definimos anteriormente.
