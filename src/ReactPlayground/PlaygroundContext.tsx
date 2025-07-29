import { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { compress, fileName2Language, uncompress } from './utils'
import { initFiles } from './files'

export interface File {
  name: string // 文件名
  value: string // 文件内容
  language: string // 文件语言
}

export interface Files {
  [key: string]: File
}

export interface PlaygroundContext {
  theme: 'light' | 'dark' // 主题
  setTheme: (theme: 'light' | 'dark') => void // 设置主题
  files: Files // 文件列表
  selectedFileName: string // 选中的文件名
  setSelectedFileName: (fileName: string) => void // 设置选中的文件名
  setFiles: (files: Files) => void // 设置文件列表
  addFile: (fileName: string) => void // 添加文件
  removeFile: (fileName: string) => void // 删除文件
  updateFileName: (oldFieldName: string, newFieldName: string) => void // 更新文件名
}

// 创建上下文
export const PlaygroundContext = createContext<PlaygroundContext>({
  selectedFileName: 'App.tsx',
  theme: 'light',
} as PlaygroundContext)

const getFilesFromUrl = () => {
  let files: Files | undefined
  try {
    const hash = uncompress(window.location.hash.slice(1))
    files = JSON.parse(hash)
  } catch (error) {
    console.error(error)
  }
  return files
}


// 提供者
export const PlaygroundProvider = (props: PropsWithChildren) => {
  const { children } = props // 子组件
  const [files, setFiles] = useState<Files>(getFilesFromUrl() || initFiles) // 文件列表
  const [selectedFileName, setSelectedFileName] = useState('App.tsx'); // 选中的文件名
  const [theme, setTheme] = useState<'light' | 'dark'>('light') // 主题

  // 添加文件
  const addFile = (name: string) => {
    files[name] = {
      name,
      language: fileName2Language(name),
      value: '',
    }
    setFiles({ ...files })
  }

  // 删除文件
  const removeFile = (name: string) => {
    delete files[name]
    setFiles({ ...files })
  }

  // 更新文件名
  const updateFileName = (oldFieldName: string, newFieldName: string) => {
    if (!files[oldFieldName] || newFieldName === undefined || newFieldName === null) return
    const { [oldFieldName]: value, ...rest } = files
    const newFile = {
      [newFieldName]: {
        ...value,
        language: fileName2Language(newFieldName),
        name: newFieldName,
      },
    }
    setFiles({
      ...rest,
      ...newFile,
    })
  }
  useEffect(() => {
    const hash = compress(JSON.stringify(files))
    window.location.hash = hash
  }, [files])

  return (
    <PlaygroundContext.Provider
      value={{
        theme, // 主题
        setTheme, // 设置主题
        files, // 文件列表
        selectedFileName, // 选中的文件名
        setSelectedFileName, // 设置选中的文件名
        setFiles, // 设置文件列表
        addFile, // 添加文件
        removeFile, // 删除文件
        updateFileName, // 更新文件名
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  )
}
