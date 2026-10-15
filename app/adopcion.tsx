
import { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';

export default function AdopcionScreen() {
  const [esAdministrador, setEsAdministrador] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarUsuario = async () => {
        try {
          const guardado = await AsyncStorage.getItem('user');
          const usuario = guardado ? JSON.parse(guardado) : null;

          if (activo) {
            setEsAdministrador(usuario?.rol === 'admin');
          }
        } catch (error) {
          console.error('Error al cargar usuario:', error);
        }
      };

      cargarUsuario();

      return () => {
        activo = false;
      };
    }, []),
  );

  return (
    <View className="flex-1 bg-[#f5f8fb]">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        {/* PRESENTACIÓN */}
        <View className="bg-[#377fb2] px-6 py-12">
          <Text className="mb-3 text-center font-bold uppercase tracking-widest text-white">
            🐾 Adopción responsable
          </Text>

          <Text className="text-center text-3xl font-extrabold leading-10 text-white">
            Una segunda oportunidad puede cambiar una vida
          </Text>

          <Text className="mt-4 text-center text-base leading-6 text-white">
            Cada mascota merece un hogar lleno de amor, cuidado y
            cariño. Ayúdanos a encontrarle una familia.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/adopciones-disponibles')}
            className="mt-7 items-center rounded-xl bg-white px-5 py-4"
          >
            <Text className="font-bold text-[#377fb2]">
              🐶 Quiero adoptar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/dar-en-adopcion')}
            className="mt-3 items-center rounded-xl border border-white px-5 py-4"
          >
            <Text className="font-bold text-white">
              ❤️ Dar en adopción
            </Text>
          </TouchableOpacity>

          {esAdministrador && (
            <TouchableOpacity
              onPress={() => router.push('/adopciones-admin' as any)}
              className="mt-3 items-center rounded-xl bg-[#f3c969] px-5 py-4"
            >
              <Text className="font-bold text-gray-900">
                🐾 Ver adopciones
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* INFORMACIÓN */}
        <View className="px-5 py-8">
          <Text className="text-center text-2xl font-extrabold text-[#263b52]">
            Una nueva oportunidad
          </Text>

          <Text className="mt-3 text-center leading-6 text-gray-600">
            Adoptar es abrir las puertas de tu hogar y de tu corazón
            a un compañero que necesita una familia.
          </Text>

          {[
            {
              emoji: '🏡',
              titulo: 'Una nueva familia',
              descripcion:
                'Brinda compañía, cariño y seguridad a una mascota.',
            },
            {
              emoji: '❤️',
              titulo: 'Un nuevo hogar',
              descripcion:
                'Ayuda a una mascota a comenzar una nueva etapa de su vida.',
            },
            {
              emoji: '🐾',
              titulo: 'Adopción responsable',
              descripcion:
                'Comprométete con su alimentación, salud y bienestar.',
            },
          ].map((item) => (
            <View
              key={item.titulo}
              className="mt-4 rounded-2xl bg-white p-5"
              style={{ elevation: 2 }}
            >
              <Text className="text-3xl">{item.emoji}</Text>

              <Text className="mt-3 text-lg font-bold text-[#263b52]">
                {item.titulo}
              </Text>

              <Text className="mt-2 leading-6 text-gray-600">
                {item.descripcion}
              </Text>
            </View>
          ))}
        </View>

        {/* CÓMO FUNCIONA */}
        <View className="bg-white px-5 py-8">
          <Text className="text-center text-2xl font-extrabold text-[#263b52]">
            ¿Cómo funciona?
          </Text>

          {[
            { numero: '1', titulo: 'Busca', descripcion: 'Conoce las mascotas disponibles.' },
            { numero: '2', titulo: 'Conoce', descripcion: 'Revisa su información y necesidades.' },
            { numero: '3', titulo: 'Elige', descripcion: 'Encuentra a tu compañero ideal.' },
            { numero: '4', titulo: 'Adopta', descripcion: 'Dale una oportunidad y un hogar.' },
          ].map((paso) => (
            <View
              key={paso.numero}
              className="mt-5 flex-row items-center"
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-[#377fb2]">
                <Text className="text-lg font-extrabold text-white">
                  {paso.numero}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="font-bold text-[#263b52]">
                  {paso.titulo}
                </Text>
                <Text className="mt-1 text-gray-600">
                  {paso.descripcion}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* LLAMADA FINAL */}
        <View className="mx-5 mt-7 rounded-2xl bg-[#377fb2] px-5 py-8">
          <Text className="text-center text-2xl font-extrabold text-white">
            ¿Estás listo para cambiar una vida?
          </Text>

          <Text className="mt-3 text-center leading-6 text-white">
            Tu próximo mejor amigo podría estar esperándote.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/adopciones-disponibles')}
            className="mt-6 items-center rounded-xl bg-white px-5 py-4"
          >
            <Text className="font-bold text-[#377fb2]">
              Ver mascotas disponibles
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
