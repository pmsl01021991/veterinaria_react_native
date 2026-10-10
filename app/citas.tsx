import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput,} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc, addDoc,} from 'firebase/firestore';
import { db } from '@/services/firebase';
import CitaCard, { type Cita } from '@/components/citas/CitaCard';
import CitaFormulario from '@/components/citas/CitaFormulario';

export default function Citas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modoFormulario, setModoFormulario] = useState<'crear' | 'editar'>('editar');

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

      await cargarCitas();
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      router.replace('/' as any);
    }
  };

  const cargarCitas = async () => {
    try {
      setCargando(true);

      const consulta = query(
        collection(db, 'mascotas'),
        orderBy('fecha', 'asc')
      );

      const snapshot = await getDocs(consulta);

      const datos = snapshot.docs.map((documento) => ({
        ...documento.data(),
        id: documento.id,
      })) as Cita[];

      setCitas(datos);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas.');
    } finally {
      setCargando(false);
    }
  };

  const guardarEdicion = async (datos: Partial<Cita>) => {
    if (!datos.duenio?.trim() || !datos.nombre?.trim() || !datos.telefono?.trim()) {
      Alert.alert(
        'Datos incompletos',
        'Completa el nombre del dueño, la mascota y el teléfono.'
      );
      return;
    }

    try {
      setGuardando(true);

      const datosActualizados = {
        duenio: datos.duenio.trim(),
        nombre: datos.nombre.trim(),
        telefono: datos.telefono.trim(),
        tipo: datos.tipo || 'perro',
        raza: datos.raza || '',
        edad: datos.edad ?? '',
        servicio: datos.servicio || 'consulta general',
        fecha: datos.fecha || '',
        hora: datos.hora || '',
        notas: datos.notas || '',
        notasAdicionales: datos.notasAdicionales || '',
        estado: datos.estado || 'Pendiente',
      };

      if (modoFormulario === 'crear') {
        await addDoc(collection(db, 'mascotas'), {
          ...datosActualizados,
          icono:
            datosActualizados.tipo === 'gato'
              ? 'assets/huellitas/Imagenes/gato.webp'
              : datosActualizados.tipo === 'ave'
              ? 'assets/huellitas/Imagenes/loro.jpg'
              : datosActualizados.tipo === 'pez'
              ? 'assets/huellitas/Imagenes/pez.jpg'
              : 'assets/huellitas/Imagenes/perro.png',
        });

        Alert.alert('Éxito', 'La cita se registró correctamente.');
      } else {
        if (!citaEditando?.id) return;

        await updateDoc(
          doc(db, 'mascotas', citaEditando.id),
          datosActualizados
        );

        Alert.alert('Éxito', 'La cita se actualizó correctamente.');
      }

      setCitaEditando(null);
      await cargarCitas();
    } catch (error) {
      console.error('Error al guardar cita:', error);
      Alert.alert('Error', 'No se pudo guardar la cita.');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (cita: Cita) => {
    Alert.alert(
      'Eliminar cita',
      `¿Deseas eliminar la cita de ${cita.nombre || 'esta mascota'}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarCita(cita),
        },
      ]
    );
  };

  const eliminarCita = async (cita: Cita) => {
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
  };

  const abrirNuevaCita = () => {
    setModoFormulario('crear');

    setCitaEditando({
      id: '',
      duenio: '',
      nombre: '',
      telefono: '',
      tipo: 'perro',
      raza: '',
      edad: '',
      servicio: 'consulta general',
      fecha: '',
      hora: '',
      notas: '',
      notasAdicionales: '',
      estado: 'Pendiente',
    });
  };

  return (
    <View className="flex-1 bg-[#f5f7fb]">
      <View className="bg-[#7b3fe4] px-5 pt-12 pb-5">
        <Text className="text-white text-2xl font-bold text-center">
          📅 Citas de Mascotas
        </Text>
      </View>

      {cargando ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7b3fe4" />
          <Text className="text-gray-500 mt-3">
            Cargando citas...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 35 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-5">
            <Text className="text-[#263b52] text-lg font-bold">
              Citas registradas
            </Text>

            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar por dueño o mascota..."
              placeholderTextColor="#9ca3af"
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 mt-4 text-base text-[#263b52]"
            />

            <TouchableOpacity
              onPress={abrirNuevaCita}
              className="bg-green-600 rounded-xl py-4 mt-4 items-center"
            >
              <Text className="text-white font-bold text-base">
                ➕ Agregar cita
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-gray-500">
                Total: {
                  citas.filter((cita) => {
                    const termino = busqueda.trim().toLowerCase();

                    return (
                      (cita.duenio || '').toLowerCase().includes(termino) ||
                      (cita.nombre || '').toLowerCase().includes(termino)
                    );
                  }).length
                } citas
              </Text>

              <TouchableOpacity onPress={cargarCitas}>
                <Text className="text-[#7b3fe4] font-bold">
                  ↻ Actualizar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {citas.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-5xl mb-4">📅</Text>
              <Text className="text-[#263b52] text-xl font-bold">
                No hay citas registradas
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Las citas de Firebase aparecerán aquí.
              </Text>
            </View>
          ) : (
            citas
            .filter((cita) => {
              const termino = busqueda.trim().toLowerCase();

              return (
                (cita.duenio || '').toLowerCase().includes(termino) ||
                (cita.nombre || '').toLowerCase().includes(termino)
              );
            })
            .map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                onEditar={(cita) => {
                  setModoFormulario('editar');
                  setCitaEditando(cita);
                }}
                onEliminar={confirmarEliminar}
              />
            ))
          )}
        </ScrollView>
      )}

      <CitaFormulario
        visible={citaEditando !== null}
        cita={citaEditando}
        guardando={guardando}
        modo={modoFormulario}
        onCerrar={() => setCitaEditando(null)}
        onGuardar={guardarEdicion}
      />
    </View>
  );
}
