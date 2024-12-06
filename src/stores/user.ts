import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  companyId?: number;
  isAdmin: boolean;
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const currentUser = ref<UserInfo | null>(null);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => currentUser.value?.isAdmin || false);

  async function login(username: string, password: string) {
    try {
      const response = await request.post('/api/auth/login', {
        username,
        password
      });

      token.value = response.data.token;
      localStorage.setItem('token', response.data.token);
      
      await fetchCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await request.get('/api/auth/me');
      currentUser.value = response.data;
    } catch (error) {
      logout();
    }
  }

  function logout() {
    token.value = null;
    currentUser.value = null;
    localStorage.removeItem('token');
  }

  return {
    token,
    currentUser,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    fetchCurrentUser
  };
}); 