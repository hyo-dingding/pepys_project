import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import Header from "../screens/Header";

// Utility function to calculate the number of days in a given month/year
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate(); // 0 gets the last day of the previous month
};

// Array of month names for display
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
  const [selectedDate, setSelectedDate] = useState(null); // State to track selected date
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // Set to current month
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Set to current year

  // Get the current date
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get the number of days in the selected month/year
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1); // Generate array of days in the month

  // Handler for selecting a date
  const handleDatePress = (date) => {
    setSelectedDate(date);
  };

  // Handler to go to the previous month
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11); // Wrap to December of the previous year
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Handler to go to the next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0); // Wrap to January of the next year
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handler to deselect date when clicked outside the calendar
  const handleOutsidePress = () => {
    setSelectedDate(null);
    Keyboard.dismiss(); // Dismiss the keyboard if any input is focused (optional)
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={{ flex: 1 }}>
        <Header title="Calendar" />

        {/* Calendar Container */}
        <View style={styles.calendarContainer}>
          {/* Header Section */}
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

          {/* Days of the week */}
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

          {/* Dates */}
          <View style={styles.calendarGrid}>
            {dates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dayContainer}
                onPress={() => handleDatePress(date)}
              >
                <View
                  style={[
                    // Check if the current date is today's date
                    todayDate === date &&
                    currentMonth === todayMonth &&
                    currentYear === todayYear
                      ? styles.todayIndicator // Highlight today in blue
                      : selectedDate === date
                      ? styles.selectedDateIndicator // Only highlight selected date if clicked
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

          {/* Notes Section */}
          <View style={styles.noteSection}>
            <Text style={styles.noteText}>
              {selectedDate
                ? "No notes for this date"
                : "Select a date to view notes"}
            </Text>
          </View>
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
    color: "#ff0000", // Red for weekends
  },
  selectedDateIndicator: {
    borderRadius: 50,
    backgroundColor: "#d3d3d3", // Light gray to indicate selected date
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  todayIndicator: {
    borderRadius: 50,
    backgroundColor: "#4285F4", // Blue for today's date
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  noteSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
  },
  noteText: {
    fontSize: 14,
    color: "#000",
  },
});
