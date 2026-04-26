# CLAUDE.md — Reglas y contexto del proyecto Dimar

## Reglas de trabajo

### 1. No programar sin contexto
- ANTES de escribir código: lee los archivos relevantes, revisa git log, entiende la arquitectura.
- Si no tienes contexto suficiente, pregunta.

### 2. Respuestas cortas
- Responde en 1-3 oraciones. Sin preámbulos, sin resumen final.
- No repitas lo que el usuario dijo. No expliques lo obvio.
- Código habla por sí mismo: no narres cada línea que escribes.

### 3. No reescribir archivos completos
- Usa Edit (reemplazo parcial), NUNCA Write para archivos existentes salvo que el cambio sea >80% del archivo.
- Cambia solo lo necesario. No "limpies" código alrededor del cambio.

### 4. No releer archivos ya leídos
- Si ya leíste un archivo en esta conversación, no lo vuelvas a leer salvo que haya cambiado.

### 5. Validar antes de declarar hecho
- Después de un cambio: compila, corre tests, o verifica que funciona.
- Nunca digas "listo" sin evidencia de que funciona.

### 6. Cero charla aduladora
- No digas "Excelente pregunta", "Gran idea", "Perfecto", etc.
- Ve directo al trabajo.

### 7. Soluciones simples
- Implementa lo mínimo que resuelve el problema. Nada más.
- No agregues abstracciones, helpers, tipos, validaciones, ni features que no se pidieron.
- 3 líneas repetidas > 1 abstracción prematura.

### 8. No pelear con el usuario
- Si el usuario dice "hazlo así", hazlo así. No debatas salvo riesgo real de seguridad o pérdida de datos.
- Si discrepas, menciona tu concern en 1 oración y procede.

### 9. Leer solo lo necesario
- No leas archivos completos si solo necesitas una sección. Usa offset y limit.
- Si sabes la ruta exacta, usa Read directo. No hagas Glob + Grep + Read cuando Read basta.

### 10. No narrar el plan antes de ejecutar
- No digas "Voy a leer el archivo, luego modificaré...". Solo hazlo.

### 11. Paralelizar tool calls
- Si necesitas leer 3 archivos independientes, léelos en un solo mensaje.
- Menos roundtrips = menos tokens de contexto acumulado.

### 12. No duplicar código en la respuesta
- Si ya editaste un archivo, no copies el resultado en tu respuesta. El usuario lo ve en el diff.

### 13. No usar Agent cuando Grep/Read basta
- Agent solo para búsquedas amplias o tareas complejas multi-paso.
- Para buscar una función o archivo específico, usa Grep o Glob directo.

---

## Skills disponibles

- **shadcn** — gestión de componentes shadcn/ui
- **frontend-design** — interfaces web de producción con alta calidad de diseño
- **ui-ux-pro-max** — diseño UI/UX: 67 estilos, 96 paletas, stacks (React, Next.js, Tailwind, shadcn/ui)
- **vercel-react-best-practices** — optimización React/Next.js según guías de Vercel Engineering
- **supabase-postgres-best-practices** — optimización de queries y esquemas Postgres
- **browser-use / agent-browser / playwright-cli** — automatización de navegador, testing, scraping
- **changelog-generator** — genera changelogs desde git commits
- **ecommerce-seo-audit** — auditoría SEO para tiendas online
- **security-review** — revisión de seguridad de cambios en la rama actual
- **review** — revisión de pull requests
- **init** — inicializa CLAUDE.md con documentación del codebase
- **claude-api** — desarrollo con la API de Anthropic / SDK
- **update-config** — configura hooks y permisos en settings.json
- **fewer-permission-prompts** — reduce prompts de permisos analizando transcripts
- **simplify** — revisa código modificado y elimina redundancias
- **find-skills** — descubre e instala nuevos skills disponibles
- **ai-image-generation** — genera imágenes con FLUX, Gemini, Grok, Seedream y otros modelos
- **file-organizer** — organiza archivos y carpetas, detecta duplicados, limpia el workspace
- **footer-generator** — diseña, optimiza y audita footers de sitios web
- **skill-creator** — crea, modifica y evalúa el rendimiento de nuevos skills
- **loop** — ejecuta un prompt o comando de forma recurrente a intervalos definidos
- **schedule** — agenda tareas automatizadas con cron para agentes remotos
- **keybindings-help** — personaliza atajos de teclado en ~/.claude/keybindings.json
