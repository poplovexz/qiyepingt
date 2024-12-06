<template>
  <div class="category-list">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增分类</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="categories"
      border
      row-key="id"
      style="width: 100%"
    >
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分类表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="categoryForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" />
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

interface Category {
  id: number;
  name: string;
  sort: number;
}

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref<FormInstance>();
const categories = ref<Category[]>([]);

const categoryForm = reactive({
  id: 0,
  name: '',
  sort: 0
});

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
};

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/categories');
    categories.value = response.data;
  } catch (error) {
    ElMessage.error('获取分类列表失败');
  } finally {
    loading.value = false;
  }
};

// 新增分类
const handleAdd = () => {
  dialogType.value = 'add';
  Object.assign(categoryForm, {
    id: 0,
    name: '',
    sort: 0
  });
  dialogVisible.value = true;
};

// 编辑分类
const handleEdit = (row: Category) => {
  dialogType.value = 'edit';
  Object.assign(categoryForm, row);
  dialogVisible.value = true;
};

// 删除分类
const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      type: 'warning'
    });
    await request.delete(`/api/categories/${row.id}`);
    ElMessage.success('删除成功');
    fetchCategories();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (dialogType.value === 'add') {
          await request.post('/api/categories', categoryForm);
          ElMessage.success('新增成功');
        } else {
          await request.put(`/api/categories/${categoryForm.id}`, categoryForm);
          ElMessage.success('更新成功');
        }
        dialogVisible.value = false;
        fetchCategories();
      } catch (error) {
        ElMessage.error(dialogType.value === 'add' ? '新增失败' : '更新失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-list {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}
</style> 