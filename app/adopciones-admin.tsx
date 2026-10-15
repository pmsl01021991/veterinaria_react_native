
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';

import { db } from '../services/firebase';
import Header from '../components/Header';

type Adopcion = {
  id: string;
  nombre?: string;
  tipo?: string;
  raza?: string;
  edad?: string | number;
  sexo?: string;
  salud?: string;
  descripcion?: string;
  motivo?: string;
  telefono?: string;
  correo?: string;
  imagenBase64?: string;
  estado?: string;
  fechaRegistro?: any;
};

type CamposEditables = {
  nombre: string;
  tipo: string;
  raza: string;
  edad: string;
  sexo: string;
  salud: string;
  descripcion: string;
  motivo: string;
  telefono: string;
  correo: string;
};

const camposVacios: CamposEditables = {
  nombre: '',
  tipo: '',
  raza: '',
  edad: '',
  sexo: '',
  salud: '',
  descripcion: '',
  motivo: '',
  telefono: '',
  correo: '',
};

export default function AdopcionesAdminScreen() {
  const [adopciones, setAdopciones] = useState<Adopcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mascotaEditada, setMascotaEditada] =
    useState<CamposEditables>(camposVacios);
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      let cancelarEscucha: (() => void) | undefined;

      const iniciar = async () => {
        try {
          const usuarioGuardado = await AsyncStorage.getItem('user');
          const usuario = usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;

          if (!usuario || usuario.rol !== 'admin') {
            router.replace(
              usuario ? '/' : '/login'
            );
            return;
          }

          cancelarEscucha = onSnapshot(
            collection(db, 'adopciones'),
            (snapshot) => {
              if (!activo) return;

              setAdopciones(
                snapshot.docs.map((documento) => ({
                  id: documento.id,
                  ...documento.data(),
                })) as Adopcion[],
              );

              setCargando(false);
            },
            (error) => {
              console.error('Error cargando adopciones:', error);

              if (activo) {
                setCargando(false);
                Alert.alert(
                  'Error',
                  'No se pudieron cargar las mascotas para adopción.',
                );
              }
            },
          );
        } catch (error) {
          console.error('Error verificando administrador:', error);

          if (activo) {
            setCargando(false);
            Alert.alert('Error', 'No se pudo verificar la sesión.');
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

  const volver = () => {
    router.replace('/admin' as any);
  };

  const editarMascota = (mascota: Adopcion) => {
    setEditandoId(mascota.id);

    setMascotaEditada({
      nombre: String(mascota.nombre ?? ''),
      tipo: String(mascota.tipo ?? ''),
      raza: String(mascota.raza ?? ''),
      edad: String(mascota.edad ?? ''),
      sexo: String(mascota.sexo ?? ''),
      salud: String(mascota.salud ?? ''),
      descripcion: String(mascota.descripcion ?? ''),
      motivo: String(mascota.motivo ?? ''),
      telefono: String(mascota.telefono ?? ''),
      correo: String(mascota.correo ?? ''),
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setMascotaEditada(camposVacios);
  };

  const cambiarCampo = (
    campo: keyof CamposEditables,
    valor: string,
  ) => {
    setMascotaEditada((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const guardarEdicion = async (mascota: Adopcion) => {
    try {
      setGuardando(true);

      await updateDoc(doc(db, 'adopciones', mascota.id), {
        ...mascotaEditada,
      });

      setEditandoId(null);
      setMascotaEditada(camposVacios);

      Alert.alert(
        'Cambios guardados',
        'Los datos de la mascota fueron actualizados.',
      );
    } catch (error) {
      console.error('Error actualizando adopción:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = (
    mascota: Adopcion,
    estado: 'Aceptada' | 'Rechazada',
  ) => {
    const accion = estado === 'Aceptada' ? 'aceptar' : 'rechazar';

    Alert.alert(
      estado === 'Aceptada' ? 'Aceptar adopción' : 'Rechazar solicitud',
      `¿Deseas ${accion} la solicitud de ${mascota.nombre || 'esta mascota'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: estado === 'Aceptada' ? 'Aceptar' : 'Rechazar',
          style: estado === 'Rechazada' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'adopciones', mascota.id), {
                estado,
              });

              Alert.alert(
                'Operación completada',
                estado === 'Aceptada'
                  ? `${mascota.nombre || 'La mascota'} fue aceptada y aparecerá en mascotas disponibles.`
                  : `La solicitud de ${mascota.nombre || 'la mascota'} fue rechazada.`,
              );
            } catch (error) {
              console.error('Error cambiando estado:', error);
              Alert.alert(
                'Error',
                estado === 'Aceptada'
                  ? 'No se pudo aceptar la mascota.'
                  : 'No se pudo rechazar la mascota.',
              );
            }
          },
        },
      ],
    );
  };

  const fechaTexto = (fecha: any) => {
    if (!fecha) return 'Fecha no disponible';

    try {
      const date = typeof fecha.toDate === 'function'
        ? fecha.toDate()
        : new Date(fecha);

      if (Number.isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }

      return date.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const campoTexto = (
    etiqueta: string,
    campo: keyof CamposEditables,
    multilinea = false,
  ) => (
    <View className="mb-3" key={campo}>
      <Text className="mb-1 font-semibold text-slate-700">
        {etiqueta}
      </Text>

      <TextInput
        value={mascotaEditada[campo]}
        onChangeText={(valor) => cambiarCampo(campo, valor)}
        multiline={multilinea}
        textAlignVertical={multilinea ? 'top' : 'center'}
        keyboardType={
          campo === 'correo'
            ? 'email-address'
            : campo === 'telefono'
              ? 'phone-pad'
              : 'default'
        }
        autoCapitalize={campo === 'correo' ? 'none' : 'sentences'}
        className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-800"
        style={multilinea ? { minHeight: 85 } : undefined}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-[#f5f8fb]">
      <Header />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ENCABEZADO */}
        <View className="mb-6">
          <Text className="text-2xl font-extrabold text-[#263b52]">
            🐾 Mascotas para adopción
          </Text>

          <Text className="mt-2 leading-6 text-slate-500">
            Revisa las mascotas registradas por los usuarios antes
            de aprobarlas para su publicación.
          </Text>

          <TouchableOpacity
            onPress={volver}
            className="mt-4 self-start rounded-xl bg-[#377fb2] px-5 py-3"
          >
            <Text className="font-bold text-white">← Volver</Text>
          </TouchableOpacity>
        </View>

        {/* CARGANDO */}
        {cargando && (
          <View className="items-center rounded-2xl bg-white p-10">
            <ActivityIndicator size="large" color="#377fb2" />
            <Text className="mt-4 text-slate-600">
              Cargando solicitudes de adopción...
            </Text>
          </View>
        )}

        {/* SIN SOLICITUDES */}
        {!cargando && adopciones.length === 0 && (
          <View className="items-center rounded-2xl bg-white p-8">
            <Text className="text-4xl">🐾</Text>
            <Text className="mt-3 text-lg font-bold text-[#263b52]">
              No hay solicitudes
            </Text>
            <Text className="mt-2 text-center leading-6 text-slate-500">
              Actualmente no hay mascotas registradas para revisión.
            </Text>
          </View>
        )}

        {/* TARJETAS */}
        {!cargando &&
          adopciones.map((mascota) => {
            const editando = editandoId === mascota.id;

            const colorEstado =
              mascota.estado === 'Aceptada'
                ? 'bg-green-100 text-green-800'
                : mascota.estado === 'Rechazada'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800';

            return (
              <View
                key={mascota.id}
                className="mb-6 overflow-hidden rounded-2xl bg-white"
                style={{
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                {/* IMAGEN */}
                {mascota.imagenBase64 ? (
                  <Image
                    source={{ uri: mascota.imagenBase64 }}
                    className="h-64 w-full bg-slate-100"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-52 items-center justify-center bg-slate-100">
                    <Text className="text-5xl">📷</Text>
                    <Text className="mt-2 text-slate-500">
                      Sin imagen
                    </Text>
                  </View>
                )}

                <View className="p-4">
                  {/* NOMBRE Y ESTADO */}
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="mr-2 flex-1 text-xl font-extrabold text-[#263b52]">
                      {editando
                        ? mascotaEditada.nombre
                        : mascota.nombre || 'Sin nombre'}
                    </Text>

                    <View className={`rounded-full px-3 py-2 ${colorEstado}`}>
                      <Text className="text-xs font-bold">
                        {mascota.estado || 'Pendiente'}
                      </Text>
                    </View>
                  </View>

                  {/* DATOS */}
                  {editando ? (
                    <>
                      {campoTexto('Nombre', 'nombre')}
                      {campoTexto('Tipo', 'tipo')}
                      {campoTexto('Raza', 'raza')}
                      {campoTexto('Edad', 'edad')}
                      {campoTexto('Sexo', 'sexo')}
                      {campoTexto('Estado de salud', 'salud')}
                    </>
                  ) : (
                    <View className="gap-2">
                      <Text className="text-slate-600">
                        🐾 Tipo: {mascota.tipo || 'No especificado'}
                      </Text>
                      <Text className="text-slate-600">
                        🧬 Raza: {mascota.raza || 'No especificada'}
                      </Text>
                      <Text className="text-slate-600">
                        🎂 Edad: {mascota.edad ?? 'No especificada'}
                      </Text>
                      <Text className="text-slate-600">
                        ⚥ Sexo: {mascota.sexo || 'No especificado'}
                      </Text>
                      <Text className="text-slate-600">
                        ❤️ Estado de salud: {mascota.salud || 'No especificado'}
                      </Text>
                    </View>
                  )}

                  {/* DESCRIPCIÓN */}
                  <View className="mt-4 border-t border-slate-200 pt-3">
                    <Text className="mb-2 font-bold text-slate-700">
                      Descripción
                    </Text>

                    {editando ? (
                      campoTexto('Descripción', 'descripcion', true)
                    ) : (
                      <Text className="leading-5 text-slate-600">
                        {mascota.descripcion || 'Sin descripción'}
                      </Text>
                    )}
                  </View>

                  {/* MOTIVO */}
                  <View className="mt-3 border-t border-slate-200 pt-3">
                    <Text className="mb-2 font-bold text-slate-700">
                      Motivo de la adopción
                    </Text>

                    {editando ? (
                      campoTexto('Motivo', 'motivo', true)
                    ) : (
                      <Text className="leading-5 text-slate-600">
                        {mascota.motivo || 'No especificado'}
                      </Text>
                    )}
                  </View>

                  {/* CONTACTO */}
                  <View className="mt-3 border-t border-slate-200 pt-3">
                    <Text className="mb-2 font-bold text-slate-700">
                      Datos del propietario
                    </Text>

                    {editando ? (
                      <>
                        {campoTexto('Teléfono', 'telefono')}
                        {campoTexto('Correo', 'correo')}
                      </>
                    ) : (
                      <>
                        <Text className="mb-2 text-slate-600">
                          📱 {mascota.telefono || 'No disponible'}
                        </Text>
                        <Text className="text-slate-600">
                          ✉️ {mascota.correo || 'No disponible'}
                        </Text>
                      </>
                    )}
                  </View>

                  {/* FECHA */}
                  <View className="mt-4 border-t border-slate-200 pt-3">
                    <Text className="text-xs text-slate-500">
                      Solicitud registrada: {fechaTexto(mascota.fechaRegistro)}
                    </Text>
                  </View>
                </View>

                {/* ACCIONES */}
                <View className="flex-row flex-wrap gap-2 px-4 pb-4">
                  {editando ? (
                    <>
                      <TouchableOpacity
                        disabled={guardando}
                        onPress={() => guardarEdicion(mascota)}
                        className="rounded-lg bg-blue-600 px-4 py-3"
                      >
                        <Text className="font-bold text-white">
                          {guardando ? 'Guardando...' : '💾 Guardar'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        disabled={guardando}
                        onPress={cancelarEdicion}
                        className="rounded-lg bg-slate-500 px-4 py-3"
                      >
                        <Text className="font-bold text-white">
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => editarMascota(mascota)}
                        className="rounded-lg bg-sky-100 px-3 py-3"
                      >
                        <Text className="font-bold text-sky-800">
                          ✏️ Editar
                        </Text>
                      </TouchableOpacity>

                      {mascota.estado === 'Pendiente' && (
                        <>
                          <TouchableOpacity
                            onPress={() => cambiarEstado(mascota, 'Aceptada')}
                            className="rounded-lg bg-green-500 px-3 py-3"
                          >
                            <Text className="font-bold text-white">
                              ✅ Aceptar
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => cambiarEstado(mascota, 'Rechazada')}
                            className="rounded-lg bg-red-500 px-3 py-3"
                          >
                            <Text className="font-bold text-white">
                              ❌ Rechazar
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </>
                  )}
                </View>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}
