import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const companyId = localStorage.getItem('companyId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks/${companyId}`);
        const evts = res.data.map(task => ({
          title: task.title,
          start: new Date(task.deadline),
          end: new Date(task.deadline),
          allDay: true,
          resource: task,
          status: task.status
        }));
        setEvents(evts);
      } catch (err) {
        toast.error('Failed to load calendar events');
      }
    };
    fetchTasks();
  }, [companyId]);

  const eventStyleGetter = (event) => {
    let backgroundColor = 'var(--primary)';
    if (event.status === 'Completed') backgroundColor = 'var(--success)';
    if (event.status === 'In Progress') backgroundColor = 'var(--accent)';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px' }}>
        <h1 style={{ margin: '0 0 24px', fontSize: '1.5rem', color: 'var(--text)' }}>Task Calendar</h1>
        <div className="ts-surface" style={{ padding: 24, height: '70vh' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => navigate(`/task/${event.resource._id}`)}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
