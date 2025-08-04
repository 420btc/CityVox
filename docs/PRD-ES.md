# Sistema de Colocación de Ciudad Cartoon 2.5D - Documento de Requisitos del Producto (PRD)

> por: hexianWeb

## 1. Resumen y Objetivos del Proyecto

**Nombre del Proyecto:** Sistema de Colocación de Ciudad Cartoon 2.5D

**Objetivos del Proyecto:**
- Utilizar Three.js para construir un juego de simulación y gestión de ciudad 2.5D de estilo cartoon
- Los jugadores gestionan y expanden su propia ciudad colocando, moviendo y eliminando edificios y carreteras
- A través de la producción de edificios y gestión de recursos, expandir continuamente el terreno y buscar una mayor escala urbana
- Proporcionar funcionalidad de tabla de clasificación para incentivar la competencia entre jugadores y la optimización continua del diseño urbano

## 2. Audiencia Objetivo

- Jugadores que disfrutan de juegos de simulación, gestión y construcción de ciudades
- Usuarios interesados en juegos web creativos con WebGL y Three.js
- Usuarios que buscan experiencias estratégicas ligeras y casuales
- **Principalmente dirigido a usuarios de escritorio, con compatibilidad móvil**

## 3. Funcionalidades y Características Principales

### 3.1 Jugabilidad Básica y Construcción de Ciudad 【Mayormente Completado】
- **Ciudad Inicial y Terreno:** Los jugadores comienzan con un terreno vacío de 16x16 casillas y fondos iniciales【Completado】
- **Sistema de Edificios:** Puede colocar, mover y eliminar varios tipos de edificios【Completado】
- **Clasificación de Edificios (RCI & ESG)**：Se han implementado las principales categorías y algunos edificios【Completado】
  - **Categoría RCI**：
    - Residencial: Aumenta población/producción básica
    - Comercial: Aumenta producción de monedas
    - Industrial: Aumenta producción industrial
  - **Categoría ESG**：
    - Ambiental: Mejora la estética urbana y ecología
    - Social: Mejora la felicidad de los residentes, educación, atención médica, etc.
    - Gobernanza: Mejora la gestión urbana y eficiencia de políticas
- **Ejemplos de Clasificación de Edificios:**
  - Residencial: Edificios residenciales, apartamentos, etc.
  - Comercial: Tiendas, supermercados, etc.
  - Industrial: Fábricas, plantas de energía, etc.
  - Ambiental: Parques, áreas verdes, etc.
  - Social: Escuelas, hospitales, etc.
  - Gobernanza: Ayuntamiento, estación de policía, etc.
- **Sistema de Carreteras:** Puede colocar carreteras, conectar edificios, afectar el diseño urbano y la estética【Completado】
- **Producción de Edificios:** Los edificios producen automáticamente monedas por segundo, las monedas se pueden usar para construir nuevos edificios y expandir terreno【Completado】
- **Expansión de Terreno:** Los jugadores pueden gastar monedas para expandir el terreno (como 3000 monedas para expandir a 18x18, etc.), con posibilidad de obtener recursos adicionales durante la expansión【Completado】

### 3.2 Sistema de Recursos y Economía 【Completado】
- **Recurso de Monedas:** El recurso principal son las monedas, provenientes de la producción de edificios y recompensas de expansión de terreno【Completado】
- **Recolección de Recursos:** Las monedas se acumulan automáticamente, sin beneficios offline【Completado】
- **Sin Sincronización de Datos:** Todos los datos se almacenan localmente, simplificando la escala del juego【Completado】

### 3.3 Tabla de Clasificación y Logros【Parcialmente Completado】
- **Tabla de Clasificación:** Clasificación local o backend simple basada en el tamaño actual del terreno【Parcialmente Completado】
- **Sistema de Logros (Opcional):** Obtener insignias de logros al alcanzar objetivos específicos【No Completado】

