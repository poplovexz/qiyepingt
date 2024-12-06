<template>
  <div class="product-list">
    <div class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入商品名称" 
            clearable 
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="toolbar-right">
        <el-button @click="showImport">批量导入</el-button>
        <el-button type="primary" @click="handleAdd">新增商品</el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="products"
      border
      style="width: 100%"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="product-images">
            <el-image
              v-for="img in row.images"
              :key="img.id"
              :src="img.url"
              :preview-src-list="row.images.map(i => i.url)"
              fit="cover"
              class="product-image"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="150" />
      <el-table-column prop="price" label="价格" width="120">
        <template #default="{ row }">
          ¥{{ row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="商品描述" show-overflow-tooltip />
      <el-table-column prop="categoryName" label="商品分类" width="120" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 商品表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="productForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number 
            v-model="productForm.price"
            :precision="2"
            :step="0.1"
            :min="0"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            ref="uploadRef"
            action="/api/upload"
            list-type="picture-card"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            :file-list="fileList"
            multiple
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
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

    <ProductImport
      v-model:visible="importVisible"
      :categories="categories"
      @success="fetchProducts"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance, UploadInstance, UploadProps, UploadUserFile } from 'element-plus';
import request from '@/utils/request';
import ProductImport from '@/components/ProductImport.vue';

interface ProductImage {
  id: number;
  url: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: ProductImage[];
  categoryId: number;
}

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref<FormInstance>();
const uploadRef = ref<UploadInstance>();
const products = ref<Product[]>([]);
const fileList = ref<UploadUserFile[]>([]);
const categories = ref<{ id: number; name: string; }[]>([]);
const importVisible = ref(false);

const searchForm = reactive({
  name: ''
});

const productForm = reactive({
  id: 0,
  name: '',
  price: 0,
  description: '',
  imageIds: [] as number[],
  categoryId: 0
});

const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ]
};

const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
};

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/products', {
      params: searchForm
    });
    products.value = response.data;
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  fetchProducts();
};

// 重置搜索
const resetSearch = () => {
  searchForm.name = '';
  fetchProducts();
};

// 新增商品
const handleAdd = () => {
  dialogType.value = 'add';
  Object.assign(productForm, {
    id: 0,
    name: '',
    price: 0,
    description: '',
    imageIds: [],
    categoryId: 0
  });
  fileList.value = [];
  dialogVisible.value = true;
};

// 编辑商品
const handleEdit = (row: Product) => {
  dialogType.value = 'edit';
  Object.assign(productForm, {
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description,
    imageIds: row.images.map(img => img.id),
    categoryId: row.categoryId
  });
  fileList.value = row.images.map(img => ({
    name: img.url.split('/').pop() || '',
    url: img.url
  }));
  dialogVisible.value = true;
};

// 删除商品
const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      type: 'warning'
    });
    await request.delete(`/api/products/${row.id}`);
    ElMessage.success('删除成功');
    fetchProducts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 上传相关方法
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return false;
  }
  return true;
};

const handleUploadSuccess = (response: any) => {
  productForm.imageIds.push(response.data.id);
  ElMessage.success('上传成功');
};

const handleUploadError = () => {
  ElMessage.error('上传失败');
};

const handleRemove = (file: UploadUserFile) => {
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    productForm.imageIds.splice(index, 1);
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
          await request.post('/api/products', productForm);
          ElMessage.success('新增成功');
        } else {
          await request.put(`/api/products/${productForm.id}`, productForm);
          ElMessage.success('更新成功');
        }
        dialogVisible.value = false;
        fetchProducts();
      } catch (error) {
        ElMessage.error(dialogType.value === 'add' ? '新增失败' : '更新失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await request.get('/api/categories');
    categories.value = response.data;
  } catch (error) {
    ElMessage.error('获取分类列表失败');
  }
};

const showImport = () => {
  importVisible.value = true;
};

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.product-images {
  padding: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  object-fit: cover;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}
</style> 