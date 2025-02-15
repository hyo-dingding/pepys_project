import React, { useState, useCallback, useEffect } from "react";
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
  Alert, // 추가
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // expo-image-picker로 변경
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { NGROK_URL } from "@env";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { initializeApp, getApp } from "firebase/app";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Firebase 초기화
let app;
let storage;
let db;

try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

// Storage 초기화
storage = getStorage(app);
db = getFirestore(app);
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

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfileData, setEditedProfileData] = useState({});
  const navigation = useNavigation();

  // loadProfileData 함수 추가
  const loadProfileData = async () => {
    try {
      // 저장된 토큰 가져오기
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.log("No token found");
        navigation.navigate("Welcome");
        return;
      }

      // 이메일 가져오기
      const userEmail = await AsyncStorage.getItem("user_email");
      if (!userEmail) {
        console.log("No email found");
        return;
      }

      console.log("Fetching user data for email:", userEmail);

      // Firebase에서 프로필 이미지 가져오기
      try {
        const userDocRef = doc(db, "users", userEmail);
        const userDoc = await getDoc(userDocRef);
        const firestoreData = userDoc.data();
        const savedProfileImageUrl = firestoreData?.profileImageUrl;

        console.log("Saved profile image URL:", savedProfileImageUrl);

        // 프로필 이미지 업데이트
        setProfileData((prev) => ({
          ...prev,
          photo: savedProfileImageUrl || null,
        }));
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
      }

      // 백엔드에서 사용자 정보 가져오기
      try {
        const response = await axios.get(`${NGROK_URL}/find-id/${userEmail}`);
        console.log("API Response:", response?.data);

        if (response?.data) {
          setProfileData((prev) => ({
            ...prev,
            name: response.data.name || prev.name || "",
            email: response.data.email || userEmail,
            nationality: response.data.nationality || prev.nationality || "",
            work_title: response.data.work_title || prev.work_title || "",
            bio: prev.bio || "",
            location: prev.location || "",
            connections: prev.connections || "0",
            meetings: prev.meetings || "0",
            interests: prev.interests || [],
          }));
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        // API 에러가 발생해도 기존 상태 유지
        setProfileData((prev) => ({
          ...prev,
          email: userEmail,
        }));
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    }
  };

  // useEffect 추가
  useEffect(() => {
    loadProfileData();
  }, []);

  // 로그아웃 함수
  const handleSignOut = async () => {
    try {
      // AsyncStorage에서 토큰 삭제
      await AsyncStorage.removeItem("access_token");
      const token = await AsyncStorage.getItem("access_token");

      // 로그아웃 후 WelcomeScreen으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

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

      const userEmail = await AsyncStorage.getItem("user_email");
      if (!userEmail) {
        throw new Error("User email not found");
      }

      console.log("Starting image upload process...");

      // URI를 blob으로 변환
      const response = await fetch(imageAsset.uri);
      blob = await response.blob();

      // 파일 이름 생성
      const extension = imageAsset.uri.split(".").pop();
      const filename = `profile_${userEmail}_${Date.now()}.${extension}`;

      // Storage 참조 생성 (web SDK 방식)
      const storageRef = ref(storage, `profile_images/${filename}`);

      // 이미지 업로드
      const uploadTask = await uploadBytes(storageRef, blob);

      // 다운로드 URL 가져오기
      const downloadURL = await getDownloadURL(uploadTask.ref);

      // 이메일을 키로 사용하여 프로필 이미지 URL 저장
      const userDocRef = doc(db, "users", userEmail);
      await setDoc(
        userDocRef,
        {
          profileImageUrl: downloadURL,
        },
        { merge: true }
      );

      // 프로필 데이터 업데이트
      setProfileData((prev) => ({
        ...prev,
        photo: downloadURL,
      }));

      Alert.alert("Success", "Image uploaded successfully");
    } catch (error) {
      console.error("Firebase upload error:", error);

      Alert.alert("Upload Error", `Failed to upload image: ${error.message}`);
    } finally {
      if (blob) {
        blob = null;
      }
    }
  };

  // 계정 삭제 확인 함수 추가
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            // 두 번째 확인 단계
            Alert.alert(
              "Final Confirmation",
              "Please type 'DELETE' to confirm account deletion",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Confirm",
                  onPress: async () => {
                    try {
                      // 저장된 이메일 가져오기
                      const userEmail = profileData.email;

                      if (!userEmail) {
                        Alert.alert("Error", "User email not found");
                        return;
                      }

                      // 계정 삭제 API 호출
                      const response = await axios.delete(
                        `${NGROK_URL}/user/${userEmail}`
                      );

                      if (response.data.msg === "User deleted successfully") {
                        // 성공적으로 삭제된 경우
                        await AsyncStorage.removeItem("access_token"); // 토큰 삭제

                        Alert.alert(
                          "Success",
                          "Your account has been successfully deleted",
                          [
                            {
                              text: "OK",
                              onPress: () => {
                                // Welcome 화면으로 이동
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: "Welcome" }],
                                });
                              },
                            },
                          ]
                        );
                      }
                    } catch (error) {
                      console.error("Delete account error:", error);
                      Alert.alert(
                        "Error",
                        error.response?.data?.detail ||
                          "Failed to delete account. Please try again."
                      );
                    }
                  },
                  style: "destructive",
                },
              ]
            );
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEditProfile = async () => {
    if (isEditing) {
      try {
        // 여기에 프로필 업데이트 API 호출 추가
        const userEmail = profileData.email;
        const response = await axios.put(
          `${NGROK_URL}/user/${userEmail}`,
          editedProfileData
        );

        if (response.status === 200) {
          setProfileData(editedProfileData);
          Alert.alert("Success", "Profile updated successfully");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    }
    setIsEditing(!isEditing);
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
            style={[styles.nameInput, !isEditing && styles.disabledInput]}
            value={profileData.name}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Enter your name"
            placeholderTextColor="#999"
            editable={isEditing}
          />
          <TextInput
            style={[styles.emailInput, !isEditing && styles.disabledInput]}
            value={profileData.email}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, email: text }))
            }
            placeholder="Enter your email"
            placeholderTextColor="#999"
            editable={isEditing}
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
            style={[styles.locationInput, !isEditing && styles.disabledInput]}
            value={profileData.location}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, location: text }))
            }
            placeholder="Enter your location"
            placeholderTextColor="#999"
            editable={isEditing}
          />
        </View>

        {/* About Me */}
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TextInput
            style={[styles.bioInput, !isEditing && styles.disabledInput]}
            value={profileData.bio}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, bio: text }))
            }
            placeholder="Tell us about yourself..."
            placeholderTextColor="#999"
            multiline
            editable={isEditing}
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
          <TouchableOpacity
            style={[styles.editButton, isEditing && styles.saveButton]}
            onPress={handleEditProfile}
          >
            <MaterialIcons name="edit" size={20} color="#FFF" />
            <Text style={styles.buttonText}>
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.editButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <MaterialIcons name="logout" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
          {/* 계정 삭제 버튼 추가 */}
          <TouchableOpacity
            style={[styles.editButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <MaterialIcons name="delete-forever" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Delete Account</Text>
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
  deleteButton: {
    backgroundColor: "#DC3545", // 위험을 나타내는 빨간색
  },
  disabledInput: {
    opacity: 0.7,
    color: "#2D3436",
  },
  saveButton: {
    backgroundColor: "#4A9C76",
  },
});

export default Profile;
