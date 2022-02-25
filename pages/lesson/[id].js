import React, { useState, useRef, useEffect } from 'react';
import { getAllLessonIds, getLessonData } from '../../lib/lessons';
import Prism from 'prismjs';

export async function getStaticProps({ params }) {
  const lessonData = await getLessonData(params.id);
  return {
    props: {
      lessonData
    }
  };
}

export async function getStaticPaths() {
  const paths = getAllLessonIds();
  return {
    paths,
    fallback: false
  };
}

export default function Lesson({ lessonData }) {
  const codeflask = useRef();
  const root = useRef(null);
  const [replOutput, setReplOutput] = useState('');

  useEffect(async () => {
    if (typeof window !== undefined && codeflask.current !== null) {
      const CodeFlask = require('codeflask');
      codeflask.current = new CodeFlask.default(
        root.current, 
        { 
          language: 'idris',
          lineNumbers: true
        });
      codeflask.current.addLanguage('idris', Prism.languages['idris']);
      codeflask.current.updateCode(
        `first : (a, b) -> a\nfirst (x, _) = x\n\nsumInt : Int -> Int\nsumInt 0 = 0\nsumInt n = sumInt (n-1) + n`)
    } 
  });

  async function runCode() {
    const code = codeflask.current.getCode();

    const res = await fetch('/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        lessonId: lessonData.id,
      }),
    });

    setReplOutput(await res.text());
  }

  return (
    <div className={'flex flex-col h-screen'}>
      <div className={'flex flex-row grow'}>
        <div id='material' className={'basis-1/3 pt-5 ml-3'}>
          <article>
            <div className={'prose prose-slate '} dangerouslySetInnerHTML={{ __html: lessonData.contentHtml }} />
          </article>
        </div>
      
        <div id='editor' className={'relative basis-1/3'}>
          <div className={'flask-ref-root'} ref={root} ></div>
        </div>
      
        <div id='repl' className={'command-line w-1/3'}>
          <code className={'whitespace-normal'} dangerouslySetInnerHTML={{ __html: replOutput }}></code>
        </div>
      
      </div>

      <div className={'footer'}>
        <div className={'btn'} onClick={runCode}>
          Käivita
        </div>
    
        <div className={'btn'}>
          Eelmine teema
        </div>
    
        <div className={'btn'}>
          Järgmine teema
        </div>
      </div>
    </div>
    
  )
}