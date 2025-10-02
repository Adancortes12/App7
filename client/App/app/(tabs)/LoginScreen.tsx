import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";



import Constants from "expo-constants";

const host = (Constants.manifest2?.extra?.expoGo?.debuggerHost ||
              Constants.manifest?.debuggerHost ||
              "localhost").split(":")[0];

const BASE_URL = `http://${host}:8080`;



type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    if (!usuario.trim() || !password) {
      return Alert.alert("Faltan datos", "Ingresa usuario y contraseña.");
    }

    try {
      const resp = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      if (resp.status === 401) {
        return Alert.alert("Error", "Credenciales inválidas");
      }
      if (!resp.ok) {
        return Alert.alert("Error", "No se pudo iniciar sesión");
      }

      const data = await resp.json();
      if (data.success) {
        // ✅ Redirige a Home
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", data.message || "Credenciales inválidas");
      }
    } catch (e) {
      Alert.alert("Red", "No se pudo conectar con el servidor (¿backend encendido?).");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario o correo"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 30, backgroundColor: "#f5f5f5" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: "#fff" },
  button: { backgroundColor: "#007BFF", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
