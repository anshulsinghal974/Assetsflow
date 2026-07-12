import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const statusColors = {
  Upcoming: '#4F46E5',
  Ongoing: '#059669',
  Completed: '#94A3B8',
  Cancelled: '#DC2626',
};

export default function BookingCalendar({ events = [], onSelectEvent, onSelectSlot, style }) {
  const eventStyleGetter = (event) => {
    const bg = statusColors[event.status] || statusColors.Upcoming;
    return {
      style: {
        backgroundColor: bg,
        borderRadius: '6px',
        border: 'none',
        color: '#fff',
        fontSize: '0.8125rem',
        padding: '2px 8px',
      },
    };
  };

  return (
    <div style={{ height: 600, ...style }}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        popup
        views={['month', 'week', 'day']}
        defaultView="week"
        step={30}
        timeslots={2}
      />
    </div>
  );
}
