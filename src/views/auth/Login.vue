<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>企业管理系统</h2>
      </template>
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入用户名"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

// 从localStorage获取保存的用户名和密码
const savedUsername = localStorage.getItem('rememberedUsername');
const savedPassword = localStorage.getItem('rememberedPassword');

const loginForm = reactive({
  username: savedUsername || '',
  password: savedPassword || '',
  remember: !!savedUsername
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const success = await userStore.login(loginForm.username, loginForm.password);
        if (success) {
          // 处理记住密码
          if (loginForm.remember) {
            localStorage.setItem('rememberedUsername', loginForm.username);
            localStorage.setItem('rememberedPassword', loginForm.password);
          } else {
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberedPassword');
          }

          ElMessage.success('登录成功');
          // 根据用户角色跳转到不同页面
          if (userStore.isAdmin) {
            router.push('/admin/companies');
          } else {
            router.push('/company-profile');
          }
        } else {
          ElMessage.error('用户名或密码错误');
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

:deep(.el-card__header) {
  text-align: center;
  padding: 20px;
}

h2 {
  margin: 0;
  color: #303133;
}

.el-form {
  padding: 20px 20px 0;
}
</style> 