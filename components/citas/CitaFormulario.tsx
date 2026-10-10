
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import type { Cita } from './CitaCard';

interface Props {
  visible: boolean;
  cita: Cita | null;
  guardando: boolean;
  modo: 'crear' | 'editar';
  onCerrar: () => void;
  onGuardar: (datos: Partial<Cita>) => void;
}

const servicios = [
  'consulta general',
  'vacunacion',
  'baño y peluqueria',
  'desparacitacion',
  'control y chequeo',
  'emergencia veterinaria',
];

export default function CitaFormulario({
  visible,
  cita,
  guardando,
  modo,
  onCerrar,
  onGuardar,
}: Props) {
  const [datos, setDatos] = useState<Partial<Cita>>({});

  useEffect(() => {
    if (cita) {
      setDatos({
        duenio: cita.duenio || '',
        nombre: cita.nombre || '',
        telefono: cita.telefono || '',
        tipo: cita.tipo || 'perro',
        raza: cita.raza || '',
        edad: cita.edad ?? '',
        servicio: cita.servicio || servicios[0],
        fecha: cita.fecha || '',
        hora: cita.hora || '',
        notas: cita.notas || '',
        notasAdicionales: cita.notasAdicionales || '',
        estado: cita.estado || 'Pendiente',
      });
    }
  }, [cita]);

  const cambiar = (campo: keyof Cita, valor: string) => {
    setDatos((actuales) => ({
      ...actuales,
      [campo]: valor,
    }));
  };

  const campo = (
    etiqueta: string,
    propiedad: keyof Cita,
    opciones: {
      teclado?: 'default' | 'phone-pad' | 'numeric';
      multilinea?: boolean;
    } = {}
  ) => (
    <View className="mb-4">
      <Text className="text-[#263b52] font-semibold mb-2">
        {etiqueta}
      </Text>
      <TextInput
        value={String(datos[propiedad] ?? '')}
        onChangeText={(valor) => cambiar(propiedad, valor)}
        keyboardType={opciones.teclado || 'default'}
        multiline={opciones.multilinea}
        textAlignVertical={opciones.multilinea ? 'top' : 'center'}
        placeholder={etiqueta}
        placeholderTextColor="#9ca3af"
        className="border border-gray-200 rounded-xl px-4 py-3 text-[#263b52] bg-white"
        style={opciones.multilinea ? { minHeight: 90 } : undefined}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCerrar}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-[#f5f7fb]"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="bg-[#7b3fe4] px-5 pt-12 pb-5">
          <Text className="text-white text-2xl font-bold">
            {modo === 'crear' ? '➕ Nueva cita' : '✏️ Editar cita'}
            </Text>

            <Text className="text-white/80 mt-1">
            {modo === 'crear'
                ? 'Registra una nueva cita veterinaria'
                : 'Modifica los datos de la mascota'}
            </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 35 }}
          keyboardShouldPersistTaps="handled"
        >
          {campo('Nombre del dueño', 'duenio')}
          {campo('Nombre de la mascota', 'nombre')}
          {campo('Teléfono', 'telefono', { teclado: 'phone-pad' })}

          <Text className="text-[#263b52] font-semibold mb-2">
            Tipo de mascota
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {['perro', 'gato', 'ave', 'pez'].map((tipo) => (
              <TouchableOpacity
                key={tipo}
                onPress={() => cambiar('tipo', tipo)}
                className={`px-4 py-3 rounded-xl ${
                  datos.tipo === tipo
                    ? 'bg-[#7b3fe4]'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    datos.tipo === tipo ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {campo('Raza', 'raza')}
          {campo('Edad', 'edad', { teclado: 'numeric' })}

          <Text className="text-[#263b52] font-semibold mb-2">
            Servicio
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {servicios.map((servicio) => (
              <TouchableOpacity
                key={servicio}
                onPress={() => cambiar('servicio', servicio)}
                className={`px-3 py-3 rounded-xl ${
                  datos.servicio === servicio
                    ? 'bg-[#7b3fe4]'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm ${
                    datos.servicio === servicio
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {servicio}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {campo('Fecha (AAAA-MM-DD)', 'fecha')}
          {campo('Hora (HH:MM)', 'hora')}

          <Text className="text-[#263b52] font-semibold mb-2">
            Estado
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {['Pendiente', 'Confirmada', 'Completada', 'Cancelada'].map(
              (estado) => (
                <TouchableOpacity
                  key={estado}
                  onPress={() => cambiar('estado', estado)}
                  className={`px-3 py-3 rounded-xl ${
                    datos.estado === estado
                      ? 'bg-[#7b3fe4]'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text
                    className={
                      datos.estado === estado
                        ? 'text-white font-semibold'
                        : 'text-gray-700'
                    }
                  >
                    {estado}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {campo('Notas adicionales', 'notasAdicionales', {
            multilinea: true,
          })}

          <View className="gap-3 mt-2">
            <TouchableOpacity
              disabled={guardando}
              onPress={() => {
                if (
                    !datos.duenio?.trim() ||
                    !datos.nombre?.trim() ||
                    !datos.telefono?.trim()
                ) {
                    Alert.alert(
                    'Campos obligatorios',
                    'Completa el nombre del dueño, la mascota y el teléfono.'
                    );
                    return;
                }

                onGuardar(datos);
                }}
              className={`py-4 rounded-xl items-center ${
                guardando ? 'bg-purple-300' : 'bg-[#7b3fe4]'
              }`}
            >
              <Text className="text-white font-bold">
                {guardando
                    ? 'Guardando...'
                    : modo === 'crear'
                    ? '💾 Registrar cita'
                    : '💾 Guardar cambios'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCerrar}
              disabled={guardando}
              className="py-4 rounded-xl items-center bg-gray-200"
            >
              <Text className="text-gray-700 font-bold">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
