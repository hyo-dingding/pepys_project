import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
  Alert, // 추가
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { Keyboard } from "react-native";
import axios from "axios";

const nationalities = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "China",
  "Japan",
  "India",
  "Australia",
  "Brazil",
  "Mexico",
  "Russia",
  "South Korea",
  "Saudi Arabia",
  "South Africa",
  "Nigeria",
  "Argentina",
  "Italy",
  "Spain",
  "Indonesia",
  "Turkey",
  "Egypt",
  "Pakistan",
  "Iran",
  "Vietnam",
].sort();

const jobTitle = [
  "Chief Executive Officer (CEO)",
  "Chief Operating Officer (COO)",
  "Chief Financial Officer (CFO)",
  "Chief Technology Officer (CTO)",
  "Director",
  "Vice President",
  "General Manager",
  "Senior Manager",
  "Manager",
  "Project Manager",
  "Product Manager",
  "Business Analyst",
  "Data Analyst",
  "Software Engineer",
  "UI/UX Designer",
  "Marketing Manager",
  "Sales Manager",
  "Human Resources Manager",
  "Operations Manager",
  "Financial Analyst",
  "Consultant",
  "Lawyer",
  "Doctor",
  "Teacher",
  "Entrepreneur",
  "Freelancer",
  "Other (please specify)",
].sort();

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.35;

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLengthValid = password.length >= 8;

  return {
    isValid:
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar &&
      isLengthValid,
    requirements: {
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLengthValid,
    },
  };
};

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordReType, setPasswordReType] = useState("");
  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [showNationalityPicker, setShowNationalityPicker] = useState(false);
  const [showOccupationPicker, setShowOccupationPicker] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    isLengthValid: false,
  });
  const [passwordMatchError, setPasswordMatchError] = useState("");

  const navigation = useNavigation();

  const handleEmailChange = (text) => {
    setEmail(text);
    if (text.length > 0) {
      if (!validateEmail(text)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    const validation = validatePassword(text);
    setPasswordRequirements(validation.requirements);

    if (passwordReType && text !== passwordReType) {
      setPasswordMatchError("Passwords do not match");
    } else {
      setPasswordMatchError("");
    }
  };

  const handlePasswordReTypeChange = (text) => {
    setPasswordReType(text);
    if (text && password !== text) {
      setPasswordMatchError("Passwords do not match");
    } else {
      setPasswordMatchError("");
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await axios.post(
        "https://38f1-218-148-117-157.ngrok-free.app/user",
        {
          email: email,
          password: password,
          password_retype: password,
          name: name,
          nationality: nationality,
          work_title: workTitle,
        }
      );

      console.log(response.data);
      console.log(response.status);

      // axios는 2xx 상태 코드일 때 성공으로 처리됩니다
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Sign up completed successfully.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("MainTabs"),
          },
        ]);
      }
    } catch (error) {
      console.error("SignUp Error:", error);

      // axios 에러 응답 처리
      if (error.response) {
        // 서버가 응답을 반환한 경우
        if (
          error.response.status === 400 &&
          error.response.data.detail === "Email already registered"
        ) {
          Alert.alert("Error", "Email is already registered.");
        } else {
          Alert.alert(
            "Error",
            "An error occurred during sign up. Please try again."
          );
        }
      } else if (error.request) {
        // 요청이 전송되었지만 응답을 받지 못한 경우
        Alert.alert(
          "Error",
          "Failed to connect to server. Please check your network connection."
        );
      } else {
        // 요청 설정 중에 문제가 발생한 경우
        Alert.alert("Error", "An error occurred while setting up the request.");
      }
    }
  };

  const renderPicker = (visible, data, onSelect, onClose, title) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={styles.pickerItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={true}
              bounces={false}
              overScrollMode="never"
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Enter your email"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A0A0A0"
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  passwordMatchError ? styles.inputError : null,
                ]}
                placeholder="Enter your password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                placeholderTextColor="#A0A0A0"
              />
              <View style={styles.requirementsList}>
                <Text
                  style={[
                    styles.requirementText,
                    passwordRequirements.isLengthValid
                      ? styles.requirementMet
                      : styles.requirementNotMet,
                  ]}
                >
                  • Minimum 8 characters
                </Text>
                <Text
                  style={[
                    styles.requirementText,
                    passwordRequirements.hasUpperCase
                      ? styles.requirementMet
                      : styles.requirementNotMet,
                  ]}
                >
                  • At least one uppercase letter
                </Text>
                <Text
                  style={[
                    styles.requirementText,
                    passwordRequirements.hasLowerCase
                      ? styles.requirementMet
                      : styles.requirementNotMet,
                  ]}
                >
                  • At least one lowercase letter
                </Text>
                <Text
                  style={[
                    styles.requirementText,
                    passwordRequirements.hasNumbers
                      ? styles.requirementMet
                      : styles.requirementNotMet,
                  ]}
                >
                  • At least one number
                </Text>
                <Text
                  style={[
                    styles.requirementText,
                    passwordRequirements.hasSpecialChar
                      ? styles.requirementMet
                      : styles.requirementNotMet,
                  ]}
                >
                  • At least one special character
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  passwordMatchError ? styles.inputError : null,
                ]}
                placeholder="Confirm your password"
                value={passwordReType}
                onChangeText={handlePasswordReTypeChange}
                secureTextEntry
                placeholderTextColor="#A0A0A0"
              />
              {passwordMatchError && (
                <Text style={styles.errorText}>{passwordMatchError}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nationality</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowNationalityPicker(true)}
              >
                <Text
                  style={
                    nationality ? styles.pickerTextSelected : styles.pickerText
                  }
                >
                  {nationality || "Select your nationality"}
                </Text>
                <Icon name="chevron-down" size={20} color="#A0A0A0" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>job Title</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowOccupationPicker(true)}
              >
                <Text
                  style={
                    workTitle ? styles.pickerTextSelected : styles.pickerText
                  }
                >
                  {workTitle || "Select your job Title"}
                </Text>
                <Icon name="chevron-down" size={20} color="#A0A0A0" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.signUpButton,
              (!validateEmail(email) ||
                !validatePassword(password).isValid ||
                password !== passwordReType ||
                !name ||
                !nationality ||
                !workTitle) &&
                styles.signUpButtonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={
              !validateEmail(email) ||
              !validatePassword(password).isValid ||
              password !== passwordReType ||
              !name ||
              !nationality ||
              !workTitle
            }
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>

          {renderPicker(
            showNationalityPicker,
            nationalities,
            setNationality,
            () => setShowNationalityPicker(false),
            "Select Nationality"
          )}

          {renderPicker(
            showOccupationPicker,
            jobTitle,
            setWorkTitle,
            () => setShowOccupationPicker(false),
            "Select jobTitles"
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingTop: 0,
  },
  titleContainer: {
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  inputRequired: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
  pickerButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  pickerText: {
    fontSize: 14,
    color: "#A0A0A0",
  },
  pickerTextSelected: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  signUpButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  signUpButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: MODAL_HEIGHT,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  pickerItemText: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  requirementsList: {
    marginTop: 4,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 2,
  },
  requirementMet: {
    color: "#34C759",
  },
  requirementNotMet: {
    color: "#666666",
  },
});

export default SignUp;
