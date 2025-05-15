import { useNavigate } from 'react-router-dom';
import { Button, Typography, Space, Card } from 'antd';

const { Title } = Typography;

function HomePage() {
  const navigate = useNavigate();

  const TransferToLogin = () => {
    navigate('/login');
  };

  const TransferToRegister = () => {
    navigate('/register');
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ padding: '40px', textAlign: 'center', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Title level={2}>Halı Saha Rezervasyon</Title>
        <Space direction="vertical" size="large">
          <Button type="primary" size="large" onClick={TransferToLogin} block>
            Giriş Yap
          </Button>
          <Button type="default" size="large" onClick={TransferToRegister} block>
            Kayıt Ol
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default HomePage;
