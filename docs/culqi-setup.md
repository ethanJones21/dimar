# Configurar Culqi en Dimar Store

## 1. Crear cuenta en Culqi

1. Ve a **culqi.com** y crea una cuenta de comercio
2. Completa el proceso de verificación (RUC, datos bancarios, etc.)
3. Espera la aprobación (puede tardar 1-3 días hábiles)

---

## 2. Obtener las API Keys

1. Inicia sesión en el **Panel de Culqi** → `panel.culqi.com`
2. Ve a **Desarrollo → API Keys**
3. Copia tus dos claves:

| Clave | Dónde usarla |
|---|---|
| `pk_live_xxxx` (Pública) | Frontend — `.env.local` |
| `sk_live_xxxx` (Secreta) | Backend — `.env.local` (¡nunca exponerla!) |

> Para pruebas usa las claves de **modo test** (`pk_test_xxx` / `sk_test_xxx`).
> Las tarjetas de prueba están en la sección siguiente.

---

## 3. Configurar `.env.local`

```env
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_live_TU_CLAVE_PUBLICA
CULQI_SECRET_KEY=sk_live_TU_CLAVE_SECRETA
```

Reinicia el servidor después de agregar las claves:
```bash
npm run dev
```

---

## 4. Configurar el Panel de Culqi

### 4.1 Webhook (notificaciones de pago)
1. Ve a **Desarrollo → Webhooks**
2. Agrega la URL: `https://tu-dominio.com/api/culqi/webhook`
3. Selecciona los eventos: `charge.succeeded`, `charge.failed`

> Por ahora el webhook no está implementado — el cobro se confirma sincrónicamente.
> Útil para pagos diferidos o verificación adicional en producción.

### 4.2 Datos del negocio
1. Ve a **Configuración → Negocio**
2. Completa: nombre del comercio, logo, colores — aparecerá en los vouchers de Culqi

### 4.3 Moneda
- El sistema cobra en **Soles (PEN)**
- Si necesitas USD, cambia `currency_code: "USD"` en `app/api/culqi/charge/route.ts`

---

## 5. Tarjetas de prueba (modo test)

| Tarjeta | Número | CVV | Vencimiento | Resultado |
|---|---|---|---|---|
| Visa aprobada | `4111 1111 1111 1111` | `123` | `09/25` | ✅ Aprobado |
| Mastercard aprobada | `5111 1111 1111 1118` | `123` | `06/25` | ✅ Aprobado |
| Visa declinada | `4000 0000 0000 0002` | `123` | `09/25` | ❌ Rechazada |
| Fondos insuficientes | `4000 0000 0000 9995` | `123` | `09/25` | ❌ Sin fondos |

---

## 6. Monto y centavos

Culqi maneja los montos en **centavos de sol**:

| Monto real | Enviar a Culqi |
|---|---|
| S/ 1.00 | `100` |
| S/ 10.00 | `1000` |
| S/ 249.90 | `24990` |

El código ya convierte automáticamente: `Math.round(total() * 100)`.

> **Importante:** Revisa que tus precios en Supabase estén en soles (no en centavos).
> Si el precio almacenado es `24990` y representa S/249.90, entonces el factor `* 100` está de más.
> Ajusta según cómo tengas los precios en la base de datos.

---

## 7. Ir a producción

1. Cambia las claves `pk_test_` / `sk_test_` por `pk_live_` / `sk_live_`
2. Asegúrate de tener HTTPS en producción (obligatorio para PCI)
3. Activa tu cuenta en el panel de Culqi (requiere aprobación del equipo de Culqi)
