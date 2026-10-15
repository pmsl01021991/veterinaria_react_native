import { useCallback, useState } from 'react';
import {  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';

import { db } from '../services/firebase';

type Adopcion = {
  id: string;
  nombre?: string;
  tipo?: string;
  raza?: string;
  edad?: string | number;
  sexo?: string;
  salud?: string;
  descripcion?: string;
  imagenBase64?: string;
  estado?: string;
  usuarioRegistro?: string;
};

export default function AdopcionesDisponiblesScreen() {
  const [adopciones, setAdopciones] = useState<Adopcion[]>([]);
  const [usuarioActual, setUsuarioActual] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      let cancelarEscucha: (() => void) | undefined;

      const iniciar = async () => {
        try {
          setCargando(true);

          const usuarioGuardado = await AsyncStorage.getItem('user');
          const usuario = usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;

          const identificador =
            usuario?.username || usuario?.email || '';

          if (activo) {
            setUsuarioActual(identificador);
          }

          cancelarEscucha = onSnapshot(
            collection(db, 'adopciones'),
            (snapshot) => {
              if (!activo) return;

              const disponibles: Adopcion[] = snapshot.docs
                .map((documento) => ({
                  id: documento.id,
                  ...documento.data(),
                }) as Adopcion)
                .filter((mascota) => mascota.estado === 'Aceptada');

              setAdopciones(disponibles);
              setCargando(false);
              setRefrescando(false);
            },
            (error) => {
              console.error(
                'Error al escuchar las adopciones:',
                error,
              );

              if (activo) {
                setCargando(false);
                setRefrescando(false);
                Alert.alert(
                  'Error',
                  'No se pudieron cargar las mascotas disponibles.',
                );
              }
            },
          );
        } catch (error) {
          console.error('Error al iniciar adopciones:', error);

          if (activo) {
            setCargando(false);
            Alert.alert(
              'Error',
              'No se pudo obtener la información del usuario.',
            );
          }
        }
      };

      iniciar();

      return () => {
        activo = false;
        cancelarEscucha?.();
      };
    }, []),
  );

  const actualizarLista = async () => {
    setRefrescando(true);

    try {
      const resultado = await getDocs(collection(db, 'adopciones'));

      const disponibles: Adopcion[] = resultado.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }) as Adopcion)
        .filter((mascota) => mascota.estado === 'Aceptada');

      setAdopciones(disponibles);
    } catch (error) {
      console.error('Error al actualizar adopciones:', error);
      Alert.alert('Error', 'No se pudo actualizar la lista.');
    } finally {
      setRefrescando(false);
    }
  };

  const volver = () => {
    router.back();
  };

  const mostrarSolicitud = () => {
    Alert.alert(
      'Adopción',
      'La solicitud de adopción todavía no está implementada.',
    );
  };

  return (
    <View className="flex-1 bg-[#f5f8fb]">
      <View className="bg-[#7b3fe4] px-5 pb-6 pt-12">
        <TouchableOpacity
          onPress={volver}
          className="mb-5 self-start rounded-xl bg-white/20 px-4 py-2"
        >
          <Text className="font-semibold text-white">
            ← Volver
          </Text>
        </TouchableOpacity>

        <Text className="text-2xl font-extrabold text-white">
          🐾 Mascotas disponibles para adopción
        </Text>

        <Text className="mt-2 text-sm leading-5 text-white">
          Encuentra una mascota que está esperando una nueva familia.
        </Text>
      </View>

      {cargando ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7b3fe4" />
          <Text className="mt-3 text-gray-600">
            Cargando mascotas...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={actualizarLista}
              colors={['#7b3fe4']}
            />
          }
        >
          {adopciones.length === 0 ? (
            <View className="mt-8 items-center rounded-2xl bg-white p-6">
              <Text className="text-5xl">🐶</Text>
              <Text className="mt-4 text-center text-lg font-bold text-gray-800">
                No hay mascotas disponibles
              </Text>
              <Text className="mt-2 text-center leading-5 text-gray-500">
                Cuando haya mascotas aceptadas para adopción,
                aparecerán aquí.
              </Text>
            </View>
          ) : (
            adopciones.map((mascota) => {
              const registradaPorMi =
                Boolean(usuarioActual) &&
                mascota.usuarioRegistro === usuarioActual;

              return (
                <View
                  key={mascota.id}
                  className="mb-5 overflow-hidden rounded-2xl bg-white"
                  style={{
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                  }}
                >
                  {mascota.imagenBase64 ? (
                    <Image
                      source={{
                        uri: mascota.imagenBase64.startsWith('data:')
                          ? mascota.imagenBase64
                          : `data:image/jpeg;base64,${mascota.imagenBase64}`,
                      }}
                      className="h-64 w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-52 items-center justify-center bg-purple-50">
                      <Text className="text-7xl">🐾</Text>
                      <Text className="mt-2 text-gray-500">
                        Sin imagen
                      </Text>
                    </View>
                  )}

                  <View className="p-5">
                    <View className="mb-3 flex-row items-start justify-between">
                      <Text className="mr-2 flex-1 text-xl font-extrabold text-gray-800">
                        {mascota.nombre || 'Mascota sin nombre'}
                      </Text>

                      <View className="rounded-full bg-green-100 px-3 py-1">
                        <Text className="text-xs font-bold text-green-700">
                          Disponible
                        </Text>
                      </View>
                    </View>

                    <View className="gap-2">
                      <Text className="text-gray-700">
                        <Text className="font-bold">Tipo: </Text>
                        {mascota.tipo || 'No especificado'}
                      </Text>

                      <Text className="text-gray-700">
                        <Text className="font-bold">Raza: </Text>
                        {mascota.raza || 'No especificada'}
                      </Text>

                      <Text className="text-gray-700">
                        <Text className="font-bold">Edad: </Text>
                        {mascota.edad !== undefined &&
                        mascota.edad !== null &&
                        mascota.edad !== ''
                          ? `${mascota.edad}${typeof mascota.edad === 'number' ? ' años' : ''}`
                          : 'No especificada'}
                      </Text>

                      <Text className="text-gray-700">
                        <Text className="font-bold">Sexo: </Text>
                        {mascota.sexo || 'No especificado'}
                      </Text>

                      <Text className="text-gray-700">
                        <Text className="font-bold">Salud: </Text>
                        {mascota.salud || 'No especificada'}
                      </Text>
                    </View>

                    <View className="mt-4 border-t border-gray-100 pt-4">
                      <Text className="mb-1 font-bold text-gray-800">
                        Descripción
                      </Text>
                      <Text className="leading-5 text-gray-600">
                        {mascota.descripcion ||
                          'No hay una descripción disponible.'}
                      </Text>
                    </View>

                    {registradaPorMi && (
                      <View className="mt-4 rounded-xl bg-blue-50 p-3">
                        <Text className="font-semibold text-blue-700">
                          📝 Tú registraste esta mascota.
                        </Text>
                      </View>
                    )}

                    {!registradaPorMi && (
                      <TouchableOpacity
                        onPress={mostrarSolicitud}
                        className="mt-5 items-center rounded-xl bg-green-600 py-3"
                      >
                        <Text className="font-bold text-white">
                          🐾 Adoptar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}
