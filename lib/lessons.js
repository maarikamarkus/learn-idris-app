import { remark } from 'remark';
import html from 'remark-html';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const lessonsDirectory = path.join(process.cwd(), '/_lessons')

export function getLessonsData() {
  const fileNames = fs.readdirSync(lessonsDirectory);
  const allLessonsData = fileNames.map(fileName => {
    const id = fileName.replace(/\.md$/, '');

    const fullPath = path.join(lessonsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);

    return {
      id,
      ...matterResult.data
    };
  })
  return allLessonsData;
};

export function getAllLessonIds() {
  const fileNames = fs.readdirSync(lessonsDirectory)

  return fileNames.map(fileName => {
    return {
      params: { id: fileName.replace(/\.md$/, '')}
    };
  });
};

export async function getLessonData(id) {
  const fullPath = path.join(lessonsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...matterResult.data
  };
};

// TODO: mõelda, kas lugeda kood hoopis MD failist, prg sobib see ka
export async function getLessonCode(id) {
  let fileContents;
  try {
    fileContents = fs.readFileSync(`_code/${id}.idr`, "utf-8");
  } catch {
    fileContents = ''
  }
  return fileContents;
}
