import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl,} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, updateDoc, deleteDoc, doc,} from 'firebase/firestore';
import { db } from '@/services/firebase';
import Header from '../components/Header';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Cita {
  id: string;
  fecha?: string;
  hora?: string;
  nombre?: string;
  duenio?: string;
  servicio?: string;
  estado?: string;
}

const estados = ['Todos', 'Pendiente', 'Confirmada', 'Completada', 'Cancelada'];

export default function Historial() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [filtro, setFiltro] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const iniciar = async () => {
        try {
          const usuarioGuardado = await AsyncStorage.getItem('user');

          if (!usuarioGuardado) {
            router.replace('/login' as any);
            return;
          }

          const usuario = JSON.parse(usuarioGuardado);

          if (usuario.rol !== 'admin') {
            Alert.alert('Acceso denegado', 'No tienes permisos para acceder al historial.');
            router.replace('/' as any);
            return;
          }

          await cargarCitas(activo);
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          if (activo) {
            setCargando(false);
            Alert.alert('Error', 'No se pudo cargar el historial.');
          }
        }
      };

      iniciar();

      return () => {
        activo = false;
      };
    }, [])
  );

  const cargarCitas = async (activo = true, refrescar = false) => {
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
        estado: documento.data().estado || 'Pendiente',
      })) as Cita[];

      if (activo) {
        lista.sort((a, b) =>
          (a.fecha || '').localeCompare(b.fecha || '')
        );
        setCitas(lista);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas.');
    } finally {
      if (activo) {
        setCargando(false);
        setActualizando(false);
      }
    }
  };

  const citasFiltradas = citas.filter((cita) => {
    const texto = filtro.trim().toLowerCase();

    const coincideTexto =
      (cita.nombre || '').toLowerCase().includes(texto) ||
      (cita.duenio || '').toLowerCase().includes(texto) ||
      (cita.servicio || '').toLowerCase().includes(texto);

    const coincideEstado =
      filtroEstado === 'Todos' || cita.estado === filtroEstado;

    const coincideFecha =
      !fechaFiltro.trim() || (cita.fecha || '').startsWith(fechaFiltro.trim());

    return coincideTexto && coincideEstado && coincideFecha;
  });

  const actualizarEstado = (cita: Cita, nuevoEstado: string) => {
    Alert.alert(
      'Confirmar acción',
      `¿Deseas cambiar el estado de esta cita a "${nuevoEstado}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'mascotas', cita.id), {
                estado: nuevoEstado,
              });

              setCitas((actuales) =>
                actuales.map((item) =>
                  item.id === cita.id
                    ? { ...item, estado: nuevoEstado }
                    : item
                )
              );

              Alert.alert('Éxito', `Estado actualizado a ${nuevoEstado}.`);
            } catch (error) {
              console.error('Error al actualizar estado:', error);
              Alert.alert('Error', 'No se pudo actualizar el estado.');
            }
          },
        },
      ]
    );
  };

  const eliminarCita = (cita: Cita) => {
    Alert.alert(
      'Eliminar cita',
      `¿Seguro que deseas eliminar la cita de ${cita.nombre || 'esta mascota'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'mascotas', cita.id));

              setCitas((actuales) =>
                actuales.filter((item) => item.id !== cita.id)
              );

              Alert.alert('Éxito', 'La cita se eliminó correctamente.');
            } catch (error) {
              console.error('Error al eliminar cita:', error);
              Alert.alert('Error', 'No se pudo eliminar la cita.');
            }
          },
        },
      ]
    );
  };

  const obtenerColorEstado = (estado?: string) => {
    switch (estado) {
      case 'Pendiente':
        return { fondo: '#fef3c7', texto: '#92400e' };
      case 'Confirmada':
        return { fondo: '#cffafe', texto: '#155e75' };
      case 'Completada':
        return { fondo: '#dcfce7', texto: '#166534' };
      case 'Cancelada':
        return { fondo: '#fee2e2', texto: '#991b1b' };
      default:
        return { fondo: '#e5e7eb', texto: '#374151' };
    }
  };

  const verDetalle = (id: string) => {
    router.push({
        pathname: '/expediente',
        params: { id },
    });
    };

  const convertirFechaLocal = (fecha: string) => {
    if (!fecha) return new Date();

    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
    };

  return (
    <View className="flex-1 bg-[#f5f7fb]">
      <View className="flex-row items-center bg-[#7b3fe4] px-4 pt-10 pb-4">
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-white">
            📋 Historial de Citas
          </Text>
        </View>
        <Header soloMenu compacto />
      </View>

      <View className="px-5 pt-5 pb-2">
        <Text className="mb-3 text-lg font-bold text-[#263b52]">
          Gestión de citas
        </Text>

        <TextInput
          value={filtro}
          onChangeText={setFiltro}
          placeholder="Buscar mascota, cliente o motivo..."
          placeholderTextColor="#9ca3af"
          className="mb-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#263b52]"
        />

        
        <View className="mb-3">
        <TouchableOpacity
            onPress={() => setMostrarCalendario(true)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-4"
        >
            <Text className="text-[#263b52]">
            {fechaFiltro
                ? `📅 Fecha: ${fechaFiltro}`
                : '📅 Filtrar por fecha'}
            </Text>
        </TouchableOpacity>

        {fechaFiltro !== '' && (
            <TouchableOpacity
            onPress={() => setFechaFiltro('')}
            className="mt-2 self-start"
            >
            <Text className="font-semibold text-[#7b3fe4]">
                Quitar filtro de fecha
            </Text>
            </TouchableOpacity>
        )}

        {mostrarCalendario && (
            <DateTimePicker
            value={convertirFechaLocal(fechaFiltro)}
            mode="date"
            display="default"
            onChange={(evento, fechaSeleccionada) => {
                setMostrarCalendario(false);

                if (evento.type === 'set' && fechaSeleccionada) {
                const anio = fechaSeleccionada.getFullYear();
                const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
                const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');

                setFechaFiltro(`${anio}-${mes}-${dia}`);
                }
            }}
            />
        )}
        </View>


        <Text className="mb-2 font-semibold text-[#263b52]">
          Estado
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="mb-3 flex-row gap-2">
            {estados.map((estado) => (
              <TouchableOpacity
                key={estado}
                onPress={() => setFiltroEstado(estado)}
                className={`rounded-full border px-4 py-2 ${
                  filtroEstado === estado
                    ? 'border-[#7b3fe4] bg-[#7b3fe4]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    filtroEstado === estado ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {estado}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">
            {citasFiltradas.length} citas encontradas
          </Text>

          <TouchableOpacity onPress={() => cargarCitas(true, true)}>
            <Text className="font-bold text-[#7b3fe4]">↻ Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {cargando ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7b3fe4" />
          <Text className="mt-3 text-gray-500">Cargando citas...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 35 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={() => cargarCitas(true, true)}
              colors={['#7b3fe4']}
            />
          }
        >
          {citasFiltradas.length === 0 ? (
            <View className="items-center py-12">
              <Text className="mb-4 text-5xl">📋</Text>
              <Text className="text-center text-lg font-bold text-[#263b52]">
                No hay citas registradas
              </Text>
              <Text className="mt-2 text-center text-gray-500">
                Prueba cambiando los filtros.
              </Text>
            </View>
          ) : (
            citasFiltradas.map((cita) => {
              const colorEstado = obtenerColorEstado(cita.estado);

              return (
                <View
                  key={cita.id}
                  className="mb-4 rounded-2xl border border-gray-100 bg-white p-4"
                  style={{ elevation: 2 }}
                >
                  <View className="mb-3 flex-row items-start justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-xs text-gray-400">
                        ID: {cita.id}
                      </Text>
                      <Text className="mt-1 text-lg font-bold text-[#263b52]">
                        {cita.nombre || 'Sin nombre'}
                      </Text>
                      <Text className="mt-1 text-sm text-gray-500">
                        Cliente: {cita.duenio || 'Sin registrar'}
                      </Text>
                    </View>

                    <View
                      className="rounded-full px-3 py-2"
                      style={{ backgroundColor: colorEstado.fondo }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: colorEstado.texto }}
                      >
                        {cita.estado || 'Pendiente'}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-4 border-t border-gray-100 pt-3">
                    <Text className="mb-2 text-gray-600">
                      📅 Fecha: {cita.fecha || 'Sin fecha'}
                    </Text>
                    <Text className="mb-2 text-gray-600">
                      🕐 Hora: {cita.hora || 'Sin hora'}
                    </Text>
                    <Text className="text-gray-600">
                      🩺 Motivo: {cita.servicio || 'Sin motivo'}
                    </Text>
                  </View>

                  <View className="mb-2 flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => actualizarEstado(cita, 'Confirmada')}
                      className="flex-1 items-center rounded-xl bg-amber-400 px-2 py-3"
                    >
                      <Text className="text-center text-xs font-bold text-gray-900">
                        Confirmar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => actualizarEstado(cita, 'Completada')}
                      className="flex-1 items-center rounded-xl bg-green-600 px-2 py-3"
                    >
                      <Text className="text-center text-xs font-bold text-white">
                        Completar
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => eliminarCita(cita)}
                      className="flex-1 items-center rounded-xl bg-red-500 px-2 py-3"
                    >
                      <Text className="text-center text-xs font-bold text-white">
                        Eliminar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => verDetalle(cita.id)}
                      className="flex-1 items-center rounded-xl bg-[#377fb2] px-2 py-3"
                    >
                      <Text className="text-center text-xs font-bold text-white">
                        👁️ Ver expediente
                      </Text>
                    </TouchableOpacity>
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
