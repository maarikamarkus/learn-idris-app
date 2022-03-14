import React, { useState, useRef, useEffect } from 'react';
import { getAllLessonIds, getLessonCode, getLessonData } from '../../lib/lessons';
import Prism from 'prismjs';
import { useRouter} from 'next/router';
import { getLessonDataFromLocalStorage } from '../../lib/localStorageUtil';

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
  const allLessonsCode = {};
  
  for (const lessonId of allLessonIds) {
    allLessonsCode[lessonId] = await getLessonCode(lessonId);
  }
  
  return {
    props: {
      lessonData,
      allLessonIds,
      allLessonsCode
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


export default function Lesson({ lessonData, allLessonIds, allLessonsCode }) {
  const lessonId = lessonData.id;
  const router = useRouter();
  const codeflask = useRef();
  const root = useRef(null);
  
  const [state, setState] = useState(getInitialState());
  
  useEffect(async () => {
    if (typeof window !== 'undefined' && codeflask.current !== null) {
      const CodeFlask = require('codeflask');
      codeflask.current = new CodeFlask.default(
        root.current, 
        { 
          language: 'idris',
          lineNumbers: true,
        });
        codeflask.current.addLanguage('idris', Prism.languages['idris']);
        
        codeflask.current.updateCode(state[lessonId].userCode);
        codeflask.current.onUpdate((code) => {
          setState({
            ...state,
            [lessonId]: {
              ...state[lessonId],
              userCode: code,
            },
          });
          
          localStorage.setItem(lessonId, JSON.stringify({
            ...JSON.parse(localStorage.getItem(lessonId)),
            userCode: code,
          }));
        });
      } 
    }, [lessonId, state[lessonId].testResults]);
    
    function getInitialState() {
      const initialState = {};
      for (const lessonId of allLessonIds) {
        const lessonDataFromLocalStorage = getLessonDataFromLocalStorage(lessonId);
    
        const testResults = lessonDataFromLocalStorage !== null ? lessonDataFromLocalStorage.testResults ?? [] : []
        const lessonPassed = lessonDataFromLocalStorage !== null ? lessonDataFromLocalStorage.lessonPassed ?? false : false;
        const userCode = lessonDataFromLocalStorage !== null 
          ? lessonDataFromLocalStorage.userCode ?? allLessonsCode[lessonId] 
          : allLessonsCode[lessonId];
    
        initialState[lessonId] = {
          testResults, 
          lessonPassed, 
          userCode, 
        };
      }
    
      return initialState;
    }

  async function runCode() {
    const code = codeflask.current.getCode();

    const res = await fetch('/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        lessonId: lessonId,
      }),
    });
    

    const lessonResults = await res.json();
    const newState = {
      ...state,
      [lessonId]: {
        ...state[lessonId],
        ...lessonResults,
      }
    };
    setState(newState);
    localStorage.setItem(lessonId, JSON.stringify(newState[lessonId]));
  }

  async function prevLesson() {
    const prevLessonId = getPrevLessonId(lessonId);
    if (lessonExists(prevLessonId)) {
      router.push(`/lesson/${prevLessonId}`);
    } else {
      router.push('/');
    }
  }

  async function nextLesson() {
    const nextLessonId = getNextLessonId(lessonId)
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

            {state[lessonId].testResults.map((result, idx) => 
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