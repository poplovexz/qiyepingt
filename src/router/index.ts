import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'admin',
        meta: { requiresAdmin: true },
        children: [
          {
            path: 'companies',
            name: 'CompanyList',
            component: () => import('@/views/admin/CompanyList.vue')
          },
          {
            path: 'users',
            name: 'UserManagement',
            component: () => import('@/views/admin/UserManagement.vue')
          }
        ]
      },
      {
        path: 'products',
        name: 'ProductList',
        component: () => import('@/views/company/ProductList.vue')
      },
      {
        path: 'company-profile',
        name: 'CompanyProfile',
        component: () => import('@/views/company/CompanyProfile.vue'),
        meta: { title: '企业信息' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else if (requiresAdmin && !userStore.isAdmin) {
    next('/');
  } else {
    next();
  }
});

export default router; 