import { transform } from '@babel/standalone'
import { File, Files } from '../../PlaygroundContext'
import { ENTRY_FILE_NAME } from '../../files'
import { PluginObj } from '@babel/core';

// 自动引入React
export const beforeTransformCode = (filename: string, code: string) => {
  let _code = code
  const regexReact = /import\s+React/g // 正则表达式,判断是否引入了React
  if ((filename.endsWith('.jsx') || filename.endsWith('.tsx')) && !regexReact.test(code)) {
    _code = `import React from 'react';\n${code}`
  }
  return _code
}

// 使用babel转换代码
export const babelTransform = (filename: string, code: string, files: Files) => {
  let _code = beforeTransformCode(filename, code);
  let result = ''
  try {
    result = transform(_code, {
      presets: ['react', 'typescript'],
      filename,
      plugins: [customResolver(files)],
      retainLines: true
    }).code!
  } catch (e) {
    console.error('编译出错', e);
  }
  return result
}

const getModuleFile = (files: Files, modulePath: string) => {
  let moduleName = modulePath.split('./').pop() || '' // 模块名
  if (!moduleName.includes('.')) {
    const realModuleName = Object.keys(files).filter(key => { // 过滤出符合条件的文件名
      return key.endsWith('.ts')
        || key.endsWith('.tsx')
        || key.endsWith('.js')
        || key.endsWith('.jsx')
    }).find((key) => {
      return key.split('.').includes(moduleName) // 判断文件名是否包含模块名
    })
    if (realModuleName) {
      moduleName = realModuleName
    }
  }
  return files[moduleName] // 返回文件
}

const json2Js = (file: File) => {
  const js = `export default ${file.value}` // 导出文件内容
  return URL.createObjectURL(new Blob([js], { type: 'application/javascript' })) // 创建对象URL
}

const css2Js = (file: File) => {
  const randomId = new Date().getTime() // 随机ID
  const js = `
(() => {
    const stylesheet = document.createElement('style')
    stylesheet.setAttribute('id', 'style_${randomId}_${file.name}')
    document.head.appendChild(stylesheet)

    const styles = document.createTextNode(\`${file.value}\`)
    stylesheet.innerHTML = ''
    stylesheet.appendChild(styles)
})()
    `
  return URL.createObjectURL(new Blob([js], { type: 'application/javascript' })) // 创建对象URL
}

function customResolver(files: Files): PluginObj {
  return {
    visitor: {
      ImportDeclaration(path) {
        const modulePath = path.node.source.value // 模块路径
        if (modulePath.startsWith('.')) {
          const file = getModuleFile(files, modulePath) // 获取模块文件
          if (!file)
            return

          if (file.name.endsWith('.css')) {
            path.node.source.value = css2Js(file) // 转换CSS文件
          } else if (file.name.endsWith('.json')) {
            path.node.source.value = json2Js(file) // 转换JSON文件
          } else {
            path.node.source.value = URL.createObjectURL(
              new Blob([babelTransform(file.name, file.value, files)], {
                type: 'application/javascript', // 类型
              })
            )
          }
        }
      }
    }
  }
}

export const compile = (files: Files) => {
  const main = files[ENTRY_FILE_NAME]
  return babelTransform(ENTRY_FILE_NAME, main.value, files)
}

// 监听消息
self.addEventListener('message', async ({ data }) => {
  try {
    // 发送编译后的代码
    self.postMessage({
      type: 'COMPILED_CODE', // 编译后的代码
      data: compile(data) // 编译
    })
  } catch (e) {
    // 发送错误信息
    self.postMessage({ type: 'ERROR', error: e })
  }
})
