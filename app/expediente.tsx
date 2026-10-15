
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import Header from '../components/Header';

interface ExpedienteData {
  id: string;
  nombre?: string;
  tipo?: string;
  raza?: string;
  fecha?: string;
  hora?: string;
  peso?: string | number;
  temperatura?: string | number;
  diagnostico?: string;
  sintomas?: string;
  tratamiento?: string;
  medicamentos?: string;
  notas?: string;
  creado?: string;
  duenio?: string;
  servicio?: string;
  estado?: string;
}

export default function ExpedienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [cita, setCita] = useState<ExpedienteData | null>(null);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!id) {
        setCargando(false);
        return;
      }

      setCargando(true);

      const referencia = doc(db, 'mascotas', String(id));

      const cancelarEscucha = onSnapshot(
        referencia,
        (snapshot) => {
          if (!snapshot.exists()) {
            setCita(null);
            setCargando(false);
            return;
          }

          setCita({
            id: snapshot.id,
            ...snapshot.data(),
          } as ExpedienteData);

          setCargando(false);
        },
        (error) => {
          console.error('Error al cargar expediente:', error);
          setCargando(false);
          Alert.alert('Error', 'No se pudo cargar el expediente.');
        }
      );

      return cancelarEscucha;
    }, [id])
  );

  const volver = () => {
    router.replace('/historial' as any);
  };

  const mostrarDato = (valor?: string | number, alternativo = 'No registrado') =>
    valor !== undefined && valor !== null && valor !== ''
      ? String(valor)
      : alternativo;

  if (cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#7b3fe4" />
        <Text className="mt-3 text-gray-500">Cargando expediente...</Text>
      </View>
    );
  }

  if (!cita) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="mb-4 text-center text-lg text-gray-700">
          No se encontró el expediente.
        </Text>
        <TouchableOpacity
          onPress={volver}
          className="rounded-xl bg-purple-600 px-5 py-3"
        >
          <Text className="font-bold text-white">Volver al historial</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imagen =
    cita.tipo?.toLowerCase() === 'gato'
      ? require('../assets/huellitas/Imagenes/gato.webp')
      : require('../assets/huellitas/Imagenes/perro.png');

  return (
    
        <View className="flex-1 bg-gray-50">
        
            <View
            className="bg-[#7b3fe4] pr-3"
            style={{ paddingTop: 35 }}
            >
            <Header soloMenu compacto />
            </View>



      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        
        <View
        className="mb-4 rounded-2xl p-5"
        style={{ backgroundColor: '#7b3fe4' }}
        >
        <Text className="mb-3 text-xl font-bold text-white">
            Expediente veterinario
        </Text>

        <Text className="mb-4 text-white">
            📅 {mostrarDato(cita.fecha, 'Sin fecha')}
        </Text>

        <TouchableOpacity
            onPress={volver}
            className="self-start rounded-xl bg-white px-4 py-3"
        >
            <Text className="font-bold text-purple-700">
            ← Volver a la lista
            </Text>
        </TouchableOpacity>
        </View>


        <View className="mb-4 flex-row items-center rounded-2xl bg-white p-4">
          <Image
            source={imagen}
            resizeMode="contain"
            style={{ width: 76, height: 76 }}
          />

          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-gray-800">
              {mostrarDato(cita.nombre, 'Sin nombre')}
            </Text>
            <Text className="mt-1 text-gray-600">
              Tipo: {mostrarDato(cita.tipo)}
            </Text>
            <Text className="text-gray-600">
              Raza: {mostrarDato(cita.raza, 'Sin raza')}
            </Text>
          </View>
        </View>

        <View className="mb-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-white p-4">
            <Text className="mb-2 text-sm font-bold text-gray-500">PESO</Text>
            <Text className="text-xl font-bold text-gray-800">
              {mostrarDato(cita.peso, '4')} kg
            </Text>
          </View>

          <View className="flex-1 rounded-2xl bg-white p-4">
            <Text className="mb-2 text-sm font-bold text-gray-500">
              TEMPERATURA
            </Text>
            <Text className="text-xl font-bold text-gray-800">
              {mostrarDato(cita.temperatura, '37')} °C
            </Text>
          </View>
        </View>

        {[
          { titulo: '🩺 Diagnóstico', valor: cita.diagnostico },
          { titulo: '🩹 Síntomas reportados', valor: cita.sintomas },
          { titulo: '💡 Plan de tratamiento', valor: cita.tratamiento },
          { titulo: '💊 Medicamentos prescritos', valor: cita.medicamentos },
          { titulo: '📝 Notas clínicas', valor: cita.notas },
        ].map((item) => (
          <View key={item.titulo} className="mb-3 rounded-2xl bg-white p-4">
            <Text className="mb-2 font-bold text-gray-800">
              {item.titulo}
            </Text>
            <Text className="leading-6 text-gray-600">
              {mostrarDato(item.valor, 'No se registró información.')}
            </Text>
          </View>
        ))}

        <View className="mb-4 rounded-2xl bg-white p-4">
          <Text className="mb-3 text-lg font-bold text-gray-800">
            Información general
          </Text>

          {[
            { etiqueta: 'ID del registro', valor: cita.id },
            { etiqueta: 'Fecha de visita', valor: cita.fecha },
            { etiqueta: 'Hora', valor: cita.hora },
            { etiqueta: 'Cliente', valor: cita.duenio },
            { etiqueta: 'Servicio', valor: cita.servicio },
            { etiqueta: 'Estado', valor: cita.estado || 'Pendiente' },
            { etiqueta: 'Creado el', valor: cita.creado },
          ].map((item) => (
            <View
              key={item.etiqueta}
              className="flex-row justify-between border-b border-gray-100 py-3"
            >
              <Text className="flex-1 font-semibold text-gray-600">
                {item.etiqueta}
              </Text>
              <Text className="ml-3 flex-1 text-right text-gray-800">
                {mostrarDato(item.valor)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
