import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { getLessonsData } from '../lib/lessons';

export async function getStaticProps() {
  const lessons = await getLessonsData();
  return {
    props: {
      lessons
    }
  };
}

export default function Home({ lessons }) {
  return (
    <div className={'styles.container bg-[#F6F5F5]'}>
      <Head>
        <title>Learn Idris</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Siin lehel saad teha algust funktsionaalprogrammeerimise ja -keele Idrisega!
        </h1>

        <div className={"grid gap-4 grid-cols-3"}>
          {lessons.map((lesson, idx) => {
            const lessonData = (typeof window !== 'undefined') ? localStorage.getItem(lesson.id) : null;
            const lessonPassed = (lessonData !== null) ? JSON.parse(lessonData).lessonPassed : false;

            return lessonPassed
            ? (
              <Link href={`/lesson/${lesson.id}`} key={idx}>
                
                <a className={"lesson-link"}>
                  {`✓ ${lesson.title}`}
                </a>

              </Link>
            )
            : (
              <Link href={`/lesson/${lesson.id}`} key={idx}>
                
                <a className={"lesson-link"}>
                  {lesson.title}
                </a>

              </Link>
            )
              
          })}
        </div>
       
      </main>

      <footer className={styles.footer}>
        
      </footer>
    </div>
  )
}
