import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { launchImageLibrary } from "react-native-image-picker";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    photo: null,
    name: "",
    email: "",
    bio: "",
    location: "",
    connections: "0",
    meetings: "0",
    interests: [],
  });

  const [isEditing, setIsEditing] = useState(false);

  const handlePhotoSelect = async () => {
    const options = {
      mediaType: "photo",
      quality: 1,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.assets?.[0]?.uri) {
        setProfileData((prev) => ({
          ...prev,
          photo: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.log("Error selecting photo:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F8F9FA" barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handlePhotoSelect}
            style={styles.photoContainer}
          >
            {profileData.photo ? (
              <Image source={{ uri: profileData.photo }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcons name="person" size={40} color="#6A9C89" />
                <View style={styles.cameraIcon}>
                  <MaterialIcons name="camera-alt" size={20} color="#FFF" />
                </View>
              </View>
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.nameInput}
            value={profileData.name}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.emailInput}
            value={profileData.email}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, email: text }))
            }
            placeholder="Enter your email"
            placeholderTextColor="#999"
          />
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.connections}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.meetings}</Text>
            <Text style={styles.statLabel}>Meetings</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={20} color="#6A9C89" />
          <TextInput
            style={styles.locationInput}
            value={profileData.location}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, location: text }))
            }
            placeholder="Enter your location"
            placeholderTextColor="#999"
          />
        </View>

        {/* About Me */}
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TextInput
            style={styles.bioInput}
            value={profileData.bio}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, bio: text }))
            }
            placeholder="Tell us about yourself..."
            placeholderTextColor="#999"
            multiline
          />
        </View>

        {/* Interests */}
        <View style={styles.interestsSection}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestTags}>
            {profileData.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.editButton, styles.signOutButton]}>
            <MaterialIcons name="logout" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // 하단 여백 추가
  },
  header: {
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  photoContainer: {
    width: 100,
    height: 100,
    marginBottom: 16,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#6A9C89",
    borderRadius: 15,
    padding: 5,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3436",
    textAlign: "center",
    marginBottom: 4,
  },
  emailInput: {
    fontSize: 14,
    color: "#636E72",
    textAlign: "center",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6A9C89",
  },
  statLabel: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: "#2D3436",
    marginLeft: 10,
  },
  bioSection: {
    backgroundColor: "#FFF",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 10,
  },
  bioInput: {
    fontSize: 14,
    color: "#636E72",
    minHeight: 80,
    textAlignVertical: "top",
  },
  interestsSection: {
    backgroundColor: "#FFF",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  interestTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    backgroundColor: "#F0F7F4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: "#6A9C89",
    fontSize: 14,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6A9C89",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  signOutButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default Profile;
