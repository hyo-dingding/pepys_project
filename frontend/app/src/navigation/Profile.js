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
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // expo-image-picker로 변경
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { NGROK_URL } from "@env";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp, getApp } from "firebase/app";

// Firebase 설정 객체 추가
const firebaseConfig = {
  apiKey: "AIzaSyCed9IRNe9czcHNrAfpytFEaFWdOrlIz4I",
  authDomain: "pepysproject-e55ba.firebaseapp.com",
  projectId: "pepysproject-e55ba",
  storageBucket: "pepysproject-e55ba.appspot.com", // 실제 스토리지 버킷 URL
  messagingSenderId: "904750555795",
  appId: "1:904750555795:android:e742894e0def2484542366",
};

// Firebase 초기화
let app;
let storage;

try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

// Storage 초기화
storage = getStorage(app);
console.log("Storage initialized:", storage ? "Success" : "Failed");

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
  // 로그아웃 함수
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      // AsyncStorage에서 토큰 삭제
      await AsyncStorage.removeItem("access_token");

      // 삭제 후 토큰 확인
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.log("Token successfully deleted"); // 토큰이 없으면 성공적으로 삭제된 것
      } else {
        console.log("Token still exists:", token); // 토큰이 남아있다면 삭제 실패
      }

      // 로그아웃 후 WelcomeScreen으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const [isEditing, setIsEditing] = useState(false);

  const handlePhotoSelect = async () => {
    try {
      // 권한 요청
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        console.log("Permission to access media library denied");
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to select images."
        );
        return;
      }

      // 이미지 선택기 실행
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log("Image picker result:", result);

      if (!result.canceled) {
        console.log("Selected image URI:", result.assets[0].uri);
        await uploadImageToFirebase(result.assets[0]);
      } else {
        console.log("Image selection cancelled");
      }
    } catch (error) {
      console.log("Error selecting photo:", error);
      Alert.alert("Error", "Failed to select photo: " + error.message);
    }
  };

  const uploadImageToFirebase = async (imageAsset) => {
    let blob;
    try {
      if (!storage) {
        throw new Error("Storage not initialized");
      }

      console.log("Starting image upload process...");

      // URI를 blob으로 변환
      const response = await fetch(imageAsset.uri);
      blob = await response.blob();
      console.log("Image converted to blob:", {
        size: blob.size,
        type: blob.type,
      });

      // 파일 이름 생성
      const extension = imageAsset.uri.split(".").pop();
      const filename = `profile_${Platform.OS}_${Date.now()}.${extension}`;
      console.log("Generated filename:", filename);

      // Storage 참조 생성 (web SDK 방식)
      const storageRef = ref(storage, `profile_images/${filename}`);
      console.log("Storage reference created");

      // 이미지 업로드
      const uploadTask = await uploadBytes(storageRef, blob);
      console.log("Upload successful:", uploadTask.metadata);

      // 다운로드 URL 가져오기
      const downloadURL = await getDownloadURL(uploadTask.ref);
      console.log("Download URL:", downloadURL);

      // 프로필 데이터 업데이트
      setProfileData((prev) => ({
        ...prev,
        photo: downloadURL,
      }));

      Alert.alert("Success", "Image uploaded successfully");
    } catch (error) {
      console.error("Firebase upload error:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        storageAvailable: !!storage,
      });

      Alert.alert("Upload Error", `Failed to upload image: ${error.message}`);
    } finally {
      if (blob) {
        blob = null;
      }
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
              <Image
                source={{ uri: profileData.photo }}
                style={styles.photo}
                onError={(error) => {
                  console.error(
                    "Image loading error:",
                    error.nativeEvent.error
                  );
                }}
              />
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

          <TouchableOpacity
            style={[styles.editButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
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
