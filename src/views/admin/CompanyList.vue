<template>
  <div class="company-list">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        新增企业
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="companies"
      border
      style="width: 100%"
    >
      <el-table-column prop="companyName" label="企业名称" />
      <el-table-column prop="contactInfo" label="联系方式" />
      <el-table-column prop="description" label="企业介绍" show-overflow-tooltip />
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="primary" link @click="handleUsers(row)">
            用户管理
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 企业表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增企业' : '编辑企业'"
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
            :rows="3"
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
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import request from '@/utils/request';

interface Company {
  id: number;
  companyName: string;
  contactInfo: string;
  description: string;
}

const loading = ref(false);
const companies = ref<Company[]>([]);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

const companyForm = reactive({
  id: 0,
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

// 获取企业列表
const fetchCompanies = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/companies');
    companies.value = response.data;
  } catch (error) {
    ElMessage.error('获取企业列表失败');
  } finally {
    loading.value = false;
  }
};

// 新增企业
const handleAdd = () => {
  dialogType.value = 'add';
  Object.assign(companyForm, {
    id: 0,
    companyName: '',
    contactInfo: '',
    description: ''
  });
  dialogVisible.value = true;
};

// 编辑企业
const handleEdit = (row: Company) => {
  dialogType.value = 'edit';
  Object.assign(companyForm, row);
  dialogVisible.value = true;
};

// 删除企业
const handleDelete = async (row: Company) => {
  try {
    await ElMessageBox.confirm('确定要删除该企业吗？', '提示', {
      type: 'warning'
    });
    await request.delete(`/api/companies/${row.id}`);
    ElMessage.success('删除成功');
    fetchCompanies();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 跳转到用户管理
const handleUsers = (row: Company) => {
  // 实现跳转到用户管理页面的逻辑
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (dialogType.value === 'add') {
          await request.post('/api/companies', companyForm);
          ElMessage.success('新增成功');
        } else {
          await request.put(`/api/companies/${companyForm.id}`, companyForm);
          ElMessage.success('更新成功');
        }
        dialogVisible.value = false;
        fetchCompanies();
      } catch (error) {
        ElMessage.error(dialogType.value === 'add' ? '新增失败' : '更新失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchCompanies();
});
</script>

<style scoped>
.company-list {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}
</style> 