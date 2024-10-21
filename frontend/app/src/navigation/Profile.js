import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Header from "../screens/Header";

export default function ProfilePage() {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileText, setProfileText] = useState("Profile");
  const [tempText, setTempText] = useState(profileText);

  // Function to handle photo selection
  const handlePhotoSelect = () => {
    launchImageLibrary({}, (response) => {
      if (response.assets && response.assets.length > 0) {
        setProfilePhoto(response.assets[0].uri);
      }
    });
  };

  // Function to handle profile text save
  const handleSaveProfileText = () => {
    setProfileText(tempText);
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      {/* Profile Photo */}
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={handlePhotoSelect}
      >
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Profile Details (Editable) */}
      <View style={styles.profileContainer}>
        <TextInput
          style={styles.profileInput}
          value={tempText}
          onChangeText={setTempText}
          placeholder="Edit Profile"
          multiline={true}
          numberOfLines={4} // Adjusts the input to show multiple lines
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfileText}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: 50,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoText: {
    color: "#000",
  },
  profileContainer: {
    width: "80%",
    height: 200, // Increased the container height to accommodate more text
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginBottom: 20,
  },
  profileInput: {
    width: "100%",
    fontSize: 16,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    height: 120, // Increased the height of the text input to allow for multiple lines
    textAlignVertical: "top", // Ensures text starts from the top of the input box
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
  },
  button: {
    width: "80%",
    backgroundColor: "#E0E0E0",
    borderRadius: 25,
    paddingVertical: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
  },
});
