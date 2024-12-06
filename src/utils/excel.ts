import * as XLSX from 'xlsx';

export const downloadTemplate = () => {
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 创建表头数据
  const headers = [['用户名', '邮箱']];
  const examples = [
    ['zhangsan', 'zhangsan@example.com'],
    ['lisi', 'lisi@example.com']
  ];
  
  // 合并表头和示例数据
  const data = [...headers, ...examples];
  
  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // 设置列宽
  const colWidth = [
    { wch: 20 }, // 用户名列宽
    { wch: 30 }  // 邮箱列宽
  ];
  ws['!cols'] = colWidth;
  
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '用户导入模板');
  
  // 下载文件
  XLSX.writeFile(wb, '用户导入模板.xlsx');
};