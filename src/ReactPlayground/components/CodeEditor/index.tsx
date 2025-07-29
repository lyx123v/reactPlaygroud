import { useContext } from "react";
import { PlaygroundContext } from "../../PlaygroundContext";
import Editor from "./Editor";
import FileNameList from "./FileNameList";
import { debounce } from 'lodash-es'

export default function CodeEditor() {
  const {
    theme,
    files,
    setFiles,
    selectedFileName,
  } = useContext(PlaygroundContext)

  // 当前文件
  const file = files[selectedFileName];

  // 编辑器改变
  function onEditorChange(value?: string) {
    files[file.name].value = value!
    setFiles({ ...files })
  }


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 文件列表 */}
      <FileNameList />
      {/* 编辑器 */}
      <Editor file={file} onChange={debounce(onEditorChange, 1000)} options={
        {
          theme: `vs-${theme}`, // 主题
        }
      } />
    </div>
  )
}
