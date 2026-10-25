/**
 * Раздел "Изучение". Сам код разнесён по файлам рядом:
 *  - study-path-screen.tsx: экран пути с узлами (StudyPath);
 *  - study-lesson-screen.tsx: урок уровня, сценарии и квиз (StudyLesson);
 *  - path-parts.tsx: узел-шайба, кольцо прогресса, иконки, счётчики, появление карточки;
 *  - path-layout.ts: константы раскладки, расчёт центров узлов, сегменты, названия тем;
 *  - study-styles.ts: общие стили.
 * Этот файл оставлен, чтобы импорты в MainNavigator не менялись.
 */
export { StudyPath } from './study-path-screen';
export { StudyLesson } from './study-lesson-screen';