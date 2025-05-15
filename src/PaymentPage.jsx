import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message, Select, InputNumber } from 'antd';
import { useState, useEffect } from 'react';
import { useCart } from './CartContext';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const APPOINTMENTS_API_URL = "https://v1.nocodeapi.com/berfin/google_sheets/iyTnIPGexECVBPUR?tabId=Sheet1";

function PaymentPage({ cart, setCart, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] };
  const { clearCart } = useCart();

  const [form] = Form.useForm();
  const [showVerification, setShowVerification] = useState(false);
  const [countdown, setCountdown] = useState(180);

  useEffect(() => {
    let timer;
    if (showVerification && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showVerification, countdown]);

  const handlePayment = (values) => {
    if (values.email !== user?.Email) {
      message.error("Girdiğiniz e-posta, giriş yapan kullanıcıyla eşleşmiyor.");
      return;
    }
    setShowVerification(true);
  };

  const handleVerification = async () => {
    const appointments = cartItems.map(item => ([
      item.FieldName,
      item.Date,
      item.Time,
      user?.Name,
      item.Duration
    ]));

    try {
      const response = await fetch(APPOINTMENTS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointments)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sunucu hatası: ${response.status} - ${errorText}`);
      }

      message.success("Ödeme ve e-posta doğrulama başarılı! Rezervasyonlar eklendi.");
      clearCart();
      navigate('/fields');
    } catch (err) {
      console.error("Rezervasyon hatası:", err);
      message.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  // Ay ve yıl seçenekleri oluşturuluyor
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 2050 - currentYear + 1 }, (_, i) => currentYear + i);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <Card bordered>
        {!showVerification ? (
          <>
            <Title level={3}>Ödeme Sayfası</Title>

            <Form layout="vertical" form={form} onFinish={handlePayment}>
              <Form.Item
                label="E-posta"
                name="email"
                rules={[
                  { required: true, message: 'Lütfen e-posta adresinizi girin' },
                  {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Geçerli bir e-posta adresi girin'
                  }
                ]}
              >
                <Input placeholder="ornek@example.com" />
              </Form.Item>

              <Form.Item
                label="Kart Numarası"
                name="cardNumber"
                rules={[{ required: true, message: 'Lütfen kart numarasını girin' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  maxLength={16}
                  controls={false}
                  placeholder="1234567812345678"
                  max={9999999999999999}
                />
              </Form.Item>

              <Form.Item
                label="Son Kullanma Tarihi"
                required
              >
                <Input.Group compact>
                  <Form.Item
                    name="expiryMonth"
                    noStyle
                    rules={[{ required: true, message: 'Ay gerekli' }]}
                  >
                    <Select placeholder="Ay" style={{ width: '50%' }}>
                      {months.map(month => (
                        <Option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="expiryYear"
                    noStyle
                    rules={[{ required: true, message: 'Yıl gerekli' }]}
                  >
                    <Select placeholder="Yıl" style={{ width: '50%' }}>
                      {years.map(year => (
                        <Option key={year} value={year.toString()}>
                          {year}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Input.Group>
              </Form.Item>

              <Form.Item
                label="CVV"
                name="cvv"
                rules={[{ required: true, message: 'Lütfen CVV girin' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  maxLength={3}
                  controls={false}
                  placeholder="123"
                  max={999}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Ödemeyi Tamamla
                </Button>
                <p></p>
                <Button block onClick={() => navigate('/cart')}>Geri Dön</Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <>
            <Title level={4}>E-posta Doğrulama</Title>
            <Paragraph>Lütfen e-posta adresinize gönderilen kodu girin.</Paragraph>
            <Paragraph><strong>Kalan Süre:</strong> {countdown} saniye</Paragraph>

            <Input placeholder="Doğrulama kodu" />
            <Button type="primary" onClick={handleVerification} style={{ marginTop: 16 }}>
              Doğrula ve Rezervasyonu Tamamla
            </Button>
            <p></p>
            <Button size="large" onClick={() => navigate('/cart')}>Geri Dön</Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default PaymentPage;
