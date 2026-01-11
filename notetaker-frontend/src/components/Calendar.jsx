import React, { useState, useEffect } from "react";
import { eventsApi } from "../services/api";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    emoji: "💕",
    time: "",
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const eventEmojis = [
    "💕",
    "🎂",
    "📅",
    "💼",
    "🎉",
    "✨",
    "🌸",
    "💝",
    "🎁",
    "📝",
  ];

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsApi.getAll();
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      const saved = localStorage.getItem("sradha-events");
      if (saved) setEvents(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const addEvent = async () => {
    if (newEvent.title.trim() && selectedDate) {
      setIsAdding(true);
      const dateStr = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
      
      try {
        const response = await eventsApi.create({
          ...newEvent,
          date: dateStr,
        });
        if (response.success) {
          setEvents([...events, response.data]);
        }
      } catch (error) {
        console.error("Failed to add event:", error);
        const event = {
          id: Date.now(),
          ...newEvent,
          date: dateStr,
        };
        setEvents([...events, event]);
        localStorage.setItem("sradha-events", JSON.stringify([...events, event]));
      } finally {
        setNewEvent({ title: "", emoji: "💕", time: "" });
        setShowEventForm(false);
        setIsAdding(false);
      }
    }
  };

  const deleteEvent = async (id) => {
    try {
      await eventsApi.delete(id);
      setEvents(events.filter((e) => e._id !== id && e.id !== id));
    } catch (error) {
      console.error("Failed to delete event:", error);
      setEvents(events.filter((e) => e._id !== id && e.id !== id));
    }
  };

  const selectedDateEvents = selectedDate
    ? getEventsForDay(selectedDate.getDate())
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="font-romantic text-4xl gradient-text mb-2">
          📅 Calendar 📅
        </h2>
        <p className="font-sweet text-gray-500">
          Plan your beautiful days ahead! ✨
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="md:col-span-2 glass rounded-3xl p-6 animate-slide-up">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <h3 className="font-romantic text-2xl gradient-text">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-colors"
            >
              →
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {days.map((day) => (
              <div
                key={day}
                className="text-center font-sweet text-rose-400 text-sm py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before first of month */}
            {Array(firstDay)
              .fill(null)
              .map((_, i) => (
                <div key={`empty-${i}`} className="h-12" />
              ))}

            {/* Days of the month */}
            {Array(daysInMonth)
              .fill(null)
              .map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                return (
                  <button
                    key={day}
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day
                        )
                      )
                    }
                    className={`h-12 rounded-xl font-sweet relative transition-all duration-300 ${
                      isToday(day)
                        ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg"
                        : isSelected(day)
                        ? "bg-rose-100 text-rose-600 ring-2 ring-rose-300"
                        : "hover:bg-rose-50 text-gray-700"
                    }`}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <span key={idx} className="text-xs">
                            {e.emoji}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div
          className="glass rounded-3xl p-6 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          {selectedDate ? (
            <>
              <div className="text-center mb-6">
                <p className="font-sweet text-rose-400 text-sm">
                  {days[selectedDate.getDay()]}
                </p>
                <h3 className="font-romantic text-3xl gradient-text">
                  {selectedDate.getDate()}
                </h3>
                <p className="font-sweet text-gray-500">
                  {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </p>
              </div>

              {/* Events for selected day */}
              <div className="space-y-3 mb-6">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-center font-sweet text-gray-400 py-4">
                    No events for this day 🌸
                  </p>
                ) : (
                  selectedDateEvents.map((event) => {
                    const eventId = event._id || event.id;
                    return (
                      <div
                        key={eventId}
                        className="bg-rose-50 rounded-xl p-3 flex items-center gap-3 group"
                      >
                        <span className="text-2xl">{event.emoji}</span>
                        <div className="flex-1">
                          <p className="font-sweet text-gray-700">
                            {event.title}
                          </p>
                          {event.time && (
                            <p className="font-sweet text-gray-400 text-xs">
                              🕐 {event.time}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteEvent(eventId)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Event Form */}
              {showEventForm ? (
                <div className="space-y-3 animate-scale-in">
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    placeholder="Event title..."
                    className="w-full p-3 rounded-xl border-2 border-rose-100 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border-2 border-rose-100 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {eventEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewEvent({ ...newEvent, emoji })}
                        className={`text-xl p-1 rounded-lg transition-all ${
                          newEvent.emoji === emoji
                            ? "bg-rose-100 scale-110"
                            : "hover:bg-rose-50"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addEvent}
                      disabled={isAdding}
                      className="flex-1 love-button text-white font-sweet py-2 rounded-xl disabled:opacity-50"
                    >
                      {isAdding ? "Adding..." : "Add ✨"}
                    </button>
                    <button
                      onClick={() => setShowEventForm(false)}
                      className="px-4 bg-gray-100 hover:bg-gray-200 font-sweet py-2 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowEventForm(true)}
                  className="w-full p-3 rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-400 hover:bg-rose-50 font-sweet text-rose-400 transition-all"
                >
                  + Add Event
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl block mb-4">📅</span>
              <p className="font-sweet text-gray-500">
                Select a day to view or add events
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div
          className="mt-8 glass rounded-3xl p-6 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="font-romantic text-xl gradient-text mb-4">
            ✨ Upcoming Events
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {events
              .filter(
                (e) => new Date(e.date) >= new Date().setHours(0, 0, 0, 0)
              )
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 6)
              .map((event) => (
                <div
                  key={event._id || event.id}
                  className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{event.emoji}</span>
                    <div>
                      <p className="font-sweet font-semibold text-gray-700">
                        {event.title}
                      </p>
                      <p className="font-sweet text-gray-400 text-xs">
                        📅{" "}
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {event.time && ` 🕐 ${event.time}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
