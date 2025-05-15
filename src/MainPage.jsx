import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Space, message } from 'antd';

const { Title, Text } = Typography;

function MainPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    message.success("Çıkış yapıldı.");
    navigate('/');
  };

  const handleListFields = () => navigate('/fields');
  const handleMyFields = () => navigate('/my-fields');
  const handleMyAppointments = () => navigate('/appointments');

  if (!user) return null;

  return (
    <div style={styles.page}>
      <Card style={styles.card}>
        <Title level={2}>Merhaba, {user.Name}</Title>
        <Text strong>E-posta: {user.Email}</Text>

        <Space direction="vertical" size="middle" style={{ marginTop: 24, width: '100%' }}>
          <Button type="primary" block onClick={handleListFields}>
            Halı Sahaları Listele
          </Button>
          <Button type="default" block onClick={handleMyFields}>
            Halı Sahalarım
          </Button>
          <Button type="default" block onClick={handleMyAppointments}>
            Randevularım
          </Button>
        </Space>

        <Button
          type="primary"
          danger
          onClick={handleLogout}
          style={{ marginTop: 24, width: '100%' }}
        >
          Çıkış Yap
        </Button>
      </Card>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: 400,
    padding: 32,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center'
  }
};

export default MainPage;
