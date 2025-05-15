import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Form,
  Modal,
  message,
  Typography,
  Space,
  Select,
  DatePicker
} from 'antd';

const { Title } = Typography;

import dayjs from 'dayjs';

const API_URL = "https://v1.nocodeapi.com/berfin/google_sheets/bXwZXxDEvgwGzfak?tabId=Sheet1";
const APPOINTMENTS_API_URL = "https://v1.nocodeapi.com/berfin/google_sheets/iyTnIPGexECVBPUR?tabId=Sheet1";

function MyFieldsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const [appointments, setAppointments] = useState([]);
  const [selectedFieldName, setSelectedFieldName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [form] = Form.useForm();

  const { Option } = Select;

const startTimes = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const finishTimes = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 7;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const durations = [1, 2, 3];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return navigate('/');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchFields(parsedUser.Email);
  }, [navigate]);

  const fetchFields = async (userEmail) => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      const data = json.data || [];

      const userFields = data
        .map((row, index) => ({ ...row, _rowIndex: index + 2 }))
        .filter(row => row.OwnerEmail === userEmail);

      setFields(userFields);
    } catch (err) {
      message.error('Veri çekme hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (values) => {
    try {
      const newField = [[
        values.fieldName.trim(),
        user.Email,
        values.city,
        values.period,
        values.price,
        values.start,
        values.finish,
        values.lastDate.format('YYYY-MM-DD') 
      ]];

      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newField),
      });

      message.success("Halı saha eklendi.");
      form.resetFields();
      fetchFields(user.Email);
    } catch (err) {
      message.error("Halı saha eklenemedi.");
    }
  };

  const handleDeleteField = async (rowIndex, fieldName) => {
  try {

    const res = await fetch(APPOINTMENTS_API_URL);
    const json = await res.json();
    const allAppointments = json.data || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const activeAppointments = allAppointments.filter(app => 
      app.fieldName === fieldName && 
      new Date(app.date) >= today
    );

    if (activeAppointments.length > 0) {
      return message.error("Bu sahada aktif rezervasyonlar olduğu için silemezsiniz.");
    }

    Modal.confirm({
  title: "Halı sahayı silmek istiyor musunuz?",
  onOk: async () => {
    try {
      await fetch(`${API_URL}&row_id=${rowIndex}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      message.success("Saha silindi.");
      
      setTimeout(() => {
        fetchFields(user.Email);
      }, 1000);
      
    } catch (error) {
      message.error("Silme hatası.");
    }
  }
});


  } catch (error) {
    message.error("Rezervasyonlar kontrol edilirken hata oluştu.");
  }
};

  const fetchAppointments = async (fieldName) => {
    try {
      const res = await fetch(APPOINTMENTS_API_URL);
      const json = await res.json();
      const data = json.data || [];

      const fieldAppointments = data
        .map((row, index) => ({ ...row, _rowIndex: index + 2 }))
        .filter(row => row.fieldName === fieldName);

      setAppointments(fieldAppointments);
      setSelectedFieldName(fieldName);
      setIsModalVisible(true);
    } catch (err) {
      message.error("Randevular alınamadı");
    }
  };

  const handleDeleteAppointment = async (rowIndex) => {
    try {
      await fetch(`${APPOINTMENTS_API_URL}&row_id=${rowIndex}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      message.success("Randevu silindi.");
      fetchAppointments(selectedFieldName);
    } catch (error) {
      message.error("Randevu silinemedi.");
    }
  };

  const fieldColumns = [
    { title: 'İsim', dataIndex: 'FieldName', key: 'fieldName' },
    { title: 'Şehir', dataIndex: 'City', key: 'city' },
    { title: 'Max Kiralama Süresi (saat)', dataIndex: 'Period', key: 'period' },
    { title: 'Fiyat', dataIndex: 'Price', key: 'price' },
    { title: 'Açılış Saati', dataIndex: 'Start', key: 'start' },
    { title: 'Kapanış Saati', dataIndex: 'Finish', key: 'finish' },
    { title: 'Son Rezervasyon Tarihi', dataIndex: 'LastDate', key: 'lastDate' },
    {
  title: 'İşlemler',
  key: 'actions',
  render: (_, record) => (
    <Space>
      <Button danger onClick={() => handleDeleteField(record._rowIndex, record.FieldName)}>Sil</Button>
      <Button onClick={() => fetchAppointments(record.FieldName)}>Randevular</Button>
    </Space>
  )
}
  ];

  const appointmentColumns = [
    { title: 'Saha', dataIndex: 'fieldName', key: 'fieldName' },
    { title: 'Tarih', dataIndex: 'date', key: 'date' },
    { title: 'Saat', dataIndex: 'time', key: 'time' },
    { title: 'Müşteri', dataIndex: 'user', key: 'user' },
    { title: 'Süre', dataIndex: 'duration', key: 'duration', render: val => `${val} saat` },
    {
      title: 'İşlem',
      key: 'action',
      render: (_, record) => (
        <Button danger onClick={() => handleDeleteAppointment(record._rowIndex)}>Sil</Button>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto' }}>
      <Title level={2}>Halı Sahalarım</Title>

      <Table
        columns={fieldColumns}
        dataSource={fields}
        rowKey="_rowIndex"
        loading={loading}
        pagination={false}
        locale={{ emptyText: 'Hiç halı sahanız yok.' }}
      />

      <Title level={4} style={{ marginTop: 40 }}>Yeni Halı Saha Ekle</Title>
      <Form form={form} layout="vertical" onFinish={handleAddField}>
  <Form.Item name="fieldName" label="Saha İsmi" rules={[{ required: true, message: 'Lütfen saha ismi girin' }]}>
    <Input />
  </Form.Item>

  <Form.Item name="city" label="Şehir"  rules={[{ required: true, message: 'Lütfen Halı Sahanın Bulunduğu Şehri Yazın' }]}><Input /></Form.Item>

  <Form.Item name="period" label="Max Kiralama Süresi (saat)" rules={[{ required: true, message: 'Lütfen süre seçin' }]}>
    <Select placeholder="Süre seçin">
      {durations.map(dur => (
        <Option key={dur} value={dur}>{dur} saat</Option>
      ))}
    </Select>
  </Form.Item>

  <Form.Item
  name="price"
  label="Fiyat (₺)"
  rules={[
    { required: true, message: 'Lütfen fiyat girin' },
    {
      pattern: /^\d+$/,
      message: 'Fiyat yalnızca rakamlardan oluşmalı'
    }
  ]}
>
  <Input suffix="₺" />
</Form.Item>

  <Form.Item
    name="start"
    label="Açılış Saati"
    rules={[
      { required: true, message: 'Lütfen başlangıç saati seçin' },
      ({ getFieldValue }) => ({
        validator(_, value) {
          const finish = getFieldValue('finish');
          if (!value || !finish) {
            return Promise.resolve();
          }
          const startHour = parseInt(value.split(':')[0], 10);
          const finishHour = parseInt(finish.split(':')[0], 10);

          if (finishHour <= startHour) {
            return Promise.reject(new Error('Bitiş saati, başlangıç saatinden sonra olmalı.'));
          }

          if (finishHour - startHour < 3) {
            return Promise.reject(new Error('Başlangıç ve bitiş saatleri arasında en az 3 saat fark olmalı.'));
          }
          return Promise.resolve();
        }
      })
    ]}
  >
    <Select placeholder="Başlangıç saati seçin">
      {startTimes.map(time => (
        <Option key={time} value={time}>{time}</Option>
      ))}
    </Select>
  </Form.Item>

  <Form.Item
    name="finish"
    label="Kapanış Saati"
    dependencies={['start']}
    rules={[
      { required: true, message: 'Lütfen bitiş saati seçin' },
      ({ getFieldValue }) => ({
        validator(_, value) {
          const start = getFieldValue('start');
          if (!value || !start) {
            return Promise.resolve();
          }
          const startHour = parseInt(start.split(':')[0], 10);
          const finishHour = parseInt(value.split(':')[0], 10);

          if (finishHour <= startHour) {
            return Promise.reject(new Error('Bitiş saati, başlangıç saatinden sonra olmalı.'));
          }

          if (finishHour - startHour < 3) {
            return Promise.reject(new Error('Başlangıç ve bitiş saatleri arasında en az 3 saat fark olmalı.'));
          }
          return Promise.resolve();
        }
      })
    ]}
  >
    <Select placeholder="Bitiş saati seçin">
      {finishTimes.map(time => (
        <Option key={time} value={time}>{time}</Option>
      ))}
    </Select>
  </Form.Item>

  <Form.Item
  name="lastDate"
  label="Son Rezervasyon Tarihi"
  rules={[{ required: true, message: 'Lütfen son rezervasyon tarihini seçin' }]}
>
  <DatePicker
    style={{ width: '100%' }}
    disabledDate={current => current && current < dayjs().startOf('day')}
    format="YYYY-MM-DD"
  />
</Form.Item>

  <Form.Item>
    <Button type="primary" htmlType="submit">Ekle</Button>
  </Form.Item>
</Form>


      <Button onClick={() => navigate('/main')} type="default">Geri Dön</Button>

      <Modal
        title={`${selectedFieldName} - Randevular`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Table
          columns={appointmentColumns}
          dataSource={appointments}
          rowKey="_rowIndex"
          pagination={false}
          locale={{ emptyText: 'Bu saha için hiç randevu yok.' }}
        />
      </Modal>
    </div>
  );
}

export default MyFieldsPage;
