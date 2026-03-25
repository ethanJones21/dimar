# Spec: Búsqueda por voz

## Estado
Pendiente — implementación básica ya existe en `components/Navbar.tsx` usando Web Speech API nativa del navegador.

## Problema actual
La implementación actual solo funciona en **Chrome y Edge**. Firefox y Safari no soportan `SpeechRecognition` sin flags experimentales, por lo que ~30% de usuarios no pueden usar la función.

## Objetivo
Búsqueda por voz funcional en todos los navegadores modernos, con buena UX y feedback visual claro.

---

## Solución propuesta

### Opción A — Web Speech API + fallback (recomendada)
Mantener la Web Speech API para Chrome/Edge y agregar un fallback con un servicio externo (Whisper API de OpenAI o AssemblyAI) para otros navegadores.

**Flujo:**
1. Usuario hace clic en 🎤
2. Se detecta si el navegador soporta `SpeechRecognition`
3. Si sí → usar Web Speech API directamente (gratis, sin latencia)
4. Si no → grabar audio con `MediaRecorder` y enviar a API externa para transcribir
5. Resultado se rellena en el input y se ejecuta la búsqueda

### Opción B — Siempre usar Whisper API
Usar `MediaRecorder` + Whisper API en todos los casos para consistencia.
- Mayor latencia (~1-2s)
- Costo por uso (Whisper: $0.006/min)
- Mejor precisión en español latinoamericano

---

## UX requerida

| Estado | Visual |
|---|---|
| Inactivo | Ícono 🎤 gris |
| Escuchando | Ícono 🎤 rojo + `animate-pulse` + tooltip "Escuchando..." |
| Procesando | Spinner en lugar del ícono |
| Error de permisos | Toast: "Permite el acceso al micrófono" |
| No soportado | Toast: "Tu navegador no soporta búsqueda por voz" |
| Éxito | Input relleno + navegación automática a `/products?q=...` |

## Componente a crear
Extraer la lógica de voz de `Navbar.tsx` a un hook reutilizable:

```ts
// hooks/useVoiceSearch.ts
export function useVoiceSearch(onResult: (transcript: string) => void) {
  // retorna: { listening, supported, start, stop }
}
```

## Archivos a modificar
- `components/Navbar.tsx` — usar el hook en lugar de lógica inline
- `hooks/useVoiceSearch.ts` — crear hook
- `app/api/transcribe/route.ts` — crear si se elige Opción A/B con Whisper

## Variables de entorno necesarias (solo Opción A/B con Whisper)
```
OPENAI_API_KEY=sk-...
```

## Notas
- Idioma configurado: `es-PE` (español peruano) — ajustar según mercado objetivo
- Pedir permisos de micrófono solo al hacer clic, nunca al cargar la página
- Cancelar la escucha si el usuario hace clic en otro lugar
