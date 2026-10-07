import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  servicio: string;
  nombreMascota: string;
  duenio: string;
  telefono: string;
  notasAdicionales?: string;
}

export default function Citas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarAdmin();
  }, []);

  const verificarAdmin = async () => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem('user');

      if (!usuarioGuardado) {
        router.replace('/login' as any);
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);

      if (usuario.rol !== 'admin') {
        Alert.alert(
          'Acceso denegado',
          'No tienes permisos para acceder a las citas.'
        );

        router.replace('/' as any);
        return;
      }

      cargarCitas();
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      router.replace('/' as any);
    }
  };

  const cargarCitas = async () => {
    try {
      setCargando(true);

      const consulta = query(
        collection(db, 'citas'),
        orderBy('fecha', 'asc')
      );

      const snapshot = await getDocs(consulta);

      const datos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Cita[];

      setCitas(datos);
    } catch (error) {
      console.error('Error al cargar citas:', error);

      Alert.alert(
        'Error',
        'No se pudieron cargar las citas.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f5f7fb]">
      
      <View className="bg-[#7b3fe4] px-5 pt-12 pb-5">
        <Text className="text-white text-2xl font-bold">
          Citas
        </Text>

        <Text className="text-white/80 text-sm mt-1">
          Gestión de citas veterinarias
        </Text>
      </View>

      {cargando ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#7b3fe4"
          />

          <Text className="text-gray-500 mt-3">
            Cargando citas...
          </Text>
        </View>
      ) : citas.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-5xl mb-4">
            📅
          </Text>

          <Text className="text-[#263b52] text-xl font-bold text-center">
            No hay citas registradas
          </Text>

          <Text className="text-gray-500 text-center mt-2">
            Las citas registradas desde el calendario aparecerán aquí.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-4">
            <Text className="text-[#263b52] text-lg font-bold">
              Citas registradas
            </Text>

            <Text className="text-gray-500 mt-1">
              Total: {citas.length}
            </Text>
          </View>

          {citas.map((cita) => (
            <View
              key={cita.id}
              className="bg-white rounded-2xl p-5 mb-4 border border-gray-100"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="bg-[#eee8ff] w-12 h-12 rounded-full items-center justify-center">
                    <Text className="text-2xl">
                      🐾
                    </Text>
                  </View>

                  <View className="ml-3">
                    <Text className="text-[#263b52] text-lg font-bold">
                      {cita.nombreMascota}
                    </Text>

                    <Text className="text-[#7b3fe4] font-semibold">
                      {cita.servicio}
                    </Text>
                  </View>
                </View>

                <View className="bg-yellow-100 px-3 py-1 rounded-full">
                  <Text className="text-yellow-700 text-xs font-bold">
                    Pendiente
                  </Text>
                </View>
              </View>

              <View className="border-t border-gray-100 pt-4">
                <View className="flex-row mb-3">
                  <Text className="text-lg mr-2">
                    📅
                  </Text>

                  <View>
                    <Text className="text-gray-400 text-xs">
                      Fecha
                    </Text>

                    <Text className="text-[#263b52] font-semibold">
                      {cita.fecha}
                    </Text>
                  </View>
                </View>

                <View className="flex-row mb-3">
                  <Text className="text-lg mr-2">
                    🕐
                  </Text>

                  <View>
                    <Text className="text-gray-400 text-xs">
                      Hora
                    </Text>

                    <Text className="text-[#263b52] font-semibold">
                      {cita.hora}
                    </Text>
                  </View>
                </View>

                <View className="flex-row mb-3">
                  <Text className="text-lg mr-2">
                    👤
                  </Text>

                  <View>
                    <Text className="text-gray-400 text-xs">
                      Dueño
                    </Text>

                    <Text className="text-[#263b52] font-semibold">
                      {cita.duenio}
                    </Text>
                  </View>
                </View>

                <View className="flex-row mb-3">
                  <Text className="text-lg mr-2">
                    📱
                  </Text>

                  <View>
                    <Text className="text-gray-400 text-xs">
                      Teléfono
                    </Text>

                    <Text className="text-[#263b52] font-semibold">
                      {cita.telefono}
                    </Text>
                  </View>
                </View>

                {cita.notasAdicionales ? (
                  <View className="bg-gray-50 rounded-xl p-3 mt-1">
                    <Text className="text-gray-400 text-xs mb-1">
                      Notas adicionales
                    </Text>

                    <Text className="text-[#263b52]">
                      {cita.notasAdicionales}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}