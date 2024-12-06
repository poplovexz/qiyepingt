<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>企业信息</span>
              <el-button 
                v-if="!userStore.isAdmin"
                type="primary" 
                link
                @click="handleEdit"
              >
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import request from '@/utils/request';
import type { Company } from '@/types';

const userStore = useUserStore();

const companyInfo = ref<Company>({
  id: 0,
  companyName: '',
  description: '',
  contactInfo: ''
});

const statistics = ref({
  productCount: 0
});

const handleEdit = () => {
  // 实现编辑企业信息的逻辑
};

const fetchCompanyInfo = async () => {
  try {
    const response = await request.get('/api/company/info');
    companyInfo.value = response.data;
  } catch (error) {
    console.error('获取企业信息失败:', error);
  }
};

const fetchStatistics = async () => {
  try {
    const response = await request.get('/api/statistics');
    statistics.value = response.data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

onMounted(() => {
  fetchCompanyInfo();
  fetchStatistics();
});
</script>

<style scoped>
.home-container {
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