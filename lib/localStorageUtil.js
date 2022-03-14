
export function getLessonDataFromLocalStorage(lessonId) {
  if (typeof window === 'undefined') {
    return null;
  }

  const lessonData = localStorage.getItem(lessonId);
  return lessonData === null ? null : JSON.parse(lessonData);
}