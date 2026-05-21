# Reporte de Pruebas Cypress - LinguaPlay

**Fecha:** 2026-05-18  
**Navegador:** Chrome 146 (headless)  
**Versión Cypress:** 15.15.0  
**URL Base:** http://localhost:8081  
**Duración Total:** 2m 36s  

---

## Resumen

| Métrica | Valor |
|---|---|
| **Total de Pruebas** | 24 |
| **Aprobadas** | 24 ✅ |
| **Fallidas** | 0 |
| **Omitidas** | 0 |
| **Tasa de Éxito** | 100% |

---

## Resultados por Archivo

### 1. Flujo de Inicio de Sesión (`login.cy.js`)
| # | Prueba | Estado | Duración |
|---|---|---|---|
| 1 | Ver los campos del formulario de login | ✅ | 2.4s |
| 2 | Ver el mensaje de error cuando los campos están vacíos | ✅ | 1.8s |
| 3 | Ver el formulario de registro | ✅ | 1.7s |
| 4 | Ver el formulario de login (credenciales válidas) | ✅ | 4.8s |
| 5 | Inicio de sesión exitoso tras crear cuenta nueva | ✅ | 8.6s |
| **Total** | **5/5** | **✅** | **19s** |

### 2. Flujo de Navegación (`navigation.cy.js`)
| # | Prueba | Estado | Duración |
|---|---|---|---|
| 1 | Mostrar pantalla de inicio con opciones de navegación | ✅ | 6.9s |
| 2 | Navegar al selector de componentes desde inicio | ✅ | 6.3s |
| 3 | Navegar al selector de niveles al elegir componente | ✅ | 6.3s |
| 4 | Navegar a actividad al seleccionar nivel | ✅ | 6.3s |
| 5 | Regresar de actividad a niveles | ✅ | 5.5s |
| 6 | Regresar de niveles a componentes | ✅ | 4.8s |
| **Total** | **6/6** | **✅** | **36s** |

### 3. Flujo de Actividades (`activity.cy.js`)
| # | Prueba | Estado | Duración |
|---|---|---|---|
| 1 | Mostrar actividad con instrucción y pregunta | ✅ | 8.4s |
| 2 | Mostrar encabezado con progreso y temporizador | ✅ | 6.2s |
| 3 | Mostrar error al enviar sin seleccionar respuesta | ✅ | 6.5s |
| 4 | Mostrar tarjeta de resultado tras respuesta correcta | ✅ | 6.7s |
| 5 | Mostrar overlay de celebración tras respuesta correcta | ✅ | 7.9s |
| 6 | Botón de continuar deshabilitado durante celebración | ✅ | 9.3s |
| 7 | Mostrar opción de reintentar tras respuesta incorrecta | ✅ | 6.9s |
| 8 | Reiniciar actividad tras reintentar respuesta incorrecta | ✅ | 9.5s |
| **Total** | **8/8** | **✅** | **1m 2s** |

### 4. Temporizador y Estrellas (`timer-stars.cy.js`)
| # | Prueba | Estado | Duración |
|---|---|---|---|
| 1 | Mostrar barra de temporizador en encabezado | ✅ | 5.5s |
| 2 | Mostrar tiempo transcurrido incrementando | ✅ | 6.7s |
| 3 | Mostrar estrellas en overlay de celebración (respuesta correcta) | ✅ | 5.6s |
| 4 | Mostrar estrellas ganadas en overlay de celebración | ✅ | 6.0s |
| 5 | Navegar al selector de niveles tras completar todas las actividades | ✅ | 13.4s |
| **Total** | **5/5** | **✅** | **37s** |

---

## Cobertura por Funcionalidad

| Funcionalidad | Pruebas | Estado |
|---|---|---|
| Autenticación (Inicio de sesión / Registro) | 5 | ✅ 100% |
| Navegación (Inicio → Componente → Nivel → Actividad) | 6 | ✅ 100% |
| Interacción con Actividades | 8 | ✅ 100% |
| Sistema de Temporizador y Estrellas | 5 | ✅ 100% |

---

## Estrategia de Pruebas

- **Credenciales Dinámicas:** Cada prueba crea un usuario único (`test{timestamp}@cypress.com`) para evitar conflictos entre ejecuciones.
- **Manejo de Auto-cierre:** Las pruebas consideran la auto-navegación del overlay de celebración (2.9 segundos).
- **Opciones por Actividad:** Las pruebas usan las respuestas correctas según cada actividad (`Mano` para la primera, `No, diferente` para la segunda).

---

## Cómo Ejecutar

```bash
# Abrir interfaz de Cypress
npm run cypress:open

# Ejecutar todas las pruebas en modo headless
npm run cypress:run

# Ejecutar un archivo específico
npx cypress run --spec "cypress/e2e/login.cy.js"
```
