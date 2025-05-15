import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Table, Button, Modal, Typography, Spin, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;

const APPOINTMENTS_API_URL = "https://v1.nocodeapi.com/berfin/google_sheets/iyTnIPGexECVBPUR?tabId=Sheet1";

function AppointmentsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return navigate('/');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchAppointments(parsedUser.Name);
  }, [navigate]);

  const fetchAppointments = async (customerName) => {
    try {
      const res = await fetch(APPOINTMENTS_API_URL);
      const json = await res.json();
      const data = json.data || [];

      const userAppointments = data
        .map((row, index) => ({ ...row, _rowIndex: index + 2 }))
        .filter(row => row.user === customerName);

      setAppointments(userAppointments);
    } catch (err) {
      console.error("Randevular alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = (rowIndex) => {
  confirm({
    title: 'Randevuyu silmek istediğinize emin misiniz?',
    icon: <ExclamationCircleOutlined />,
    okText: 'Evet',
    cancelText: 'İptal',
    onOk: async () => {
      try {
        setLoading(true);
        await fetch(`${APPOINTMENTS_API_URL}&row_id=${rowIndex}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        message.success("Randevunuz başarıyla iptal edildi.");
        await fetchAppointments(user.Name);
      } catch (error) {
        console.error('Randevu silme hatası:', error);
        message.error("Randevu silinirken bir hata oluştu.");
        setLoading(false);
      }
    }
  });
};

  const columns = [
    { title: 'Saha', dataIndex: 'fieldName', key: 'fieldName' },
    { title: 'Tarih', dataIndex: 'date', key: 'date' },
    { title: 'Başlangıç Saati', dataIndex: 'time', key: 'time' },
    { title: 'Süre (saat)', dataIndex: 'duration', key: 'duration' },
    {
      title: 'İşlem',
      key: 'actions',
      render: (_, record) => (
        <Button danger onClick={() => handleDeleteAppointment(record._rowIndex)}>
          Sil
        </Button>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
      <Title level={2}>Randevularım</Title>
      {user && <Text strong>Kullanıcı: {user.Name}</Text>}

      {loading ? (
        <Spin size="large" style={{ marginTop: 50 }} />
      ) : appointments.length === 0 ? (
        <p style={{ marginTop: 30 }}>Hiç randevunuz yok.</p>
      ) : (
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_rowIndex"
          style={{ marginTop: 30 }}
          pagination={{ pageSize: 6 }}
        />
      )}

      <Button type="primary" onClick={() => navigate('/main')} style={{ marginTop: 30 }}>
        Geri Dön
      </Button>
    </div>
  );
}

export default AppointmentsPage;