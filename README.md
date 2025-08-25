# Canchetia - Plataforma de Reserva de Canchas de Fútbol

Una aplicación web moderna para conectar jugadores con complejos deportivos que ofrezcan canchas de fútbol en Argentina.

## 🚀 Estado del Proyecto

**Sprint 1.2 Completado** ✅

### Sprint 1.1 ✅
- ✅ Next.js 14 con TypeScript
- ✅ Tailwind CSS con colores de marca personalizados  
- ✅ Supabase configurado para autenticación y base de datos
- ✅ ESLint, Prettier y herramientas de desarrollo
- ✅ Estructura de carpetas y middleware de autenticación
- ✅ Tipos TypeScript completos basados en las entidades

### Sprint 1.2 ✅
- ✅ Esquema completo de base de datos en Supabase
- ✅ Políticas RLS (Row Level Security) configuradas
- ✅ Seeds y datos de prueba preparados
- ✅ Sistema de autenticación completo (email/password + OAuth)
- ✅ Autenticación social (Google, Facebook) configurada
- ✅ Middleware de protección de rutas con manejo de roles
- ✅ Hook personalizado useAuth para manejo de estado
- ✅ Componente ProtectedRoute para control de acceso
- ✅ Dashboard básico para administradores
- ✅ Homepage con diferenciación por roles

## 🛠️ Stack Tecnológico

- **Frontend/Backend**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS
- **Fuente**: Poppins
- **Pagos**: MercadoPago (Fase 3)
- **Mapas**: Google Maps API (Fase 2)

## 🎨 Colores de Marca

- **Azul Argentino**: `#5aa9e6` (color primario)
- **Cinereo**: `#987d7c` (secundario)
- **Verde Helecho**: `#50723c` (acento)
- **Verde Claro**: `#a1e887` (éxito/destacado)
- **Negro**: `#020202` (texto/contraste)

## 🚀 Desarrollo

### Requisitos Previos

- Node.js 18+ 
- npm
- Cuenta de Supabase (para configurar base de datos)

### Instalación

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Copia `.env.example` a `.env.local`
   - Completa las variables de Supabase

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con Turbopack
npm run build        # Build de producción
npm run start        # Servidor de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de ESLint automáticamente
npm run format       # Formatear código con Prettier
npm run type-check   # Verificar tipos TypeScript
```

## 📋 Próximos Pasos (Sprint 2.1)

- [ ] Implementar formularios de registro/login con React Hook Form
- [ ] Agregar verificación de email
- [ ] Crear página de recuperación de contraseña
- [ ] Mejorar validaciones de formularios
- [ ] Implementar notificaciones de éxito/error

## 📚 Documentación

- [Definición Funcional](./rules/functional-definition.md)
- [Definición Técnica](./rules/technical-definition.md) 
- [Plan de Desarrollo](./planning.md)
- [Guía para Claude Code](./CLAUDE.md)

## 🗃️ Estructura del Proyecto

Ver [CLAUDE.md](./CLAUDE.md) para una descripción completa de la arquitectura y estructura de archivos.

## 📞 Soporte

Para reportar problemas o solicitar funcionalidades, crea un issue en el repositorio.