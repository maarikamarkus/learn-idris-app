import React, { useState, useRef, useEffect } from 'react';
import { getAllLessonIds, getLessonCode, getLessonData } from '../../lib/lessons';
import Prism from 'prismjs';


const testResults = [
  {
    'funName': 'first',
    'passed': true,
  },
  {
    'funName': 'sumInt',
    'passed': false,
    'content': 'pahasti läks :(',
  }
];

export async function getStaticProps({ params }) {
  const lessonData = await getLessonData(params.id);
  const lessonCode = await getLessonCode(params.id);
  return {
    props: {
      lessonData,
      lessonCode
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

export default function Lesson({ lessonData, lessonCode }) {
  const codeflask = useRef();
  const root = useRef(null);
  const [results, setResults] = useState({testResults: [], lessonPassed: false});

  useEffect(async () => {
    if (typeof window !== 'undefined' && codeflask.current !== null) {
      const CodeFlask = require('codeflask');
      codeflask.current = new CodeFlask.default(
        root.current, 
        { 
          language: 'idris',
          lineNumbers: true
        });
      codeflask.current.addLanguage('idris', Prism.languages['idris']);
      codeflask.current.updateCode(lessonCode);
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
    
    setResults(await res.json());
    localStorage.setItem(lessonData.id, results.lessonPassed);
  }

  return (
    <div className={'flex flex-col h-screen'}>
      <div className={'flex flex-row grow'}>
        <div id='material' className={'basis-1/3 p-5 bg-[#F6F5F5]'}>
          <article>
            <div className={'prose prose-code:before:content-none prose-code:after:content-none'} dangerouslySetInnerHTML={{ __html: lessonData.contentHtml }} />
          </article>
        </div>
      
        <div id='editor' className={'relative basis-1/3'}>
          <div className={'flask-ref-root'} ref={root} ></div>
        </div>
      
        <div className={'w-1/3 p-5 bg-[#F6F5F5]'}>

          <div className={'font-mono'}>

            {results.testResults.map((result, idx) => 
              result.passed
              ? (
                <div className={"accordion-item bg-white border border-gray-200"}>
                  <h2 className={"accordion-header mb-0"}>
                    <div className={'accordion-row collapsed'}>
                      <span className={'green font-bold mr-2'}>✓</span>
                      {result.funName}
                    </div>
                  </h2>
                </div>
              )
              : (
                <div className={"accordion-item bg-white border border-gray-200"}>
                  <h2 className={"accordion-header mb-0"} id={`heading-${idx}`}>
                    <button className={'accordion-btn collapsed'} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${idx}`} aria-expanded="false"
                      aria-controls={`collapse-${idx}`}>
                      <span className={'red font-bold mr-2'}>✗</span>
                      {result.funName}
                    </button>
                  </h2>
                  <div id={`collapse-${idx}`} className={"accordion-collapse collapse"} aria-labelledby={`heading-${idx}`}>
                    <div className={"accordion-body py-4 px-5"} dangerouslySetInnerHTML={{ __html: result.content }}></div>
                  </div>
                </div>
              )
            )}

          </div>

        </div>
      
      </div>

      <div className={'footer'}>
        <div className={'btn'} onClick={runCode}>
          Kontrolli
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