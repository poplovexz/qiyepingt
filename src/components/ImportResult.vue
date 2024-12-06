<template>
  <div class="import-result">
    <div class="result-header">
      <el-alert
        :type="result.success ? 'success' : 'error'"
        :title="result.message"
        :closable="false"
        show-icon
      />
    </div>
    
    <div class="result-stats">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="never">
            <template #header>
              <div class="stat-header">
                <span>总数</span>
              </div>
            </template>
            <div class="stat-number">{{ result.total }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never">
            <template #header>
              <div class="stat-header success">
                <span>成功</span>
              </div>
            </template>
            <div class="stat-number success">{{ result.successCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never">
            <template #header>
              <div class="stat-header error">
                <span>失败</span>
              </div>
            </template>
            <div class="stat-number error">{{ result.failCount }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-if="result.failCount > 0" class="error-details">
      <div class="error-title">失败详情：</div>
      <el-table
        :data="result.errors"
        border
        size="small"
        style="width: 100%"
      >
        <el-table-column prop="row" label="行号" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="reason" label="失败原因" />
      </el-table>
    </div>

    <div class="result-actions">
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button 
        v-if="result.failCount > 0"
        type="primary"
        @click="handleDownloadErrors"
      >
        下载失败记录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import * as XLSX from 'xlsx';

interface ErrorRecord {
  row: number;
  username: string;
  email: string;
  reason: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  total: number;
  successCount: number;
  failCount: number;
  errors: ErrorRecord[];
}

const props = defineProps<{
  result: ImportResult;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleDownloadErrors = () => {
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 准备数据
  const headers = [['行号', '用户名', '邮箱', '失败原因']];
  const data = props.result.errors.map(error => [
    error.row,
    error.username,
    error.email,
    error.reason
  ]);
  
  // 合并表头和数据
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 10 },  // 行号
    { wch: 20 },  // 用户名
    { wch: 30 },  // 邮箱
    { wch: 40 }   // 失败原因
  ];
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '导入失败记录');
  
  // 下载文件
  XLSX.writeFile(wb, `导入失败记录_${new Date().getTime()}.xlsx`);
};
</script>

<style scoped>
.import-result {
  padding: 20px;
}

.result-header {
  margin-bottom: 20px;
}

.result-stats {
  margin: 20px 0;
}

.stat-header {
  text-align: center;
  font-weight: bold;
  
  &.success {
    color: #67c23a;
  }
  
  &.error {
    color: #f56c6c;
  }
}

.stat-number {
  font-size: 24px;
  text-align: center;
  padding: 10px 0;
  
  &.success {
    color: #67c23a;
  }
  
  &.error {
    color: #f56c6c;
  }
}

.error-details {
  margin-top: 20px;
}

.error-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #f56c6c;
}

.result-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 