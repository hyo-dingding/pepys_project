import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Header from "../screens/Header";

const Tab = createMaterialTopTabNavigator();

// Dummy data for notes
const notesData = {
  myNotes: {
    "2024-10-01": ["Note 1", "Note 2"],
    "2024-10-05": ["Note 3"],
  },
  sharedToMe: {
    "2024-09-20": ["Shared Note 1"],
    "2024-10-10": ["Shared Note 2", "Shared Note 3"],
  },
  sharedToOthers: {
    "2024-09-15": ["Shared to others 1"],
    "2024-10-12": ["Shared to others 2"],
  },
};

function NotesList({ notes }) {
  return (
    <ScrollView>
      {Object.keys(notes).map((date) => (
        <View key={date} style={styles.noteSection}>
          <Text style={styles.date}>{date}</Text>
          {notes[date].map((note, index) => (
            <Text key={index} style={styles.note}>
              {note}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function MyOwnNotes() {
  return <NotesList notes={notesData.myNotes} />;
}

function NotesSharedToMe() {
  return <NotesList notes={notesData.sharedToMe} />;
}

function NotesSharedToOthers() {
  return <NotesList notes={notesData.sharedToOthers} />;
}

export default function Folder() {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Folder" />
      <View style={styles.container}>
        <Tab.Navigator>
          <Tab.Screen name="My Own Notes" component={MyOwnNotes} />
          <Tab.Screen name="Notes Shared to Me" component={NotesSharedToMe} />
          <Tab.Screen
            name="Notes Shared to Others"
            component={NotesSharedToOthers}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  noteSection: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  date: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  note: {
    fontSize: 14,
    color: "#555",
    paddingLeft: 10,
  },
});
