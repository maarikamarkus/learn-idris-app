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
    <div className="container" class="flex flex-row items-stretch h-screen">
      
      <div id="material" class="basis-1/3">
        <article>
          <div dangerouslySetInnerHTML={{__html: lessonData.contentHtml}} />
        </article>
      </div>

      <div id='editor' class='flex relative basis-1/3'>
        <div class=''>
          <div className='match-braces' ref={root} class=''></div>
        </div>
        <div class='bg-sky-100 text-blue-600 rounded p-3 absolute self-end'>
          Testimise nupp
        </div>
      </div>

      {/*<div class='basis-1/3'>
        <div class='justify-self-end self-end px-3'>
          <button>Testi</button>
        </div>
      </div>*/}

      <div id="repl" class='basis-1/3'>
        <pre className='command-line' data-user='Idris' data-host='Idris' data-promt='bash'>
          <code>**siia tuleb REPL/terminal**</code>
        </pre>
      </div>
    </div>
    
  )
}