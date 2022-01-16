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
        `fst : (a, b) -> a\nfst = ?rhs_fst
         \nlength : List a -> Int\nlength = ?rhs_length`)
    } 
  });

  return (
    <div className="container">
      
      <div id="material">
        <article>
          <div dangerouslySetInnerHTML={{__html: lessonData.contentHtml}} />
        </article>
      </div>

      <div id='editor'>
        <div className='match-braces' ref={root}></div>
      </div>

      <pre id="repl" className='command-line' data-user='Idris' data-host='Idris' data-promt='bash'>
        <code>**siia tuleb REPL/terminal**</code>
      </pre>
      
    </div>
    
  )
}