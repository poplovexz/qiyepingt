<template>
  <div class="product-import">
    <el-dialog
      v-model="dialogVisible"
      title="批量导入商品"
      width="600px"
    >
      <div class="import-steps">
        <div class="step">
          <h4>第一步：下载模板</h4>
          <el-button type="primary" link @click="downloadTemplate">
            下载Excel模板
          </el-button>
        </div>
        
        <div class="step">
          <h4>第二步：上传文件</h4>
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            accept=".xlsx,.xls"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传Excel文件，仅支持.xlsx或.xls格式
              </div>
            </template>
          </el-upload>
        </div>

        <div class="step">
          <h4>第三步：选择分类</h4>
          <el-select 
            v-model="importForm.categoryId" 
            placeholder="请选择商品分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="importing"
          @click="handleImport"
        >
          开始导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 导入结果对话框 -->
    <el-dialog
      v-if="importResult"
      v-model="resultVisible"
      title="导入结果"
      width="500px"
    >
      <div class="import-result">
        <el-alert
          :type="importResult.success ? 'success' : 'warning'"
          :title="importResult.message"
          :closable="false"
          show-icon
        />
        
        <div class="result-stats">
          <div class="stat-item">
            <span class="label">总数：</span>
            <span class="value">{{ importResult.total }}</span>
          </div>
          <div class="stat-item">
            <span class="label">成功：</span>
            <span class="value success">{{ importResult.successCount }}</span>
          </div>
          <div class="stat-item">
            <span class="label">失败：</span>
            <span class="value error">{{ importResult.failCount }}</span>
          </div>
        </div>

        <div v-if="importResult.errors?.length" class="error-list">
          <h4>失败详情：</h4>
          <el-table
            :data="importResult.errors"
            border
            size="small"
            style="width: 100%"
          >
            <el-table-column prop="row" label="行号" width="80" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="reason" label="失败原因" />
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="resultVisible = false">关闭</el-button>
        <el-button 
          v-if="importResult.errors?.length"
          type="primary"
          @click="downloadErrors"
        >
          下载失败记录
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadInstance, UploadRawFile } from 'element-plus';
import * as XLSX from 'xlsx';
import request from '@/utils/request';

interface ImportResult {
  success: boolean;
  message: string;
  total: number;
  successCount: number;
  failCount: number;
  errors?: Array<{
    row: number;
    name: string;
    reason: string;
  }>;
}

const props = defineProps<{
  visible: boolean;
  categories: Array<{
    id: number;
    name: string;
  }>;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

const dialogVisible = ref(props.visible);
const resultVisible = ref(false);
const importing = ref(false);
const uploadRef = ref<UploadInstance>();
const selectedFile = ref<File | null>(null);
const importResult = ref<ImportResult | null>(null);

const importForm = reactive({
  categoryId: ''
});

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val;
});

watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val);
  if (!val) {
    selectedFile.value = null;
    importForm.categoryId = '';
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
  }
});

// 下载模板
const downloadTemplate = () => {
  const wb = XLSX.utils.book_new();
  const headers = [['商品名称', '价格', '描述']];
  const examples = [
    ['示例商品1', '99.99', '商品描述1'],
    ['示例商品2', '199.99', '商品描述2']
  ];
  
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...examples]);
  XLSX.utils.book_append_sheet(wb, ws, '商品导入模板');
  XLSX.writeFile(wb, '商品导入模板.xlsx');
};

// 文件上传前的验证
const beforeUpload = (file: UploadRawFile) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件！');
    return false;
  }
  return true;
};

const handleFileChange = (file: UploadRawFile) => {
  selectedFile.value = file.raw || null;
};

// 开始导入
const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请选择要导入的文件');
    return;
  }
  if (!importForm.categoryId) {
    ElMessage.error('请选择商品分类');
    return;
  }

  importing.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('categoryId', importForm.categoryId);

    const response = await request.post('/api/products/import', formData);
    importResult.value = response.data;
    dialogVisible.value = false;
    resultVisible.value = true;

    if (response.data.successCount > 0) {
      emit('success');
    }
  } catch (error) {
    ElMessage.error('导入失败');
  } finally {
    importing.value = false;
  }
};

// 下载失败记录
const downloadErrors = () => {
  if (!importResult.value?.errors) return;

  const wb = XLSX.utils.book_new();
  const headers = [['行号', '商品名称', '失败原因']];
  const data = importResult.value.errors.map(error => [
    error.row,
    error.name,
    error.reason
  ]);
  
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
  XLSX.utils.book_append_sheet(wb, ws, '导入失败记录');
  XLSX.writeFile(wb, `导入失败记录_${new Date().getTime()}.xlsx`);
};
</script>

<style scoped>
.import-steps {
  padding: 20px 0;
}

.step {
  margin-bottom: 20px;
}

.step h4 {
  margin: 0 0 10px;
  color: #606266;
}

.import-result {
  padding: 20px 0;
}

.result-stats {
  margin: 20px 0;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  color: #606266;
}

.stat-item .value {
  font-size: 24px;
  font-weight: bold;
  margin-left: 5px;
}

.value.success {
  color: #67c23a;
}

.value.error {
  color: #f56c6c;
}

.error-list {
  margin-top: 20px;
}

.error-list h4 {
  margin: 0 0 10px;
  color: #f56c6c;
}
</style> 