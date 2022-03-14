import React, { useState, useRef, useEffect } from 'react';
import { getAllLessonIds, getLessonCode, getLessonData } from '../../lib/lessons';
import Prism from 'prismjs';
import { useRouter} from 'next/router';

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
  const allLessonIds = getAllLessonIds().map(x => x.params.id);
  
  const initialState = {};
  for (const lessonId of allLessonIds) {
    initialState[lessonId] = {testResults: [], lessonPassed: false, userCode: await getLessonCode(lessonId)};
  }
  
  return {
    props: {
      lessonData,
      allLessonIds,
      initialState,
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

export default function Lesson({ lessonData, allLessonIds, initialState }) {
  const router = useRouter();
  const codeflask = useRef();
  const root = useRef(null);

  const [state, setState] = useState(initialState);

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
      codeflask.current.updateCode(state[lessonData.id].userCode);
      codeflask.current.onUpdate((code) => {
        setState({
          ...state,
          [lessonData.id]: {
            ...state[lessonData.id],
            userCode: code
          }
        });
      });
    } 
  }, [lessonData.id]);

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
    

    const lessonResults = await res.json();
    setState({
      ...state,
      [lessonData.id]: {
        ...state[lessonData.id],
        testResults: lessonResults.testResults,
      }
    });
    localStorage.setItem(lessonData.id, lessonResults.lessonPassed);
  }

  async function prevLesson() {
    const prevLessonId = getPrevLessonId(lessonData.id);
    if (lessonExists(prevLessonId)) {
      router.push(`/lesson/${prevLessonId}`);
    } else {
      router.push('/');
    }
  }

  async function nextLesson() {
    const nextLessonId = getNextLessonId(lessonData.id)
    if (lessonExists(nextLessonId)) {
      router.push(`/lesson/${nextLessonId}`);
    } else {
      router.push('/');
    }
  }

  function lessonExists(lessonId) {
    return allLessonIds.includes(lessonId);
  }
  
  function getNextLessonId(curLessonId) {
    const curLessonIdx = allLessonIds.indexOf(curLessonId);
    return allLessonIds[curLessonIdx + 1];
  }
  
  function getPrevLessonId(curLessonId) {
    const curLessonIdx = allLessonIds.indexOf(curLessonId);
    return allLessonIds[curLessonIdx - 1];
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

            {state[lessonData.id].testResults.map((result, idx) => 
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
    
        <div className={'btn'} onClick={prevLesson}>
          Eelmine teema
        </div>
    
        <div className={'btn'} onClick={nextLesson}>
          Järgmine teema
        </div>
      </div>
    </div>
    
  )
}