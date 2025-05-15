import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';

const { Title } = Typography;

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const TransferToMain = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/main');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        "https://v1.nocodeapi.com/berfin/google_sheets/srbQdbpLowexdRgA?tabId=Sheet1"
      );
      const json = await res.json();

      const sheetData = json.data;

      if (Array.isArray(sheetData)) {
        const user = sheetData.find(
          (row) => row.Email === email && row.Password === password
        );

        if (user) {
          setSuccess('Giriş başarılı!');
          TransferToMain(user);
        } else {
          setError('Geçersiz e-posta veya şifre.');
        }
      }
    } catch (err) {
      setError('Giriş başarısız. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div style={styles.page}>
      <Card style={styles.card}>
        <Title level={2}>Giriş Yap</Title>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="E-posta" name="email" rules={[{ required: true, message: 'Lütfen e-posta girin!' }]}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="E-posta adresiniz"
            />
          </Form.Item>

          <Form.Item label="Şifre" name="password" rules={[{ required: true, message: 'Lütfen şifre girin!' }]}>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifreniz"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Giriş Yap
            </Button>
            <p></p>
            <Button block onClick={() => navigate('/')}>Geri Dön</Button>
          </Form.Item>
        </Form>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />}
        {success && <Alert message={success} type="success" showIcon />}
      </Card>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f0f2f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: 400,
    padding: 32,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
};

export default LoginPage;
