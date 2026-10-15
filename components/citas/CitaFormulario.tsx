import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert,} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Cita } from './CitaCard';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

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
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarHoras, setMostrarHoras] = useState(false);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  const horariosDisponibles = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  };

  const convertirFecha = (fecha: string) => {
    if (!fecha) return new Date();

    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
  };

  const fechaMinima = obtenerFechaLocal();

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

  useEffect(() => {
  if (visible && datos.fecha) {
    cargarHorasOcupadas(datos.fecha);
  } else {
    setHorasOcupadas([]);
  }
}, [visible, datos.fecha, cita]);

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

  const cargarHorasOcupadas = async (fecha: string) => {
  if (!fecha) {
    setHorasOcupadas([]);
    return;
  }

  try {
    setCargandoHoras(true);

    const consulta = query(
      collection(db, 'mascotas'),
      where('fecha', '==', fecha)
    );

    const resultado = await getDocs(consulta);

    const ocupadas = resultado.docs
      .filter((documento) => {
        const reserva = documento.data();
        const estado = String(reserva.estado || '').toLowerCase();

        return documento.id !== (cita as any)?.id &&
          estado !== 'cancelada' &&
          estado !== 'cancelado';
      })
      .map((documento) => String(documento.data().hora || ''))
      .filter(Boolean);

    setHorasOcupadas(ocupadas);
  } catch (error) {
    console.error('Error al consultar horarios:', error);

    Alert.alert(
      'Error',
      'No se pudo consultar la disponibilidad de horarios.'
    );
  } finally {
    setCargandoHoras(false);
  }
};

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

          {/* FECHA */}
          <View className="mb-4">
            <Text className="text-[#263b52] font-semibold mb-2">
              Fecha de la cita
            </Text>

            <TouchableOpacity
              onPress={() => setMostrarCalendario(true)}
              className="border border-gray-200 rounded-xl px-4 py-4 bg-white"
            >
              <Text className="text-[#263b52]">
                {datos.fecha || 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>

            {mostrarCalendario && (
              <DateTimePicker
                value={convertirFecha(datos.fecha || fechaMinima)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={convertirFecha(fechaMinima)}
                onChange={(evento, fechaSeleccionada) => {
                  setMostrarCalendario(Platform.OS === 'ios');

                  if (fechaSeleccionada) {
                    const anio = fechaSeleccionada.getFullYear();
                    const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
                    const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');
                    const fechaFormateada = `${anio}-${mes}-${dia}`;

                    cambiar('fecha', fechaFormateada);
                  }
                }}
              />
            )}
          </View>

          {/* HORA */}
          <View className="mb-4">
            <Text className="text-[#263b52] font-semibold mb-2">
              Hora de la cita
            </Text>

            <TouchableOpacity
              onPress={() => setMostrarHoras(!mostrarHoras)}
              className="border border-gray-200 rounded-xl px-4 py-4 bg-white"
            >
              <Text className="text-[#263b52]">
                {datos.hora || 'Seleccionar hora'}　⌄
              </Text>
            </TouchableOpacity>

            
            {mostrarHoras && (
              <View className="mt-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
                {cargandoHoras ? (
                  <Text className="text-gray-500 py-3 text-center">
                    Consultando disponibilidad...
                  </Text>
                ) : (
                  horariosDisponibles.map((hora) => {
                    const horaOriginal =
                      modo === 'editar' &&
                      cita?.fecha === datos.fecha &&
                      cita?.hora === hora;

                    const ahora = new Date();
                    const horaActual =
                      `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

                    const horaPasada =
                      datos.fecha === obtenerFechaLocal() &&
                      hora <= horaActual &&
                      !horaOriginal;

                    const ocupada =
                      (horasOcupadas.includes(hora) && !horaOriginal) ||
                      horaPasada;

                    return (
                      <TouchableOpacity
                        key={hora}
                        disabled={ocupada || cargandoHoras}
                        onPress={() => {
                          cambiar('hora', hora);
                          setMostrarHoras(false);
                        }}
                        className={`px-4 py-3 border-b border-gray-100 ${
                          ocupada
                            ? 'bg-gray-200'
                            : datos.hora === hora
                            ? 'bg-purple-100'
                            : ''
                        }`}
                      >
                        <Text
                          className={`${
                            ocupada
                              ? 'text-gray-400'
                              : datos.hora === hora
                              ? 'text-[#7b3fe4] font-bold'
                              : 'text-[#263b52]'
                          }`}
                        >
                          {hora}{ocupada ? ' · No disponible' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}
            </View>


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
                  !datos.telefono?.trim() ||
                  !datos.fecha ||
                  !datos.hora
                ) {
                  Alert.alert(
                    'Campos obligatorios',
                    'Completa el dueño, la mascota, el teléfono, la fecha y la hora.'
                  );
                  return;
                }

                const ahora = new Date();
                const horaActual =
                  `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

                const conservaHoraOriginal =
                  modo === 'editar' &&
                  cita?.fecha === datos.fecha &&
                  cita?.hora === datos.hora;

                const citaCancelada =
                  ['cancelada', 'cancelado'].includes(
                    String(datos.estado || '').toLowerCase()
                  );

                if (
                  !citaCancelada &&
                  (
                    horasOcupadas.includes(datos.hora || '') ||
                    (
                      datos.fecha === obtenerFechaLocal() &&
                      datos.hora! <= horaActual &&
                      !conservaHoraOriginal
                    )
                  )
                ) {
                  Alert.alert(
                    'Horario no disponible',
                    'Esta hora ya está ocupada o ya pasó. Selecciona otra.'
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
