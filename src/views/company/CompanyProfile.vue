<template>
  <div class="company-profile">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>企业信息</span>
          <el-button 
            v-if="!isEditing" 
            type="primary" 
            @click="handleEdit"
          >
            编辑
          </el-button>
          <div v-else>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button 
              type="primary" 
              :loading="loading"
              @click="handleSubmit"
            >
              保存
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="!isEditing" class="info-display">
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
      </div>

      <el-form
        v-else
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import request from '@/utils/request';
import { useUserStore } from '@/stores/user';

interface CompanyInfo {
  id: number;
  companyName: string;
  contactInfo: string;
  description: string;
}

const userStore = useUserStore();
const loading = ref(false);
const isEditing = ref(false);
const formRef = ref<FormInstance>();

const companyInfo = ref<CompanyInfo>({
  id: 0,
  companyName: '',
  contactInfo: '',
  description: ''
});

const companyForm = reactive({
  companyName: '',
  contactInfo: '',
  description: ''
});

const rules = {
  companyName: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  contactInfo: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ]
};

// 获取企业信息
const fetchCompanyInfo = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/company/info');
    companyInfo.value = response.data;
  } catch (error) {
    ElMessage.error('获取企业信息失败');
  } finally {
    loading.value = false;
  }
};

// 开始编辑
const handleEdit = () => {
  Object.assign(companyForm, {
    companyName: companyInfo.value.companyName,
    contactInfo: companyInfo.value.contactInfo,
    description: companyInfo.value.description
  });
  isEditing.value = true;
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await request.put(`/api/companies/${companyInfo.value.id}`, companyForm);
        ElMessage.success('更新成功');
        isEditing.value = false;
        fetchCompanyInfo();
      } catch (error) {
        ElMessage.error('更新失败');
      } finally {
        loading.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchCompanyInfo();
});
</script>

<style scoped>
.company-profile {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-display {
  padding: 20px 0;
}

.info-item {
  margin-bottom: 20px;
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
</style> 