### 3.4 Interacción y Operación 【Mayormente Completado】
- **Colocar/Mover/Eliminar edificios y carreteras:** Operaciones de arrastrar o hacer clic, intuitivas y fáciles de usar【Completado】
- **Consejos y Retroalimentación de UI:** Consejos claros para fondos insuficientes, condiciones de expansión de terreno, producción de edificios, etc.【Parcialmente Completado】
- **Guía para Principiantes:** Guía integrada en el juego para ayudar a los jugadores a comenzar rápidamente【No Completado】
- **Diseño Responsivo:** Adaptado principalmente para escritorio, compatible con móvil【Escritorio completado, móvil en progreso】

### 3.5 Sistema de Residentes de la Ciudad (Nuevo)【No Completado】
- **Visualización de Información de Residentes:**
  - Cada edificio tiene atributos de "número de residentes" y "estado"
  - Cuando los jugadores hacen clic en un edificio, aparece un panel de información mostrando el número actual de residentes y estado del edificio (como: normal, abarrotado, vacante, etc.)
- **Mecanismo de Número de Residentes:**
  - Edificios residenciales: El número de residentes crece automáticamente con el tiempo, cuando alcanza el límite el estado cambia a "abarrotado"
  - Edificios comerciales/públicos: El número de residentes está relacionado con la escala de la ciudad o el número de residencias
- **Impacto del Estado:**
  - En estado "abarrotado", la producción del edificio disminuye o se activan consejos
  - En estado "vacante", el edificio no produce monedas
  - En estado "normal", el edificio produce normalmente
- **Representación Solo de Texto:**
  - El sistema de residentes se muestra solo en forma de texto, sin modelos de personajes 3D

#### Ejemplo de Panel de Información:
- Nombre del Edificio: Residencia Avanzada
- Número de Residentes: 12/15
- Estado: Normal
- Descripción: El número de residentes está cerca del límite, se recomienda expandir o construir nuevas residencias

## 4. Principios de Diseño UI/UX【Parcialmente Completado】

- **Estilo cartoon 2.5D, colores brillantes**【Completado】
- **Operación intuitiva, retroalimentación oportuna**【Parcialmente Completado】
- **Prioridad de escritorio, compatible con móvil**【Escritorio completado, móvil en progreso】
- **Interfaz simple, destacando el diseño urbano y sensación de crecimiento**【Completado】
- **Amigable para principiantes, guía clara**【No Completado】

## 5. Selección Técnica y Consideraciones【Completado】

- **Biblioteca Principal:** Three.js【Completado】
- **Framework Frontend:** JS nativo o Vue/React (según familiaridad del equipo)【Vue Completado】
- **Estilos:** CSS (incluyendo media queries, adaptación a diferentes pantallas)【Completado】
- **Tabla de Clasificación/Almacenamiento de Datos:** Almacenamiento local o backend simple (como Superbase, solo para tabla de clasificación)【Almacenamiento local completado】
- **Recursos:** Modelos 3D y texturas de estilo cartoon【Completado】

## 6. Etapas de Desarrollo/Hitos

1. **Etapa Uno:** Escena básica y terreno, colocación de edificios/carreteras, prototipo de producción de monedas【Completado】
2. **Etapa Dos:** Mover/eliminar edificios, expansión de terreno, perfeccionamiento del sistema económico de monedas【Completado】
3. **Etapa Tres:** Integración de tabla de clasificación, recompensas de expansión de terreno【Parcialmente Completado】
4. **Etapa Cuatro:** UI responsiva y optimización para escritorio【En Progreso】
5. **Etapa Cinco:** Guía para principiantes, enriquecimiento de contenido (más edificios, decoraciones, etc.), pruebas y optimización【No Completado】

## 7. Posibilidades de Expansión Futura

- Más tipos de recursos (como madera, electricidad, etc.)
- Actualización de edificios y funciones especiales
- Interacción con NPCs, sistema de misiones
- Puntuación de estética urbana, sistema de logros
- Interacción social (visitar ciudades de otros, dar me gusta, etc.)