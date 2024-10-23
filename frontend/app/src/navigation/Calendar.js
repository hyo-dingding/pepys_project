import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import Header from "../screens/Header";

// Utility function to calculate the number of days in a given month/year
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

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

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [tasks, setTasks] = useState({}); // To store tasks for each date
  const [modalVisible, setModalVisible] = useState(false); // For showing add task modal
  const [newTask, setNewTask] = useState(""); // To store the new task input

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Handle date press to show tasks
  const handleDatePress = (date) => {
    setSelectedDate(date);
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Add task to selected date
  const handleAddTask = () => {
    if (selectedDate && newTask.trim()) {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [`${currentYear}-${currentMonth}-${selectedDate}`]: [
          ...(prevTasks[`${currentYear}-${currentMonth}-${selectedDate}`] ||
            []),
          newTask,
        ],
      }));
      setNewTask("");
      setModalVisible(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        <Header title="Calendar" />

        {/* Add Task Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Task</Text>
              <TextInput
                style={styles.taskInput}
                placeholder="Enter task"
                value={newTask}
                onChangeText={setNewTask}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddTask}
              >
                <Text style={styles.addButtonText}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Calendar Container */}
        <View style={styles.calendarContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePreviousMonth}>
              <Text style={styles.navButton}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.monthYear}>
              {months[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Text style={styles.navButton}>Next</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {daysOfWeek.map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <Text
                  style={[
                    styles.dayText,
                    (day === "Sun" || day === "Sat") && styles.weekendText,
                  ]}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {dates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dayContainer}
                onPress={() => handleDatePress(date)}
              >
                <View
                  style={[
                    todayDate === date &&
                    currentMonth === todayMonth &&
                    currentYear === todayYear
                      ? styles.todayIndicator
                      : selectedDate === date
                      ? styles.selectedDateIndicator
                      : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      (index % 7 === 0 || index % 7 === 6) &&
                        styles.weekendText,
                    ]}
                  >
                    {date}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tasks Section */}
          <View style={styles.tasksSection}>
            <Text style={styles.taskHeader}>
              {selectedDate
                ? `Tasks for ${selectedDate} ${months[currentMonth]}:`
                : "Select a date to view tasks"}
            </Text>
            {selectedDate &&
            tasks[`${currentYear}-${currentMonth}-${selectedDate}`] ? (
              tasks[`${currentYear}-${currentMonth}-${selectedDate}`].map(
                (task, index) => (
                  <Text key={index} style={styles.taskItem}>
                    {task}
                  </Text>
                )
              )
            ) : (
              <Text>No tasks for this date.</Text>
            )}
          </View>

          {/* Add Task Button */}
          {selectedDate && (
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addTaskButtonText}>Add Task</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthYear: {
    fontSize: 24,
    fontWeight: "bold",
  },
  navButton: {
    fontSize: 18,
    color: "#4285F4",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayContainer: {
    width: "14.28%", // 7 columns for each day of the week
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  weekendText: {
    color: "#ff0000",
  },
  selectedDateIndicator: {
    borderRadius: 50,
    backgroundColor: "#d3d3d3",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  todayIndicator: {
    borderRadius: 50,
    backgroundColor: "#4285F4",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tasksSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
  },
  taskHeader: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskItem: {
    fontSize: 14,
    marginVertical: 5,
  },
  addTaskButton: {
    marginTop: 20,
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addTaskButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  taskInput: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#4285F4",
    fontSize: 16,
  },
});
