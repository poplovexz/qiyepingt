<template>
  <div class="user-management">
    <div class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="企业">
          <el-select 
            v-model="searchForm.companyId" 
            placeholder="选择企业"
            clearable
          >
            <el-option
              v-for="company in companies"
              :key="company.id"
              :label="company.companyName"
              :value="company.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleAdd">添加用户</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="users"
      border
      style="width: 100%"
    >
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="companyName" label="所属企业" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'">
            {{ row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleResetPassword(row)">
            重置密码
          </el-button>
          <el-button 
            :type="row.isActive ? 'danger' : 'success'" 
            link
            @click="handleToggleStatus(row)"
          >
            {{ row.isActive ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加用户"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="所属企业" prop="companyId">
          <el-select v-model="userForm.companyId" placeholder="请选择企业">
            <el-option
              v-for="company in companies"
              :key="company.id"
              :label="company.companyName"
              :value="company.id"
            />
          </el-select>
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

interface User {
  id: number;
  username: string;
  email: string;
  companyId: number;
  companyName: string;
  isActive: boolean;
}

interface Company {
  id: number;
  companyName: string;
}

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const users = ref<User[]>([]);
const companies = ref<Company[]>([]);

const searchForm = reactive({
  companyId: '',
  username: ''
});

const userForm = reactive({
  username: '',
  email: '',
  companyId: ''
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  companyId: [
    { required: true, message: '请选择所属企业', trigger: 'change' }
  ]
};

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/users', {
      params: searchForm
    });
    users.value = response.data;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取企业列表
const fetchCompanies = async () => {
  try {
    const response = await request.get('/api/companies');
    companies.value = response.data;
  } catch (error) {
    ElMessage.error('获取企业列表失败');
  }
};

// 搜索
const handleSearch = () => {
  fetchUsers();
};

// 重置搜索
const resetSearch = () => {
  searchForm.companyId = '';
  searchForm.username = '';
  fetchUsers();
};

// 添加用户
const handleAdd = () => {
  userForm.username = '';
  userForm.email = '';
  userForm.companyId = '';
  dialogVisible.value = true;
};

// 重置密码
const handleResetPassword = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      '确定要重置该用户的密码吗？新密码将发送至用户邮箱。',
      '提示',
      { type: 'warning' }
    );
    await request.post(`/api/users/${user.id}/reset-password`);
    ElMessage.success('密码重置成功，新密码已发送至用户邮箱');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密码重置失败');
    }
  }
};

// 切换用户状态
const handleToggleStatus = async (user: User) => {
  try {
    await request.put(`/api/users/${user.id}/toggle-status`);
    ElMessage.success('状态更新成功');
    fetchUsers();
  } catch (error) {
    ElMessage.error('状态更新失败');
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        await request.post('/api/users', userForm);
        ElMessage.success('添加成功，登录信息已发送至用户邮箱');
        dialogVisible.value = false;
        fetchUsers();
      } catch (error) {
        ElMessage.error('添加失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchCompanies();
  fetchUsers();
});
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
</style> 