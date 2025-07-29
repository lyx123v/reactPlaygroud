import MonacoEditor, { OnMount, EditorProps } from '@monaco-editor/react'
import { createATA } from './ata';
// import { editor } from 'monaco-editor'

// 编辑器文件
export interface EditorFile {
  name: string
  value: string
  language: string
}

// 编辑器组件的props
interface Props {
  file: EditorFile
  onChange?: EditorProps['onChange'],
  options?: EditorProps['options']
}

export default function Editor(props: Props) {

  const {
    file,
    onChange,
    options
  } = props;

  const handleEditorMount: OnMount = (editor, monaco) => {

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
      editor.getAction('editor.action.formatDocument')?.run() // 格式化代码
      // let actions = editor.getSupportedActions().map((a) => a.id);
      // console.log(actions);
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.Preserve, // 保留jsx
      esModuleInterop: true, // 模块互操作
    })

    const ata = createATA((code, path) => {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`) // 添加ata额外库，用于类型检查
    })

    editor.onDidChangeModelContent(() => {
      ata(editor.getValue()); // 执行ata
    });

    ata(editor.getValue()); // 执行ata
  }

  return <MonacoEditor
    height={'100%'} // 高度
    path={file.name} // 路径
    language={file.language} // 语言
    onMount={handleEditorMount} // 挂载
    onChange={onChange} // 改变
    value={file.value} // 值
    options={
      {
        fontSize: 14, // 字体大小
        scrollBeyondLastLine: true, // 滚动超出最后一行
        minimap: {
          enabled: false, // 最小化
        },
        scrollbar: {
          verticalScrollbarSize: 6, // 垂直滚动条大小
          horizontalScrollbarSize: 6, // 水平滚动条大小
        },
        ...options
      }
    }
  />
}
