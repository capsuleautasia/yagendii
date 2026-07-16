# Yagendii — React + Vite + Supabase

Sistema mobile-first para administrar ventas y posibles ventas.

## Incluye

- Registro e inicio de sesión con Supabase Auth.
- CRUD completo de ventas.
- CRUD completo de posibles ventas.
- Conversión transaccional de una posible venta a venta.
- Búsqueda por cliente, número, teléfono u observación.
- Diseño responsive mobile-first.
- RLS: cada usuario solo puede ver y modificar sus propios registros.
- Número de cliente almacenado como texto para mantener ceros iniciales.

## 1. Requisitos

- Node.js compatible con Vite 8.
- Una cuenta y proyecto en Supabase.

## 2. Configurar Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**.
3. Copia todo el archivo `supabase/schema.sql`.
4. Presiona **Run**.
5. Ve a **Authentication > Providers > Email** y mantén Email habilitado.
6. Para pruebas rápidas puedes desactivar temporalmente la confirmación de correo. En producción es mejor mantenerla activa.

## 3. Variables de entorno

Copia `.env.example` como `.env.local` y completa:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
```

Las credenciales están en Supabase, en el panel **Connect** del proyecto.

Nunca coloques la `service_role` en el frontend.

## 4. Ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## 5. Probar producción

```bash
npm run build
npm run preview
```

Vite genera la carpeta `dist`.

## Flujo principal

1. Crear cuenta o iniciar sesión.
2. Entrar en **Posibles ventas**.
3. Agendar cliente.
4. Editar, llamar o convertir.
5. Al convertir, la función SQL inserta la venta y elimina la oportunidad dentro de una sola transacción.

## Nota sobre npm

Este paquete usa el registro público oficial de npm. Si npm intenta conectarse a otro registro, ejecuta:

```bash
npm config set registry https://registry.npmjs.org/
npm cache verify
npm install
```
