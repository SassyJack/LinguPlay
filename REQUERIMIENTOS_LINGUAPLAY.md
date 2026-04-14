# Requerimientos de LinguaPlay

## 1. Descripcion general

`LinguaPlay` es una aplicacion movil multiplataforma orientada al fortalecimiento de los componentes del lenguaje en ninos entre 7 y 9 anos, desde un enfoque fonoaudiologico y gamificado. El sistema organiza la experiencia en modulos por componente del lenguaje, niveles progresivos y actividades interactivas con retroalimentacion inmediata.

## 2. Requerimientos funcionales

### RF-01. Navegacion por componentes del lenguaje

El sistema debe permitir al usuario ingresar a los modulos de:

- Fonologico
- Semantico
- Sintactico
- Pragmatico

Como se cumple:

- La pantalla principal muestra los cuatro componentes como tarjetas seleccionables.
- Cada tarjeta permite entrar al modulo correspondiente.

## RF-02. Seleccion de nivel por componente

El sistema debe permitir seleccionar tres niveles de dificultad por cada componente:

- Nivel 1: basico
- Nivel 2: intermedio
- Nivel 3: avanzado

Como se cumple:

- Cada componente presenta tres niveles.
- Cada nivel esta asociado a una edad objetivo: 7, 8 y 9 anos.

## RF-03. Disponibilidad de actividades por nivel

El sistema debe incluir dos actividades por cada nivel de cada componente.

Como se cumple:

- El contenido del juego se organiza en 4 componentes x 3 niveles x 2 actividades.
- El prototipo incluye 24 actividades estructuradas a partir de la informacion del documento base.

## RF-04. Presentacion de instrucciones claras

Cada actividad debe mostrar una instruccion breve, clara y comprensible para la edad del usuario.

Como se cumple:

- Cada actividad tiene un campo de instruccion visible en pantalla.
- Las instrucciones usan frases cortas y directas.

## RF-05. Ejecucion de tareas interactivas

El sistema debe permitir actividades interactivas como:

- Seleccion de respuestas
- Ordenamiento de palabras o silabas
- Completar estructuras

Como se cumple:

- El prototipo implementa actividades tipo `choice` para seleccion.
- El prototipo implementa actividades tipo `order` para secuencias y organizacion.

## RF-06. Validacion de respuestas

Cada actividad debe tener un mecanismo para validar la respuesta del usuario.

Como se cumple:

- Cada actividad incluye el boton `Verificar`.
- El sistema evalua si la respuesta es correcta o incorrecta.

## RF-07. Retroalimentacion inmediata

El sistema debe informar de manera inmediata si la respuesta fue correcta o incorrecta.

Como se cumple:

- Se muestran mensajes de exito, error o advertencia.
- La retroalimentacion se presenta justo despues de validar.

## RF-08. Refuerzo positivo

El sistema debe reforzar positivamente el desempeno del usuario mediante elementos de juego.

Como se cumple:

- El prototipo asigna puntos por actividad superada.
- Se otorgan estrellas.
- Se muestra avance y logros desbloqueados.

## RF-09. Visualizacion del progreso

El sistema debe mostrar el avance del usuario de manera visible.

Como se cumple:

- Se muestra progreso total de actividades completadas.
- Se presenta puntaje acumulado, cantidad de estrellas, racha y logros.
- Cada nivel indica cuantas actividades han sido completadas.

## RF-10. Apoyo visual o auditivo

Cada actividad debe ofrecer apoyo visual o auditivo cuando sea necesario.

Como se cumple:

- Cada actividad incluye un boton para mostrar apoyo auditivo simulado.
- El apoyo se expresa mediante una pista o audioPrompt visible.

## RF-11. Adaptacion basica al desempeno

El sistema debe responder al desempeno del usuario ofreciendo ayuda adicional cuando presente dificultades.

Como se cumple:

- Si el usuario falla o acumula errores, se activa un bloque de apoyo adaptativo.
- El sistema muestra pistas terapeuticas para facilitar el nuevo intento.

## RF-12. Navegacion intuitiva

El usuario debe poder desplazarse con facilidad entre inicio, componente, nivel y actividad.

Como se cumple:

- El prototipo incluye botones para volver al inicio, volver al nivel y avanzar a la siguiente actividad.
- La estructura de navegacion sigue una ruta simple y predecible.

## RF-13. Enfoque terapeutico gamificado

