from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from .models.user import User
from .models.company import Company
from .models.product import Product
from .decorators.auth_decorator import admin_required, login_required

@app.route('/api/auth/login', methods=['POST'])
def login():
    # 用户登录
    pass

@app.route('/api/companies', methods=['POST'])
@admin_required
def create_company():
    # 创建企业
    pass

@app.route('/api/companies/<int:company_id>/users/bulk', methods=['POST'])
@admin_required
def bulk_register_users():
    # 批量注册用户
    pass

@app.route('/api/products', methods=['POST'])
@login_required
def create_product():
    # 创建商品
    pass

@app.route('/api/companies/<int:company_id>/products', methods=['GET'])
@login_required
def get_company_products():
    # 获取企业商品列表
    pass