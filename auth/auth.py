from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta

class Auth:
    def __init__(self, app):
        self.app = app
        
    def create_user(self, username, password, email, company_id, is_admin=False):
        password_hash = generate_password_hash(password)
        # 插入用户数据
        
    def generate_login_credentials(self, user):
        # 生成随机密码
        # 发送邮件
        
    def login(self, username, password):
        # 验证用户登录
        # 返回JWT token