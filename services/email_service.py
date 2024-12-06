class EmailService:
    def __init__(self, config):
        self.smtp_config = config
        
    def send_credentials_email(self, email, username, password):
        # 发送包含登录凭证的邮件
        
    def send_welcome_email(self, email, company_name):
        # 发送欢迎邮件