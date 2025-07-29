import { useContext, useEffect, useRef, useState } from "react"
import { PlaygroundContext } from "../../PlaygroundContext"
import iframeRaw from './iframe.html?raw'
import { IMPORT_MAP_FILE_NAME } from "../../files";
import { Message } from "../Message";
import CompilerWorker from './compiler.worker?worker'
import { debounce } from "lodash-es";

interface MessageData {
  data: {
    type: string
    message: string
  }
}

// 预览组件
export default function Preview() {

  const { files } = useContext(PlaygroundContext) // 文件
  const [compiledCode, setCompiledCode] = useState('') // 编译后的代码
  const [error, setError] = useState('') // 错误

  // 编译器worker
  const compilerWorkerRef = useRef<Worker>(null);

  useEffect(() => {
    if (!compilerWorkerRef.current) {
      // 创建编译器worker
      compilerWorkerRef.current = new CompilerWorker();
      // 接收编译器worker消息
      compilerWorkerRef.current.addEventListener('message', ({ data }) => {
        console.log('worker', data); // 接收编译器worker消息
        if (data.type === 'COMPILED_CODE') {
          console.log('编译后的代码', data.data); // 编译后的代码
          setCompiledCode(data.data); // 设置编译后的代码
        } else {
          console.log('error', data); // 错误
        }
      })
    }
  }, []);

  // 文件改变
  useEffect(() => {
    compilerWorkerRef.current?.postMessage(files)
  }, [files]);

  // 获取iframe的url
  const getIframeUrl = () => {
    // 替换importmap
    const res = iframeRaw.replace(
      '<script type="importmap"></script>',
      `<script type="importmap">${files[IMPORT_MAP_FILE_NAME].value
      }</script>`
    ).replace(
      '<script type="module" id="appSrc"></script>',
      `<script type="module" id="appSrc">${compiledCode}</script>`,
    )
    // 创建blob url
    return URL.createObjectURL(new Blob([res], { type: 'text/html' }))
  }

  useEffect(() => {
    setIframeUrl(getIframeUrl())
  }, [files[IMPORT_MAP_FILE_NAME].value, compiledCode]);

  const [iframeUrl, setIframeUrl] = useState(getIframeUrl());

  // 处理消息
  const handleMessage = (msg: MessageData) => {
    const { type, message } = msg.data
    if (type === 'ERROR') {
      setError(message) // 设置错误
    }
  }

  // 监听消息
  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // 编译
  useEffect(debounce(() => {
    compilerWorkerRef.current?.postMessage(files)
  }, 500), [files]);

  return <div style={{ height: '100%' }}>
    <iframe
      src={iframeUrl}
      style={{
        width: '100%',
        height: '100%',
        padding: 0,
        border: 'none',
      }}
    />
    {/* 错误消息 */}
    <Message type='error' content={error} />

    {/* <Editor file={{
            name: 'dist.js',
            value: compiledCode,
            language: 'javascript'
        }}/> */}
  </div>
}
