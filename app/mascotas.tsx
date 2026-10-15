
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import Header from '../components/Header';

interface Mascota {
  id: string;
  nombre?: string;
  tipo?: string;
  raza?: string;
  edad?: string | number;
  duenio?: string;
}

const iconosMascotas: Record<string, any> = {
  perro: require('../assets/huellitas/Imagenes/perro.png'),
  gato: require('../assets/huellitas/Imagenes/gato.webp'),
  ave: require('../assets/huellitas/Imagenes/loro.jpg'),
  pez: require('../assets/huellitas/Imagenes/pez.jpg'),
};

export default function Mascotas() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargarMascotas = async (refrescar = false) => {
    try {
      if (refrescar) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      const resultado = await getDocs(collection(db, 'mascotas'));

      const lista = resultado.docs.map((documento) => ({
        ...documento.data(),
        id: documento.id,
      })) as Mascota[];

      setMascotas(lista);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      Alert.alert('Error', 'No se pudieron cargar las mascotas.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarMascotas();
    }, [])
  );

  const mascotasFiltradas = mascotas.filter((mascota) =>
    (mascota.nombre || '')
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase())
  );

  const obtenerIcono = (tipo?: string) => {
    return iconosMascotas[(tipo || '').toLowerCase()] || iconosMascotas.perro;
  };

  const capitalizar = (texto?: string) => {
    if (!texto) return 'Sin especificar';

    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  return (
    <View className="flex-1 bg-[#f5f7fb]">
      <View className="flex-row items-center bg-[#7b3fe4] px-4 pt-10 pb-4">
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-white">
            🐾 Lista de Mascotas
          </Text>
        </View>

        <Header soloMenu compacto />
      </View>

      <View className="px-5 pt-5 pb-2">
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por nombre..."
          placeholderTextColor="#9ca3af"
          className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-base text-[#263b52]"
        />

        <Text className="mt-4 text-sm text-gray-500">
          {mascotasFiltradas.length}{' '}
          {mascotasFiltradas.length === 1 ? 'mascota encontrada' : 'mascotas encontradas'}
        </Text>
      </View>

      {cargando ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7b3fe4" />
          <Text className="mt-3 text-gray-500">
            Cargando mascotas...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 35 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={() => cargarMascotas(true)}
              colors={['#7b3fe4']}
            />
          }
        >
          {mascotasFiltradas.length === 0 ? (
            <View className="items-center py-12">
              <Text className="mb-4 text-5xl">🐾</Text>
              <Text className="text-center text-lg font-bold text-[#263b52]">
                {mascotas.length === 0
                  ? 'No hay mascotas registradas'
                  : 'No se encontraron mascotas'}
              </Text>
              <Text className="mt-2 text-center text-gray-500">
                {mascotas.length === 0
                  ? 'Las mascotas de Firebase aparecerán aquí.'
                  : 'Prueba con otro nombre.'}
              </Text>
            </View>
          ) : (
            mascotasFiltradas.map((mascota) => (
              <View
                key={mascota.id}
                className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white"
                style={{
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 5,
                }}
              >
                <View className="flex-row items-center justify-between bg-[#facc15] px-4 py-4">
                  <View className="flex-1 flex-row items-center">
                    <Image
                      source={obtenerIcono(mascota.tipo)}
                      style={{ width: 42, height: 42 }}
                      resizeMode="contain"
                    />

                    <Text
                      numberOfLines={2}
                      className="ml-3 flex-1 text-base font-bold text-gray-900"
                    >
                      {capitalizar(mascota.nombre)}
                    </Text>
                  </View>

                  <View className="ml-2 rounded-full bg-gray-900 px-3 py-1">
                    <Text className="text-xs font-bold text-white">
                      {capitalizar(mascota.tipo)}
                    </Text>
                  </View>
                </View>

                <View className="gap-3 p-5">
                  <Text className="text-[#333333]">
                    <Text className="font-bold">Raza: </Text>
                    {mascota.raza || 'Sin especificar'}
                  </Text>

                  <Text className="text-[#333333]">
                    <Text className="font-bold">Edad: </Text>
                    {mascota.edad !== undefined &&
                    mascota.edad !== null &&
                    mascota.edad !== ''
                      ? `${mascota.edad} años`
                      : 'Sin especificar'}
                  </Text>

                  <Text className="text-[#333333]">
                    <Text className="font-bold">Dueño: </Text>
                    {mascota.duenio || 'Sin registrar'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
