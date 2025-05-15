import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const { name, email, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      message.error('Şifreler uyuşmuyor');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      message.error('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      const data = [
        name,  
        email,
        password,
      ];

      const res = await fetch(
        "https://v1.nocodeapi.com/erennn/google_sheets/evgRokrrOubzKSGj?tabId=Sheet1",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([data]), 
        }
      );

      if (res.status === 200) {
        message.success('Kayıt başarılı!');
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        console.error("Hata:", errorData);
      }
    } catch (err) {
      message.error('Kayıt başarısız. Bağlantınızı kontrol edin.');
      console.error('Fetch hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Kayıt Ol</Title>
      <Form
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label="Ad Soyad"
          name="name"
          rules={[{ required: true, message: 'Lütfen adınızı girin!' }]}
        >
          <Input placeholder="Adınız Soyadınız" />
        </Form.Item>

        <Form.Item
          label="E-posta"
          name="email"
          rules={[
            { required: true, message: 'Lütfen e-posta adresinizi girin!' },
            { type: 'email', message: 'Geçerli bir e-posta adresi girin!' }
          ]}
        >
          <Input placeholder="ornek@eposta.com" />
        </Form.Item>

        <Form.Item
          label="Şifre"
          name="password"
          rules={[{ required: true, message: 'Lütfen bir şifre girin!' }]}
          hasFeedback
        >
          <Input.Password placeholder="Şifreniz" />
        </Form.Item>

        <Form.Item
          label="Şifreyi Onayla"
          name="confirmPassword"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Lütfen şifrenizi tekrar girin!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Şifreler uyuşmuyor!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Şifrenizi tekrar yazın" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Kayıt Ol
          </Button>
          <p></p>
          <Button block onClick={() => navigate('/')}>Geri Dön</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterPage;