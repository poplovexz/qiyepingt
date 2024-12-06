// 定义通用接口
export interface User {
  id: number;
  username: string;
  email: string;
  companyId?: number;
  isAdmin: boolean;
}

export interface Company {
  id: number;
  companyName: string;
  description?: string;
  contactInfo?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  companyId: number;
}