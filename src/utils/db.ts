import pool from '@/config/database';
import { QueryResult } from 'pg';

export default {
  async query(text: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('执行查询', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('数据库查询错误', error);
      throw error;
    }
  },

  async getClient() {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    // 设置超时自动释放
    const timeout = setTimeout(() => {
      console.error('客户端连接超时');
      release();
    }, 5000);

    // 监控查询执行
    client.query = (...args: any[]) => {
      client.lastQuery = args[0];
      return query.apply(client, args);
    };

    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };

    return client;
  }
};