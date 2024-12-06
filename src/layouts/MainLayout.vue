<template>
  <el-container>
    <el-aside width="200px">
      <el-menu
        :router="true"
        :default-active="$route.path"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <template v-if="userStore.isAdmin">
          <el-menu-item index="/admin/companies">
            <el-icon><Office /></el-icon>
            <span>企业管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </template>
        
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/company-profile">
          <el-icon><Office /></el-icon>
          <span>企业信息</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-right">
          <span>{{ userStore.currentUser?.username }}</span>
          <el-button @click="logout">退出</el-button>
        </div>
      </el-header>
      
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const logout = async () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-end;
}
</style> 