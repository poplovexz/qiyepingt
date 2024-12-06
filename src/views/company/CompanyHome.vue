<template>
  <div class="company-home">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="company-info">
          <template #header>
            <div class="card-header">
              <span>企业信息</span>
              <el-button type="primary" link @click="handleEdit">
                编辑
              </el-button>
            </div>
          </template>
          <div class="info-item">
            <label>企业名称：</label>
            <span>{{ companyInfo.companyName }}</span>
          </div>
          <div class="info-item">
            <label>联系方式：</label>
            <span>{{ companyInfo.contactInfo }}</span>
          </div>
          <div class="info-item">
            <label>企业介绍：</label>
            <p>{{ companyInfo.description }}</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>数据统计</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <h3>商品总数</h3>
                <p class="stat-number">{{ statistics.productCount }}</p>
              </div>
            </el-col>
            <!-- 可以添加更多统计数据 -->
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑企业信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑企业信息"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="companyForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="企业名称" prop="companyName">
          <el-input v-model="companyForm.companyName" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contactInfo">
          <el-input v-model="companyForm.contactInfo" />
        </el-form-item>
        <el-form-item label="企业介绍" prop="description">
          <el-input
            v-model="companyForm.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import request from '@/utils/request';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const submitLoading = ref(false);

const companyInfo = ref({
  id: 0,
  companyName: '',
  contactInfo: '',
  description: ''
});

const statistics = ref({
  productCount: 0
});

const companyForm = reactive({
  companyName: '',
  contactInfo: '',
  description: ''
});

const rules = {
  companyName: [
    { required: true, message: '请输入企业名称', trigger: 'blur' }
  ],
  contactInfo: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ]
};

// 获取企业信息
const fetchCompanyInfo = async () => {
  try {
    const response = await request.get('/api/company/info');
    companyInfo.value = response.data;
  } catch (error) {
    ElMessage.error('获取企业信息失败');
  }
};

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await request.get('/api/company/statistics');
    statistics.value = response.data;
  } catch (error) {
    ElMessage.error('获取统计数据失败');
  }
};

// 编辑企业信息
const handleEdit = () => {
  Object.assign(companyForm, {
    companyName: companyInfo.value.companyName,
    contactInfo: companyInfo.value.contactInfo,
    description: companyInfo.value.description
  });
  dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        await request.put(`/api/companies/${companyInfo.value.id}`, companyForm);
        ElMessage.success('更新成功');
        dialogVisible.value = false;
        fetchCompanyInfo();
      } catch (error) {
        ElMessage.error('更新失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchCompanyInfo();
  fetchStatistics();
});
</script>

<style scoped>
.company-home {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item {
  margin-bottom: 15px;
}

.info-item label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.info-item p {
  margin: 10px 0;
  white-space: pre-wrap;
  line-height: 1.6;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin: 10px 0;
}
</style> 