El sistema debe combinar actividades de intervencion del lenguaje con dinamicas de juego.

Como se cumple:

- Las actividades responden a objetivos clinicos por componente.
- El sistema integra puntos, estrellas, logros, progresion y mensajes motivadores.

## 3. Requerimientos no funcionales

### RNF-01. Multiplataforma

La aplicacion debe poder ejecutarse en Android, iOS y web.

Como se cumple:

- El proyecto fue configurado con Expo.
- Se verifico exportacion web satisfactoria.

## RNF-02. Usabilidad infantil

La interfaz debe ser intuitiva, simple y adecuada para ninos de 7 a 9 anos.

Como se cumple:

- Se usan tarjetas grandes, botones visibles y textos cortos.
- La navegacion evita menus complejos.

## RNF-03. Accesibilidad cognitiva

La aplicacion debe minimizar la carga textual compleja y apoyar la comprension.

Como se cumple:

- Las instrucciones son breves.
- Se incorporan ayudas visuales y apoyos auditivos simulados.
- Las actividades se presentan paso a paso.

## RNF-04. Atractivo visual

La interfaz debe ser visualmente atractiva y motivadora para publico infantil.

Como se cumple:

- Se usan colores llamativos, tarjetas redondeadas y elementos de progreso.
- La presentacion incorpora una estetica ludica con insignias, recompensas y modulos tematicos.

## RNF-05. Rendimiento adecuado

La aplicacion debe responder de manera fluida en la navegacion y validacion de actividades.

Como se cumple:

- El prototipo maneja estado local ligero.
- La logica de validacion es simple e inmediata.

## RNF-06. Mantenibilidad

La solucion debe permitir agregar nuevas actividades o modificar contenido con facilidad.

Como se cumple:

- Las actividades estan centralizadas en un archivo de datos.
- La interfaz reutiliza los mismos componentes logicos para distintos tipos de ejercicio.

## RNF-07. Escalabilidad de contenido

El sistema debe permitir ampliar modulos, niveles o actividades en futuras versiones.

Como se cumple:

- La estructura de datos soporta nuevos componentes, niveles y actividades.
- El flujo de la app se genera en funcion del contenido definido.

## RNF-08. Disponibilidad local del prototipo

El sistema debe poder ejecutarse localmente para pruebas y demostraciones.

Como se cumple:

- El proyecto incluye configuracion, dependencias y scripts de ejecucion.
- El build web fue exportado correctamente en la carpeta `dist`.

## 4. Trazabilidad resumida

| Codigo | Requerimiento                  | Estado en el prototipo |
| ------ | ------------------------------ | ---------------------- |
| RF-01  | Navegacion por componentes     | Cumplido               |
| RF-02  | Seleccion de niveles           | Cumplido               |
| RF-03  | Dos actividades por nivel      | Cumplido               |
| RF-04  | Instrucciones claras           | Cumplido               |
| RF-05  | Tareas interactivas            | Cumplido               |
| RF-06  | Validacion de respuestas       | Cumplido               |
| RF-07  | Retroalimentacion inmediata    | Cumplido               |
| RF-08  | Refuerzo positivo              | Cumplido               |
| RF-09  | Visualizacion del progreso     | Cumplido               |
| RF-10  | Apoyo visual o auditivo        | Cumplido               |
| RF-11  | Adaptacion basica              | Cumplido parcialmente  |
| RF-12  | Navegacion intuitiva           | Cumplido               |
| RF-13  | Enfoque terapeutico gamificado | Cumplido               |
| RNF-01 | Multiplataforma                | Cumplido               |
| RNF-02 | Usabilidad infantil            | Cumplido               |
| RNF-03 | Accesibilidad cognitiva        | Cumplido               |
| RNF-04 | Atractivo visual               | Cumplido               |
| RNF-05 | Rendimiento                    | Cumplido               |
| RNF-06 | Mantenibilidad                 | Cumplido               |
| RNF-07 | Escalabilidad                  | Cumplido               |
| RNF-08 | Disponibilidad local           | Cumplido               |

## 5. Observaciones

- La adaptabilidad segun desempeno esta implementada de forma basica mediante ayudas contextuales.
- Aun no se incluye persistencia real de usuarios ni almacenamiento permanente del progreso.
- El apoyo auditivo actual es simulado mediante texto; puede evolucionar a audio grabado o sintesis de voz.
