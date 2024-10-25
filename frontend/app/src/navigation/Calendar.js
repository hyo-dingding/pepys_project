import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// 달력에 필요한 상수 정의
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
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

// 이벤트 카테고리 정의
const EVENT_CATEGORIES = [
  { id: "default", color: "#6A9C89", name: "Default" },
  { id: "meeting", color: "#FF6B6B", name: "Meeting" },
  { id: "personal", color: "#4ECDC4", name: "Personal" },
  { id: "important", color: "#FFE66D", name: "Important" },
];

const Calendar = () => {
  // 상태 관리
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState({});
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    time: "",
    category: "default",
  });
  useEffect(() => {
    if (!global.calendarEvents) {
      global.calendarEvents = {};
    }
    setEvents(global.calendarEvents);
  }, []);
  // 해당 월의 총 일수를 계산하는 함수
  const getDaysInMonth = useCallback((month, year) => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  // 해당 월의 첫 날의 요일을 구하는 함수
  const getFirstDayOfMonth = useCallback((month, year) => {
    return new Date(year, month, 1).getDay();
  }, []);

  // 캘린더 날짜 배열 생성 함수
  const generateCalendarDays = useCallback(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    const addEvent = (event) => {
      const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;

      global.calendarEvents = {
        ...global.calendarEvents,
        [dateKey]: [...(global.calendarEvents?.[dateKey] || []), newEventData],
      };
    };

    // 이전 달의 날짜 추가
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: currentMonth - 1,
        year: currentYear,
        isCurrentMonth: false,
      });
    }

    // 현재 달의 날짜 추가
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    // 다음 달의 날짜 추가
    const remainingDays = 42 - days.length; // 6주 표시를 위해 42일로 맞춤
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: currentMonth + 1,
        year: currentYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth, currentYear, getDaysInMonth, getFirstDayOfMonth]);

  // 날짜 선택 핸들러
  const handleDateSelect = useCallback((date) => {
    if (!date.isCurrentMonth) {
      let newMonth = date.month;
      let newYear = date.year;

      if (newMonth === -1) {
        newMonth = 11;
        newYear--;
      } else if (newMonth === 12) {
        newMonth = 0;
        newYear++;
      }

      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    }
    setSelectedDate(new Date(date.year, date.month, date.day));
  }, []);

  // 월 변경 핸들러
  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  }, [currentMonth]);

  // 이벤트 관리 함수들
  const handleAddEvent = useCallback(() => {
    if (newEvent.title.trim()) {
      const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
      const newEventData = { ...newEvent, id: Date.now() };
      const updatedEvents = {
        ...events,
        [dateKey]: [...(events[dateKey] || []), newEventData],
      };
      setEvents(updatedEvents);
      global.calendarEvents = updatedEvents;

      setNewEvent({
        title: "",
        description: "",
        time: "",
        category: "default",
      });
      setShowAddEventModal(false);
    }
  }, [newEvent, selectedDate, events]);

  const handleDeleteEvent = useCallback(
    (eventId) => {
      const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
      const updatedEvents = {
        ...events,
        [dateKey]: events[dateKey].filter((event) => event.id !== eventId),
      };

      // 로컬 상태와 전역 상태 모두 업데이트
      setEvents(updatedEvents);
      global.calendarEvents = updatedEvents;

      setShowEventDetailsModal(false);
    },
    [selectedDate, events]
  );
  // 헤더 렌더링
  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.monthYearText}>
          {MONTHS[currentMonth]} {currentYear}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handlePrevMonth}
          >
            <MaterialIcons name="chevron-left" size={24} color="#6A9C89" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleNextMonth}
          >
            <MaterialIcons name="chevron-right" size={24} color="#6A9C89" />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [currentMonth, currentYear, handlePrevMonth, handleNextMonth]
  );

  // 요일 헤더 렌더링
  const renderWeekDays = useCallback(
    () => (
      <View style={styles.weekDaysContainer}>
        {DAYS_OF_WEEK.map((day, index) => (
          <View key={day} style={styles.weekDayCell}>
            <Text
              style={[
                styles.weekDayText,
                (index === 0 || index === 6) && styles.weekendText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
    ),
    []
  );

  // 캘린더 그리드 렌더링
  // dateCellWrapper 부분 수정
  const renderCalendarGrid = useCallback(() => {
    const days = generateCalendarDays();
    const rows = [];

    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7);
      rows.push(
        <View key={i} style={styles.calendarRow}>
          {week.map((date, index) => {
            const isSelected =
              selectedDate.getDate() === date.day &&
              selectedDate.getMonth() === date.month &&
              selectedDate.getFullYear() === date.year;

            const dateKey = `${date.year}-${date.month}-${date.day}`;
            const hasEvents = events[dateKey]?.length > 0;

            return (
              <TouchableOpacity
                key={`${date.year}-${date.month}-${date.day}-${index}`}
                style={styles.dateCell}
                onPress={() => handleDateSelect(date)}
              >
                <View style={styles.dateCellWrapper}>
                  {isSelected && <View style={styles.selectedDateCell} />}
                  <Text
                    style={[
                      styles.dateCellText,
                      !date.isCurrentMonth && styles.outOfMonthText,
                      isSelected && styles.selectedDateText,
                      (index === 0 || index === 6) && styles.weekendText,
                    ]}
                  >
                    {date.day}
                  </Text>
                  {/* 일정 표시 점 추가 */}
                  {hasEvents && <View style={styles.eventIndicator} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    return <View style={styles.calendarGrid}>{rows}</View>;
  }, [generateCalendarDays, selectedDate, events, handleDateSelect]);

  // 이벤트 목록 렌더링
  const renderEventsList = useCallback(() => {
    const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    const dateEvents = events[dateKey] || [];

    return (
      <View style={styles.eventsContainer}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsHeaderText}>
            Events for {selectedDate.getDate()}{" "}
            {MONTHS[selectedDate.getMonth()]}
          </Text>
          <TouchableOpacity
            style={styles.addEventButton}
            onPress={() => setShowAddEventModal(true)}
          >
            <MaterialIcons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {dateEvents.length === 0 ? (
          <Text style={styles.noEventsText}>No events for this date</Text>
        ) : (
          <ScrollView style={styles.eventsList}>
            {dateEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventCard,
                  {
                    borderLeftColor: EVENT_CATEGORIES.find(
                      (c) => c.id === event.category
                    )?.color,
                  },
                ]}
                onPress={() => {
                  setSelectedEvent(event);
                  setShowEventDetailsModal(true);
                }}
              >
                <View style={styles.eventTimeContainer}>
                  <MaterialIcons name="access-time" size={16} color="#666666" />
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.description && (
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }, [selectedDate, events]);
  // 이벤트 추가 모달
  const renderAddEventModal = useCallback(
    () => (
      <Modal
        visible={showAddEventModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddEventModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                placeholderTextColor="#666666"
                value={newEvent.title}
                onChangeText={(text) =>
                  setNewEvent((prev) => ({ ...prev, title: text }))
                }
              />

              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description (Optional)"
                placeholderTextColor="#666666"
                multiline
                value={newEvent.description}
                onChangeText={(text) =>
                  setNewEvent((prev) => ({ ...prev, description: text }))
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Time (e.g., 14:00)"
                placeholderTextColor="#666666"
                value={newEvent.time}
                onChangeText={(text) =>
                  setNewEvent((prev) => ({ ...prev, time: text }))
                }
              />

              <Text style={styles.categoryLabel}>Category:</Text>
              <View style={styles.categoryGrid}>
                {EVENT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      newEvent.category === category.id &&
                        styles.selectedCategory,
                      { backgroundColor: `${category.color}20` },
                    ]}
                    onPress={() =>
                      setNewEvent((prev) => ({
                        ...prev,
                        category: category.id,
                      }))
                    }
                  >
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: category.color },
                      ]}
                    />
                    <Text style={styles.categoryText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddEvent}
              >
                <Text style={styles.addButtonText}>Add Event</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    ),
    [showAddEventModal, newEvent, handleAddEvent]
  );

  // 이벤트 상세 모달
  const renderEventDetailsModal = useCallback(
    () => (
      <Modal
        visible={showEventDetailsModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Event Details</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowEventDetailsModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {selectedEvent && (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventDetailTitle}>
                    {selectedEvent.title}
                  </Text>

                  <View style={styles.eventDetailTime}>
                    <MaterialIcons
                      name="access-time"
                      size={20}
                      color="#666666"
                    />
                    <Text style={styles.eventDetailTimeText}>
                      {selectedEvent.time}
                    </Text>
                  </View>

                  {selectedEvent.description && (
                    <Text style={styles.eventDetailDescription}>
                      {selectedEvent.description}
                    </Text>
                  )}

                  <View style={styles.eventDetailCategory}>
                    <Text style={styles.eventDetailCategoryLabel}>
                      Category:
                    </Text>
                    <View
                      style={[
                        styles.eventDetailCategoryBadge,
                        {
                          backgroundColor: EVENT_CATEGORIES.find(
                            (c) => c.id === selectedEvent.category
                          )?.color,
                        },
                      ]}
                    >
                      <Text style={styles.eventDetailCategoryText}>
                        {
                          EVENT_CATEGORIES.find(
                            (c) => c.id === selectedEvent.category
                          )?.name
                        }
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEvent(selectedEvent.id)}
                  >
                    <MaterialIcons name="delete" size={20} color="#ffffff" />
                    <Text style={styles.deleteButtonText}>Delete Event</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    ),
    [showEventDetailsModal, selectedEvent, handleDeleteEvent]
  );

  // 메인 렌더링
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {renderHeader()}
      {renderWeekDays()}
      {renderCalendarGrid()}
      {renderEventsList()}
      {renderAddEventModal()}
      {renderEventDetailsModal()}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  // 메인 컨테이너
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  // 헤더 스타일
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F7F7F7",
  },

  // 요일 헤더 스타일
  weekDaysContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2D3436",
  },
  weekendText: {
    color: "#FF6B6B",
  },

  // 캘린더 그리드 스타일
  calendarGrid: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dateCell: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dateCellWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dateCellWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  eventIndicator: {
    position: "absolute",
    bottom: -4, // 날짜 아래에 위치
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6A9C89",
  },
  dateCellText: {
    fontSize: 14,
    color: "#2D3436",
    zIndex: 1,
  },
  selectedDateCell: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#6A9C89",
    borderRadius: 16,
    zIndex: 0,
  },
  selectedDateText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  outOfMonthText: {
    color: "#CCCCCC",
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    bottom: 2,
    backgroundColor: "#6A9C89",
  },

  // 이벤트 리스트 스타일
  eventsContainer: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    marginTop: 8,
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  eventsHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
  },
  addEventButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6A9C89",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  eventsList: {
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3436",
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    color: "#666666",
  },
  noEventsText: {
    textAlign: "center",
    color: "#666666",
    fontSize: 14,
    marginTop: 20,
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScrollView: {
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    color: "#2D3436",
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3436",
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedCategory: {
    borderColor: "#6A9C89",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    color: "#2D3436",
  },

  // 버튼 스타일
  addButton: {
    backgroundColor: "#6A9C89",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },

  // 이벤트 상세 스타일
  eventDetails: {
    padding: 16,
  },
  eventDetailTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  eventDetailTime: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  eventDetailTimeText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
  },
  eventDetailDescription: {
    fontSize: 14,
    color: "#2D3436",
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetailCategory: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  eventDetailCategoryLabel: {
    fontSize: 14,
    color: "#666666",
    marginRight: 8,
  },
  eventDetailCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventDetailCategoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default Calendar;
