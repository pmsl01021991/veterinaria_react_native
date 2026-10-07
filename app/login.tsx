import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../services/firebase';

export default function LoginScreen() {
  const router = useRouter();

  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const validarEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validarPassword = (pass: string) => {
    return /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(pass);
  };

  const limpiarFormulario = () => {
    setUsername('');
    setPassword('');
    setPassword1('');
    setPassword2('');
    setError('');
    setTermsAccepted(false);
  };

  const cambiarModo = () => {
    setMostrarRegistro(!mostrarRegistro);
    setError('');
    setPassword('');
    setPassword1('');
    setPassword2('');
  };

  const handleLogin = async () => {
    setError('');

    if (!validarEmail(username)) {
      setError('Correo inválido.');
      return;
    }

    if (!validarPassword(password)) {
      setError(
        'La contraseña debe tener mínimo 6 caracteres, letras y números.'
      );
      return;
    }

    setCargando(true);

    try {
      // ADMINISTRADOR
      if (
        username === 'admin@gmail.com' &&
        password === 'pmsl123'
      ) {
        const adminUser = {
          username,
          password,
          rol: 'admin',
        };

        await AsyncStorage.setItem(
          'user',
          JSON.stringify(adminUser)
        );

        router.replace('/');

        return;
      }

      // BUSCAR USUARIO EN FIRESTORE
      const ref = collection(db, 'usuarios');

      const filtro = query(
        ref,
        where('username', '==', username),
        where('password', '==', password)
      );

      const resultado = await getDocs(filtro);

      if (resultado.empty) {
        setError('Credenciales incorrectas.');
        return;
      }

      const usuarioFirestore = resultado.docs[0];

      const userData = usuarioFirestore.data();

      const nombreLimpio = username.split('@')[0];

      const usuarioLogueado = {
        id: usuarioFirestore.id,
        ...userData,
        name: nombreLimpio,
      };

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(usuarioLogueado)
      );

      router.replace('/');

    } catch (err) {
      console.error('Error en login:', err);
      setError(
        'No se pudo conectar con Firestore.'
      );
    } finally {
      setCargando(false);
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!validarEmail(username)) {
      setError('Correo inválido.');
      return;
    }

    if (!validarPassword(password1)) {
      setError(
        'La contraseña debe tener mínimo 6 caracteres, letras y números.'
      );
      return;
    }

    if (password1 !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!termsAccepted) {
      setError(
        'Debes aceptar los términos y condiciones.'
      );
      return;
    }

    setCargando(true);

    try {
      const ref = collection(db, 'usuarios');

      // VERIFICAR SI YA EXISTE
      const filtro = query(
        ref,
        where('username', '==', username)
      );

      const resultado = await getDocs(filtro);

      if (!resultado.empty) {
        setError('Este correo ya está registrado.');
        return;
      }

      // CREAR USUARIO
      await addDoc(ref, {
        username,
        password: password1,
        rol: 'cliente',
      });

      setMostrarRegistro(false);

      limpiarFormulario();

    } catch (err) {
      console.error('Error al registrar:', err);

      setError(
        'No se pudo registrar el usuario en Firestore.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#f5f8fb]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >

        <View className="rounded-3xl bg-white p-6 shadow-sm">

          {/* ICONO */}
          <View className="mb-5 items-center">

            <View className="h-20 w-20 items-center justify-center rounded-full bg-[#ffc107]">
              <Text className="text-4xl">
                🐾
              </Text>
            </View>

          </View>

          {/* TÍTULO */}
          <Text className="text-center text-2xl font-bold text-[#263b52]">
            {mostrarRegistro
              ? 'Crear Cuenta'
              : 'Iniciar Sesión'}
          </Text>

          <Text className="mt-2 text-center text-sm text-gray-500">
            {mostrarRegistro
              ? 'Regístrate para acceder a Huellitas'
              : 'Ingresa a tu cuenta de Huellitas'}
          </Text>

          {/* CORREO */}
          <View className="mt-7">

            <Text className="mb-2 text-sm font-semibold text-gray-700">
              Correo electrónico
            </Text>

            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-800"
            />

          </View>

          {/* CONTRASEÑA */}
          <View className="mt-4">

            <Text className="mb-2 text-sm font-semibold text-gray-700">
              Contraseña
            </Text>

            <TextInput
              value={mostrarRegistro ? password1 : password}
              onChangeText={
                mostrarRegistro
                  ? setPassword1
                  : setPassword
              }
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-800"
            />

          </View>

          {/* CONFIRMAR CONTRASEÑA */}
          {mostrarRegistro && (
            <View className="mt-4">

              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Confirmar contraseña
              </Text>

              <TextInput
                value={password2}
                onChangeText={setPassword2}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-800"
              />

            </View>
          )}

          {/* TÉRMINOS */}
          {mostrarRegistro && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setTermsAccepted(!termsAccepted)
              }
              className="mt-5 flex-row items-center"
            >

              <View
                className={`mr-3 h-6 w-6 items-center justify-center rounded-md border ${
                  termsAccepted
                    ? 'border-[#377fb2] bg-[#377fb2]'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {termsAccepted && (
                  <Text className="font-bold text-white">
                    ✓
                  </Text>
                )}
              </View>

              <Text className="flex-1 text-sm text-gray-600">
                Acepto los términos y condiciones
              </Text>

            </TouchableOpacity>
          )}

          {/* ERROR */}
          {error !== '' && (
            <View className="mt-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-center text-sm text-red-600">
                {error}
              </Text>
            </View>
          )}

          {/* BOTÓN */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={cargando}
            onPress={
              mostrarRegistro
                ? handleRegister
                : handleLogin
            }
            className={`mt-6 rounded-xl px-5 py-4 ${
              cargando
                ? 'bg-gray-400'
                : 'bg-[#377fb2]'
            }`}
          >

            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-base font-bold text-white">
                {mostrarRegistro
                  ? 'Crear Cuenta'
                  : 'Iniciar Sesión'}
              </Text>
            )}

          </TouchableOpacity>

          {/* CAMBIAR LOGIN / REGISTRO */}
          <View className="mt-6 flex-row justify-center">

            <Text className="text-sm text-gray-500">
              {mostrarRegistro
                ? '¿Ya tienes cuenta? '
                : '¿No tienes cuenta? '}
            </Text>

            <TouchableOpacity
              onPress={cambiarModo}
            >
              <Text className="text-sm font-bold text-[#377fb2]">
                {mostrarRegistro
                  ? 'Inicia sesión'
                  : 'Regístrate aquí'}
              </Text>
            </TouchableOpacity>

          </View>

          {/* VOLVER */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-5"
          >
            <Text className="text-center text-sm text-gray-400">
              ← Volver
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}