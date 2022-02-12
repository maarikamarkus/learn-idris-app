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
  const [val, setVal] = useState('');

  useEffect(async () => {
    if (typeof window !== undefined && codeflask.current !== null) {
      const CodeFlask = await require('codeflask');
      codeflask.current = new CodeFlask.default(
        root.current, 
        { 
          language: 'idris',
          lineNumbers: true
        });
      codeflask.current.addLanguage('idris', Prism.languages['idris']);
      codeflask.current.updateCode(
        `fst : (a, b) -> a\nfst (x, _) = x\n\nsumInt : Int -> Int\nsumInt 0 = 0\nsumInt n = sumInt (n-1) + n`)
    } 
  });

  return (
    <div className={'flex flex-col h-screen'}>
      <div className={'flex flex-row grow'}>
        <div id='material' className={'basis-1/3'}>
          <article>
            <div dangerouslySetInnerHTML={{__html: lessonData.contentHtml}} />
          </article>
        </div>
      
        <div id='editor' className={'relative basis-1/3'}>
          <div className={'flask-ref-root'} ref={root} ></div>
        </div>
      
        <div id='repl' className={'basis-1/3'}>
          <pre className={'command-line'} data-user='Idris' data-host='Idris' data-prompt='bash'>
            <code>**siia tuleb REPL/terminal**</code>
          </pre>
        </div>
      
      </div>

      <div className={'footer'}>
        <div className={'btn'}>
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