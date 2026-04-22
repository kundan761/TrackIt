import { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../store/slices/eventSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const Calendar = () => {
  const dispatch = useAppDispatch();
  const { events, loading } = useAppSelector((state) => state.event);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    allDay: false,
    location: '',
  });

  useEffect(() => {
    let startDate: string;
    let endDate: string;

    if (view === 'day') {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      startDate = format(dayStart, 'yyyy-MM-dd');
      endDate = format(dayEnd, 'yyyy-MM-dd');
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      startDate = format(weekStart, 'yyyy-MM-dd');
      endDate = format(weekEnd, 'yyyy-MM-dd');
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      startDate = format(monthStart, 'yyyy-MM-dd');
      endDate = format(monthEnd, 'yyyy-MM-dd');
    }

    dispatch(fetchEvents({ startDate, endDate }));
  }, [currentDate, view, dispatch]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createEvent({
      ...eventForm,
      startTime: new Date(eventForm.startTime),
      endTime: new Date(eventForm.endTime),
    }));
    setIsEventModalOpen(false);
    setEventForm({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      allDay: false,
      location: '',
    });
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      await dispatch(updateEvent({
        id: selectedEvent._id,
        data: {
          ...eventForm,
          startTime: new Date(eventForm.startTime),
          endTime: new Date(eventForm.endTime),
        },
      }));
      setIsEventModalOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      startTime: format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"),
      allDay: event.allDay,
      location: event.location || '',
    });
    setIsEventModalOpen(true);
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startTime), day));
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const firstDayOfWeek = monthStart.getDay();
    const previousMonthDays = Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 }, (_, i) => 
      subDays(monthStart, i + 1)
    ).reverse();
    
    const lastDayOfWeek = monthEnd.getDay();
    const nextMonthDays = Array.from({ length: lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek }, (_, i) => 
      addDays(monthEnd, i + 1)
    );

    const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-7 border-b">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {allDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString() || index}
                className={`min-h-[100px] border-r border-b p-2 ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-semibold mb-1 ${isCurrentMonth ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'} ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event: any) => (
                    <div
                      key={event._id}
                      className="text-xs p-1 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 truncate"
                      onClick={() => handleEventClick(event)}
                    >
                      {format(new Date(event.startTime), 'HH:mm')} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                  )}
                  <button
                    onClick={() => {
                      const start = new Date(day);
                      start.setHours(9, 0, 0, 0);
                      const end = new Date(day);
                      end.setHours(10, 0, 0, 0);
                      setEventForm({
                        ...eventForm,
                        startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
                        endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
                      });
                      setSelectedEvent(null);
                      setIsEventModalOpen(true);
                    }}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 mt-1"
                  >
                    <Plus className="w-3 h-3 mx-auto" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <div className="grid grid-cols-8 border-b min-w-[800px]">
          <div className="p-2 border-r font-semibold text-gray-600">Time</div>
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-2 text-center border-r ${
                isSameDay(day, new Date()) ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                {format(day, 'd')}
              </div>
              <div className={`text-xs ${isSameDay(day, new Date()) ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                {format(day, 'EEE')}
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-[800px]">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-2 border-r text-sm text-gray-600">{hour}:00</div>
              {weekDays.map((day) => {
                const dayEvents = getEventsForDay(day).filter((event: any) => {
                  const eventHour = new Date(event.startTime).getHours();
                  return eventHour === hour;
                });

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="border-r min-h-[60px] relative p-1"
                  >
                    {dayEvents.map((event: any) => (
                      <div
                        key={event._id}
                        className="absolute left-1 right-1 rounded p-1.5 text-xs bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-xs opacity-90">
                          {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDay(currentDate);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{format(currentDate, 'EEEE')}</div>
            <div className="text-lg text-gray-600 dark:text-gray-400">{format(currentDate, 'MMMM d, yyyy')}</div>
          </div>
        </div>
        <div className="p-4">
          {timeSlots.map((hour) => {
            const hourEvents = dayEvents.filter((event: any) => {
              const eventHour = new Date(event.startTime).getHours();
              return eventHour === hour;
            });

            return (
              <div key={hour} className="grid grid-cols-12 border-b border-gray-200 py-2">
                <div className="col-span-2 text-sm text-gray-600 font-medium">
                  {hour}:00
                </div>
                <div className="col-span-10 relative min-h-[60px]">
                  {hourEvents.map((event: any) => (
                    <div
                      key={event._id}
                      className="mb-2 p-2 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-xs">
                        {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
          <p className="text-gray-600 mt-1">Schedule and manage your events</p>
        </div>
        <Button onClick={() => {
          setSelectedEvent(null);
          setEventForm({
            title: '',
            description: '',
            startTime: '',
            endTime: '',
            allDay: false,
            location: '',
          });
          setIsEventModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="ml-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
              {view === 'week' && `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`}
              {view === 'month' && format(currentDate, 'MMMM yyyy')}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(['day', 'week', 'month'] as const).map((v) => (
              <Button
                key={v}
                variant={view === v ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Calendar View */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </>
      )}

      {/* Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent ? 'Edit Event' : 'Create Event'}
        size="lg"
      >
        <form onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
          <Input
            label="Event Title"
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            required
            placeholder="Enter event title"
          />
          <Textarea
            label="Description"
            value={eventForm.description}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            placeholder="Enter event description"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              value={eventForm.startTime}
              onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
              required
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={eventForm.endTime}
              onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
              required
              min={eventForm.startTime}
            />
          </div>
          <Input
            label="Location"
            value={eventForm.location}
            onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
            placeholder="Enter event location"
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={eventForm.allDay}
              onChange={(e) => setEventForm({ ...eventForm, allDay: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="allDay" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              All day event
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            {selectedEvent && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (selectedEvent) {
                    dispatch(deleteEvent(selectedEvent._id));
                    setIsEventModalOpen(false);
                    setSelectedEvent(null);
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEventModalOpen(false);
                setSelectedEvent(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Calendar;

