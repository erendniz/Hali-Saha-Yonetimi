import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Input,
  Button,
  DatePicker,
  Select,
  Table,
  message,
  Typography,
  Row,
  Col,
  Divider,
  Card,
  Tooltip
} from 'antd';
import { useCart } from './CartContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

const FIELDS_API_URL = "https://v1.nocodeapi.com/berfin/google_sheets/bXwZXxDEvgwGzfak?tabId=Sheet1";
const APPOINTMENTS_API_URL = "https://v1.nocodeapi.com/berfin/google_sheets/iyTnIPGexECVBPUR?tabId=Sheet1";

function FieldsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', city: '', date: null });
  const [reservation, setReservation] = useState({ time: '', duration: '1' });
  const { cartItems, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return navigate('/');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [fieldsRes, appointmentsRes] = await Promise.all([
        fetch(FIELDS_API_URL),
        fetch(APPOINTMENTS_API_URL)
      ]);
      const fieldsJson = await fieldsRes.json();
      const appointmentsJson = await appointmentsRes.json();

      setFields(fieldsJson.data);
      setFilteredFields(fieldsJson.data);
    } catch (err) {
      console.error('Veri alınırken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const name = search.name.toLowerCase();
    const city = search.city.toLowerCase();
    const selectedDate = search.date ? search.date.format('YYYY-MM-DD') : null;

    const filtered = fields.filter(f => {
      const nameMatch = f.FieldName.toLowerCase().includes(name);
      const cityMatch = f.City.toLowerCase().includes(city);
      const dateMatch = !selectedDate || !f.LastDate || selectedDate <= dayjs(f.LastDate).format('YYYY-MM-DD');
      return nameMatch && cityMatch && dateMatch;
    });

    setFilteredFields(filtered);
  };

  const handleAddToCart = async (field) => {
    const { FieldName, Price, Start, Finish, OwnerEmail } = field;
    const { date } = search;
    const { time, duration } = reservation;

    if (!date || !time || !duration) {
      return message.warning("Lütfen tarih, saat ve süre seçin.");
    }

    const fieldLastDate = field.LastDate ? dayjs(field.LastDate) : null;
    if (fieldLastDate && date.isAfter(fieldLastDate, 'day')) {
    return message.error("Bu tarih, sahanın son rezervasyon tarihinden sonra. Lütfen geçerli bir tarih seçin.");
    }


    if (OwnerEmail && user?.Email && OwnerEmail.toLowerCase() === user.Email.toLowerCase()) {
      return message.error("Kendi halı sahanıza rezervasyon yapamazsınız.");
    }

    const selectedDate = date.format('YYYY-MM-DD');
    const newStart = parseInt(time.split(':')[0]);
    const newEnd = newStart + parseInt(duration);

    const fieldStart = parseInt(Start);
    const fieldFinish = parseInt(Finish);

    if (newStart < fieldStart || newEnd > fieldFinish) {
      return message.error(`Bu saha yalnızca ${fieldStart}:00 - ${fieldFinish}:00 saatleri arasında rezerve edilebilir.`);
    }

    const isConflictInCart = cartItems.some(item => {
      if (item.FieldName === FieldName && item.Date === selectedDate) {
        const existingStart = parseInt(item.Time.split(':')[0]);
        const existingEnd = existingStart + parseInt(item.Duration);
        return (newStart < existingEnd) && (newEnd > existingStart);
      }
      return false;
    });

    if (isConflictInCart) {
      return message.error("Bu saat aralığı için sepette mevcut bir rezervasyon var.");
    }

    try {
      const res = await fetch(APPOINTMENTS_API_URL);
      const json = await res.json();
      const appointments = json.data;

      const isConflictInSheets = appointments.some(item => {
        const itemFieldName = item.fieldName?.trim();
        const itemDate = item.date?.trim();
        const itemTime = item.time?.trim();
        const itemDuration = item.duration?.trim();

        if (itemFieldName === FieldName && itemDate === selectedDate) {
          const existingStart = parseInt(itemTime.split(':')[0], 10);
          const existingEnd = existingStart + parseInt(itemDuration, 10);
          return (newStart < existingEnd) && (newEnd > existingStart);
        }
        return false;
      });

      if (isConflictInSheets) {
        return message.error("Bu saat aralığı mevcut bir rezervasyonla çakışıyor.");
      }

      const reservationItem = {
        FieldName,
        Date: selectedDate,
        Time: time,
        Duration: duration,
        Price,
        User: user.Name
      };

      addToCart(reservationItem);
      message.success("Rezervasyon sepete eklendi.");
    } catch (err) {
      console.error("Veri alınırken hata:", err);
      message.error("Rezervasyon kontrolü sırasında hata oluştu.");
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return times;
  };

  const calculateEndTime = () => {
    const { time, duration } = reservation;
    if (!time || !duration) return '';
    const start = parseInt(time.split(':')[0]);
    const end = start + parseInt(duration);
    return `${end.toString().padStart(2, '0')}:00`;
  };

  const fieldColumns = [
    { title: 'İsim', dataIndex: 'FieldName', key: 'name' },
    { title: 'Şehir', dataIndex: 'City', key: 'city' },
    { title: 'Süre', dataIndex: 'Period', key: 'period' },
    { title: 'Fiyat', dataIndex: 'Price', key: 'price' },
    { title: 'Başlangıç', dataIndex: 'Start', render: t => `${t}:00` },
    { title: 'Bitiş', dataIndex: 'Finish', render: t => `${t}:00` },
    { title: 'Son Yayın Tarihi', dataIndex: 'LastDate', key: 'lastdate' },
    {
      title: 'İşlem',
      key: 'action',
      render: (_, field) => {
        const isOwner = user?.Email && field.OwnerEmail && user.Email.toLowerCase() === field.OwnerEmail.toLowerCase();
        return (
          <Tooltip title={isOwner ? 'Kendi halı sahanıza rezervasyon yapamazsınız.' : ''}>
            <Button
              type="primary"
              onClick={() => handleAddToCart(field)}
              disabled={isOwner}
              style={{ opacity: isOwner ? 0.5 : 1, cursor: isOwner ? 'not-allowed' : 'pointer' }}
            >
              Sepete Ekle
            </Button>
          </Tooltip>
        );
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <Title level={2}>Halı Sahalar</Title>
      <Text strong>Kullanıcı: {user?.Name}</Text>

      <Divider />

      <Row gutter={[16, 16]} justify="start">
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="İsim ara"
            value={search.name}
            onChange={e => setSearch({ ...search, name: e.target.value })}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Şehir ara"
            value={search.city}
            onChange={e => setSearch({ ...search, city: e.target.value })}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DatePicker
            placeholder="Tarih Seç"
            style={{ width: '100%' }}
            onChange={date => setSearch({ ...search, date })}
            disabledDate={current => current && current < dayjs().startOf('day')}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button onClick={handleSearch} type="default" block>Ara</Button>
        </Col>
      </Row>

      <Divider />

      <Card title="Rezervasyon Bilgileri" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Saat Seç"
              style={{ width: '100%' }}
              onChange={value => setReservation({ ...reservation, time: value })}
            >
              {generateTimeOptions().map(time => (
                <Option key={time} value={time}>{time}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              defaultValue="1"
              style={{ width: '100%' }}
              onChange={value => setReservation({ ...reservation, duration: value })}
            >
              <Option value="1">1 Saat</Option>
              <Option value="2">2 Saat</Option>
              <Option value="3">3 Saat</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} style={{ display: 'flex', alignItems: 'center' }}>
            {reservation.time && reservation.duration && (
              <Text>Seçilen Süre: {reservation.time} - {calculateEndTime()}</Text>
            )}
          </Col>
        </Row>
      </Card>

      <Table
        loading={loading}
        dataSource={filteredFields}
        columns={fieldColumns}
        rowKey={(record, index) => index}
        pagination={{ pageSize: 5 }}
      />

      <Divider />

      <Title level={4}>Sepet</Title>
      {cartItems.length === 0 ? (
        <Text>Sepet boş</Text>
      ) : (
        <Table
          dataSource={cartItems}
          rowKey={(item, index) => index}
          pagination={false}
          columns={[
            { title: 'Saha', dataIndex: 'FieldName' },
            { title: 'Tarih', dataIndex: 'Date' },
            { title: 'Saat', dataIndex: 'Time' },
            { title: 'Süre', dataIndex: 'Duration', render: d => `${d} saat` },
            { title: 'Fiyat', dataIndex: 'Price' },
            {
              title: 'İşlem',
              render: (_, __, index) => (
                <Button danger onClick={() => removeFromCart(index)}>Sil</Button>
              )
            }
          ]}
        />
      )}

      <Divider />

      <Row justify="space-between">
        <Col>
          <Button onClick={() => navigate('/main')}>Geri Dön</Button>
        </Col>
        <Col>
          <Button
            type="primary"
            disabled={cartItems.length === 0}
            onClick={() => navigate('/cart')}
          >
            Ödeme Sayfasına Git
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default FieldsPage;
