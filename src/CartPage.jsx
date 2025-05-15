import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Typography, Card } from 'antd';

const { Title } = Typography;

const CartPage = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.Price) || 0), 0);
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { cartItems } });
  };

  const columns = [
    {
      title: 'Saha Adı',
      dataIndex: 'FieldName',
      key: 'fieldName',
    },
    {
      title: 'Tarih',
      dataIndex: 'Date',
      key: 'date',
    },
    {
      title: 'Başlangıç Saati',
      dataIndex: 'Time',
      key: 'time',
    },
    {
      title: 'Süre (saat)',
      dataIndex: 'Duration',
      key: 'duration',
      render: (text) => `${text} Saat`,
    },
    {
      title: 'Fiyat',
      dataIndex: 'Price',
      key: 'price',
      render: (text) => `${text} TL`,
    },
  ];

  if (cartItems.length === 0) {
    return (
      <Card style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
        <Title level={4}>Sepetiniz boş.</Title>
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: 900, margin: '40px auto' }}>
      <Title level={3}>Sepet</Title>

      <Table
        columns={columns}
        dataSource={cartItems.map((item, index) => ({ ...item, key: index }))}
        pagination={false}
      />

      <div style={{ textAlign: 'right', marginTop: 20 }}>
        <Title level={4}>Toplam Fiyat: {calculateTotalPrice()} TL</Title>
        <Button type="primary" size="large" onClick={handleCheckout}>
          Ödeme Sayfasına Git
        </Button>
        <p></p>
        <Button size="large" onClick={() => navigate('/fields')}>Geri Dön</Button>
      </div>
    </Card>
  );
};

export default CartPage;
