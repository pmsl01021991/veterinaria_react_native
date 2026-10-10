import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export interface Cita {
  id: string;
  fecha?: string;
  hora?: string;
  servicio?: string;
  nombre?: string;
  duenio?: string;
  telefono?: string;
  notasAdicionales?: string;
  notas?: string;
  tipo?: string;
  raza?: string;
  edad?: string | number;
  estado?: string;
}

interface Props {
  cita: Cita;
  onEditar: (cita: Cita) => void;
  onEliminar: (cita: Cita) => void;
}


const obtenerIconoGenero = (nombre?: string): string => {
  const nombreLower = (nombre || '').trim().toLowerCase();

  const femeninos = [
    'ana', 'maria', 'sofia', 'carmen', 'laura', 'luisa',
    'patricia', 'rosa', 'elena', 'valeria', 'gabriela',
    'isabel', 'paola', 'lucia', 'mariana', 'alejandra',
    'flor', 'diana', 'camila', 'jessica', 'karla',
  ];

  const masculinos = [
    'juan', 'jose', 'carlos', 'luis', 'pedro', 'diego',
    'andres', 'jorge', 'manuel', 'david', 'alejandro',
    'francisco', 'miguel', 'ricardo', 'daniel', 'cristian',
    'sergio', 'oscar', 'raul', 'eduardo',
  ];

  const esF = femeninos.some((n) => nombreLower.includes(n));
  const esM = masculinos.some((n) => nombreLower.includes(n));

  if (esF) {
    return 'https://cdn-icons-png.flaticon.com/512/921/921087.png';
  }

  if (esM) {
    return 'https://cdn-icons-png.flaticon.com/512/921/921094.png';
  }

  return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
};


export default function CitaCard({
  cita,
  onEditar,
  onEliminar,
}: Props) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-4">       
        <View className="bg-[#eee8ff] w-12 h-12 rounded-full items-center justify-center overflow-hidden border border-gray-200">
        <Image
            source={{ uri: obtenerIconoGenero(cita.duenio) }}
            style={{ width: 46, height: 46 }}
            resizeMode="cover"
        />
        </View>


        <View className="flex-1 ml-3">
          <Text className="text-[#263b52] text-lg font-bold">
            {cita.nombre || 'Sin nombre'}
          </Text>
          <Text className="text-[#7b3fe4] font-semibold">
            {cita.servicio || 'Sin servicio'}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Mascota: {cita.tipo
                ? cita.tipo.charAt(0).toUpperCase() + cita.tipo.slice(1).toLowerCase()
                : 'Sin tipo'}
            </Text>
        </View>

        <View className="bg-yellow-100 px-3 py-1 rounded-full">
          <Text className="text-yellow-700 text-xs font-bold">
            {cita.estado || 'Pendiente'}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-4">
        <Text className="text-gray-600 mb-2">
          👤 Dueño: {cita.duenio || 'Sin registrar'}
        </Text>
        <Text className="text-gray-600 mb-2">
          📱 Teléfono: {cita.telefono || 'Sin registrar'}
        </Text>
        <Text className="text-gray-600 mb-2">
          📅 Fecha: {cita.fecha || 'Sin fecha'}
        </Text>
        <Text className="text-gray-600 mb-2">
          🕐 Hora: {cita.hora || 'Sin hora'}
        </Text>

        {cita.raza ? (
          <Text className="text-gray-600 mb-2">
            🐾 Raza: {cita.raza}
          </Text>
        ) : null}

        {cita.edad !== undefined && cita.edad !== '' ? (
          <Text className="text-gray-600 mb-2">
            🎂 Edad: {cita.edad}
          </Text>
        ) : null}

        {cita.notasAdicionales || cita.notas ? (
          <View className="bg-gray-50 rounded-xl p-3 mt-2">
            <Text className="text-gray-400 text-xs mb-1">
              Notas
            </Text>
            <Text className="text-[#263b52]">
              {cita.notasAdicionales || cita.notas}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row mt-5 gap-3">
        <TouchableOpacity
          onPress={() => onEditar(cita)}
          className="flex-1 bg-[#7b3fe4] py-3 rounded-xl items-center"
        >
          <Text className="text-white font-bold">
            ✏️ Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onEliminar(cita)}
          className="flex-1 bg-red-500 py-3 rounded-xl items-center"
        >
          <Text className="text-white font-bold">
            🗑 Eliminar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
