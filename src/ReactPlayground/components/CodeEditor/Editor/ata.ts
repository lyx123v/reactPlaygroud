import { setupTypeAcquisition } from '@typescript/ata'
import typescriprt from 'typescript';

export function createATA(onDownloadFile: (code: string, path: string) => void) {
  // ATA是TypeScript的类型系统，用于在TypeScript中进行类型检查和类型推断。
  const ata = setupTypeAcquisition({
    projectName: 'react-playground', // 项目名称
    typescript: typescriprt, // 类型脚本
    logger: console, // 日志
    delegate: {
      receivedFile: (code, path) => {
        console.log('自动下载的包', path);
        onDownloadFile(code, path); // 下载文件
      }
    },
  })

  return ata;
}
