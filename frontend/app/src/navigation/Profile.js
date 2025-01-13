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
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import firebaseApp from "../../utils/firebaseConfig";
import { auth, firestore } from "../../utils/firebaseConfig";
import axios from "axios";
import { NGROK_URL } from "@env";

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
  const navigation = useNavigation();

  // Firestore에 프로필 데이터를 저장하는 함수
  const saveUserProfile = async () => {
    console.log("Edit Profile button pressed");
    const userToken = await AsyncStorage.getItem("access_token");

    if (userToken) {
      try {
        const response = await axios.get(`${NGROK_URL}/auth/users/me`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        const userInfo = response.data;

        await setDoc(doc(firestore, "users", userInfo.id), {
          photoURL: profileData.photo,
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio,
          location: profileData.location,
          connections: profileData.connections,
          meetings: profileData.meetings,
          interests: profileData.interests,
        });

        console.log("Profile updated in Firestore");
        Alert.alert("Success", "Profile updated successfully!");
      } catch (error) {
        console.error("Error saving user profile:", error);
        Alert.alert("Error", "Failed to save profile. Please try again.");
      }
    } else {
      console.log("사용자가 로그인되지 않았습니다.");
    }
  };

  // Firestore에서 사용자 프로필 가져오는 함수
  const fetchUserProfile = async () => {
    const userToken = await AsyncStorage.getItem("access_token");

    if (userToken) {
      const userInfo = JSON.parse(await AsyncStorage.getItem("user_info"));

      if (userInfo) {
        setProfileData({
          photo: userInfo.photoURL,
          name: userInfo.name,
          email: userInfo.email,
          bio: userInfo.bio || "",
          location: userInfo.location || "",
          connections: userInfo.connections || "0",
          meetings: userInfo.meetings || "0",
          interests: userInfo.interests || [],
        });
      } else {
        console.log("사용자 정보가 없습니다.");
      }
    } else {
      console.log("사용자가 로그인되지 않았습니다.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handlePhotoSelect = async () => {
    const userToken = await AsyncStorage.getItem("access_token");
    if (!userToken) {
      console.log("사용자가 로그인되지 않았습니다.");
      return;
    }
    // 사진 접근 권한 요청
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("카메라 롤에 접근하기 위한 권한이 필요합니다!");
      return;
    }

    // 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Firebase Storage에 이미지 업로드
      const storage = getStorage();
      const storageRef = ref(storage, `user-images/${userToken}.jpg`); // userToken을 사용하여 파일명 생성
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // MongoDB에 업로드된 이미지 URL 업데이트
      await updateUserInMongoDB(userToken, downloadURL);
      // `profileData.photo`에 새 이미지 URL 반영
      setProfileData((prev) => ({
        ...prev,
        photo: downloadURL,
      }));
    }
  };

  const updateUserInMongoDB = async (token, photoURL) => {
    try {
      const response = await axios.post(
        `${NGROK_URL}/auth/users/${token}/photo`, // userId 대신 토큰을 활용하여 서버에서 userId를 찾도록 설정
        { photoURL },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("MongoDB updated successfully", response.data);
    } catch (error) {
      console.error("Error updating MongoDB:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("access_token");
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
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
                      // TODO: 계정 삭제 API 연동
                      console.log("Account deleted");
                      // 로그아웃 처리나 로그인 화면으로 이동 로직 추가
                    } catch (error) {
                      Alert.alert(
                        "Error",
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
          <TouchableOpacity style={styles.editButton} onPress={saveUserProfile}>
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
    marginTop: 8, // 다른 버튼들과 약간의 간격
  },
});

export default Profile;
