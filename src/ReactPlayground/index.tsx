import { Allotment } from "allotment";
import 'allotment/dist/style.css';
import Header from "./components/Header";
import CodeEditor from "./components/CodeEditor/index";
import Preview from "./components/Preview";
import './index.scss'
import { PlaygroundContext } from "./PlaygroundContext";
import { useContext } from "react";

export default function ReactPlayground() {
  const { theme } = useContext(PlaygroundContext)
  return <div className={theme} style={{ height: '100vh' }}>
    {/* 头部 */}
    <Header />
    {/* 分割线 */}
    <Allotment defaultSizes={[100, 100]}>
      {/* 代码编辑器 */}
      <Allotment.Pane minSize={0}>
        <CodeEditor />
      </Allotment.Pane>
      {/* 预览 */}
      <Allotment.Pane minSize={0}>
        <Preview />
      </Allotment.Pane>
    </Allotment>
  </div>
}
