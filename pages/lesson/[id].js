import React, { useState, useRef, useEffect } from 'react';


export default function Lesson() {
  const codeflask = useRef();
  const root = useRef(null);
  const [val, setVal] = useState('');

  useEffect(async () => {
    if (typeof window !== undefined && codeflask.current !== null) {
      const CodeFlask = await import('codeflask');
      codeflask.current = new CodeFlask.default(
        root.current, 
        { 
          language: 'idris',
          lineNumbers: true
        });
      codeflask.current.updateCode("test : ()")
    } 
  });

  return (
    <div id='editor'>
      <div ref={root}></div>
    </div>
    
  )
}