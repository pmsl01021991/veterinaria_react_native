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
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { addDoc, collection } from 'firebase/firestore';

import { db } from '../services/firebase';
import Header from '../components/Header';

type MascotaFormulario = {
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
  aceptaResponsabilidad: boolean;
};

const formularioInicial: MascotaFormulario = {
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
  aceptaResponsabilidad: false,
};

export default function DarEnAdopcionScreen() {
  const [mascota, setMascota] =
    useState<MascotaFormulario>(formularioInicial);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [usuarioRegistro, setUsuarioRegistro] = useState('');
  const [cargando, setCargando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const verificarSesion = async () => {
        try {
          const guardado = await AsyncStorage.getItem('user');
          const usuario = guardado ? JSON.parse(guardado) : null;

          if (!usuario) {
            router.replace('/login');
            return;
          }

          if (activo) {
            setUsuarioRegistro(
              usuario.username || usuario.email || '',
            );
          }
        } catch (error) {
          console.error('Error verificando sesión:', error);
          if (activo) {
            Alert.alert('Error', 'No se pudo verificar tu sesión.');
          }
        }
      };

      verificarSesion();

      return () => {
        activo = false;
      };
    }, []),
  );

  const cambiarCampo = (
    campo: keyof MascotaFormulario,
    valor: string | boolean,
  ) => {
    setMascota((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const seleccionarImagen = async () => {
    try {
      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          'Permiso necesario',
          'Permite el acceso a tus fotos para seleccionar una imagen.',
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (resultado.canceled || !resultado.assets[0]) return;

      const imagen = resultado.assets[0];

      const comprimida = await ImageManipulator.manipulateAsync(
        imagen.uri,
        [{ resize: { width: 1000 } }],
        {
          compress: 0.75,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );

      if (!comprimida.base64) {
        Alert.alert('Error', 'No se pudo procesar la imagen.');
        return;
      }

      setImagenPreview(comprimida.uri);
      setImagenBase64(
        `data:image/jpeg;base64,${comprimida.base64}`,
      );
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const publicarAdopcion = async () => {
    const camposFaltantes: string[] = [];

    if (!mascota.nombre.trim()) camposFaltantes.push('Nombre de la mascota');
    if (!mascota.tipo.trim()) camposFaltantes.push('Tipo de mascota');
    if (!mascota.raza.trim()) camposFaltantes.push('Raza');
    if (!mascota.edad.trim()) camposFaltantes.push('Edad');
    if (!mascota.sexo.trim()) camposFaltantes.push('Sexo');
    if (!mascota.salud.trim()) camposFaltantes.push('Estado de salud');
    if (!mascota.descripcion.trim()) camposFaltantes.push('Descripción');
    if (!mascota.motivo.trim()) camposFaltantes.push('Motivo de adopción');
    if (!mascota.telefono.trim()) camposFaltantes.push('Número de teléfono');
    if (!mascota.correo.trim()) camposFaltantes.push('Correo electrónico');
    if (!imagenBase64) camposFaltantes.push('Imagen de la mascota');

    if (camposFaltantes.length > 0) {
      Alert.alert(
        'Completa todos los campos',
        'Antes de publicar debes completar:\n\n' +
          camposFaltantes.map((campo) => `• ${campo}`).join('\n'),
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mascota.correo.trim())) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return;
    }

    if (!mascota.aceptaResponsabilidad) {
      Alert.alert(
        'Confirmación requerida',
        'Debes confirmar que entiendes tu responsabilidad antes de publicar.',
      );
      return;
    }

    if (!usuarioRegistro) {
      Alert.alert(
        'Sesión no válida',
        'Vuelve a iniciar sesión para registrar la solicitud.',
      );
      router.replace('/login');
      return;
    }

    try {
      setCargando(true);

      await addDoc(collection(db, 'adopciones'), {
        nombre: mascota.nombre.trim(),
        tipo: mascota.tipo,
        raza: mascota.raza.trim(),
        edad: mascota.edad.trim(),
        sexo: mascota.sexo,
        salud: mascota.salud,
        descripcion: mascota.descripcion.trim(),
        motivo: mascota.motivo.trim(),
        telefono: mascota.telefono.trim(),
        correo: mascota.correo.trim(),
        usuarioRegistro,
        imagenBase64,
        aceptaResponsabilidad: mascota.aceptaResponsabilidad,
        estado: 'Pendiente',
        fechaRegistro: new Date(),
      });

      Alert.alert(
        '¡Solicitud recibida!',
        'La información de tu mascota se registró correctamente.\n\nEstado actual: Pendiente de revisión.',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              setMascota(formularioInicial);
              setImagenPreview(null);
              setImagenBase64(null);
              router.replace('/adopcion');
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error guardando adopción en Firestore:', error);
      Alert.alert(
        'Error',
        'No se pudo registrar la mascota. Intenta nuevamente.',
      );
    } finally {
      setCargando(false);
    }
  };

  const cancelar = () => {
    router.replace('/adopcion');
  };

  const campoTexto = (
    etiqueta: string,
    campo: keyof MascotaFormulario,
    placeholder: string,
    multilinea = false,
    tipoTeclado: 'default' | 'email-address' | 'phone-pad' = 'default',
  ) => (
    <View className="mb-4" key={campo}>
      <Text className="mb-2 font-semibold text-slate-700">
        {etiqueta}
      </Text>

      <TextInput
        value={String(mascota[campo])}
        onChangeText={(valor) => cambiarCampo(campo, valor)}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline={multilinea}
        textAlignVertical={multilinea ? 'top' : 'center'}
        keyboardType={tipoTeclado}
        autoCapitalize={campo === 'correo' ? 'none' : 'sentences'}
        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700"
        style={multilinea ? { minHeight: 100 } : undefined}
      />
    </View>
  );

  const campoSeleccion = (
    etiqueta: string,
    campo: 'tipo' | 'sexo' | 'salud',
    opciones: { etiqueta: string; valor: string }[],
  ) => (
    <View className="mb-4" key={campo}>
      <Text className="mb-2 font-semibold text-slate-700">
        {etiqueta}
      </Text>

      {opciones.map((opcion) => (
        <TouchableOpacity
          key={opcion.valor}
          onPress={() => cambiarCampo(campo, opcion.valor)}
          className={`mb-2 rounded-xl border px-4 py-3 ${
            mascota[campo] === opcion.valor
              ? 'border-[#377fb2] bg-blue-50'
              : 'border-slate-300 bg-white'
          }`}
        >
          <Text
            className={
              mascota[campo] === opcion.valor
                ? 'font-bold text-[#377fb2]'
                : 'text-slate-700'
            }
          >
            {mascota[campo] === opcion.valor ? '● ' : '○ '}
            {opcion.etiqueta}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-[#f5f8fb]">
      <Header />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        {/* ENCABEZADO */}
        <View className="bg-[#377fb2] px-6 py-10">
          <Text className="text-center text-4xl">❤️</Text>

          <Text className="mt-3 text-center text-3xl font-extrabold text-white">
            Dar en adopción
          </Text>

          <Text className="mt-3 text-center leading-6 text-blue-50">
            Ayúdanos a encontrar un hogar responsable y lleno de amor
            para tu mascota.
          </Text>
        </View>

        <View className="p-4">
          <View className="rounded-2xl bg-white p-5" style={{ elevation: 2 }}>
            <Text className="text-center text-xl font-extrabold text-[#263b52]">
              🐾 Información de la mascota
            </Text>

            <Text className="mb-6 mt-2 text-center leading-6 text-slate-500">
              Completa los datos para que las personas puedan conocer
              mejor a la mascota que necesita un nuevo hogar.
            </Text>

            {/* FOTO */}
            <View className="mb-6 rounded-2xl bg-slate-50 p-4">
              {imagenPreview ? (
                <Image
                  source={{ uri: imagenPreview }}
                  className="mb-4 h-56 w-full rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="mb-4 h-48 items-center justify-center rounded-xl bg-slate-200">
                  <Text className="text-5xl">📷</Text>
                  <Text className="mt-2 text-slate-500">
                    Foto de la mascota
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={seleccionarImagen}
                className="items-center rounded-xl bg-[#377fb2] px-4 py-4"
              >
                <Text className="font-bold text-white">
                  📷 Seleccionar foto
                </Text>
              </TouchableOpacity>

              <Text className="mt-3 text-center text-sm leading-5 text-slate-500">
                Agrega una foto clara. Se comprimirá antes de guardarse.
              </Text>
            </View>

            {/* DATOS BÁSICOS */}
            {campoTexto('Nombre de la mascota *', 'nombre', 'Ej. Firulais')}

            {campoSeleccion('Tipo de animal *', 'tipo', [
              { etiqueta: '🐶 Perro', valor: 'perro' },
              { etiqueta: '🐱 Gato', valor: 'gato' },
              { etiqueta: '🐦 Ave', valor: 'ave' },
              { etiqueta: '🐾 Otro', valor: 'otro' },
            ])}

            {campoTexto('Raza *', 'raza', 'Ej. Labrador')}
            {campoTexto('Edad *', 'edad', 'Ej. 2 años')}

            {campoSeleccion('Sexo *', 'sexo', [
              { etiqueta: '♂️ Macho', valor: 'macho' },
              { etiqueta: '♀️ Hembra', valor: 'hembra' },
            ])}

            {campoSeleccion('Estado de salud *', 'salud', [
              { etiqueta: '🟢 Saludable', valor: 'saludable' },
              { etiqueta: '🟡 En tratamiento', valor: 'tratamiento' },
              {
                etiqueta: '🔵 Necesita cuidados especiales',
                valor: 'especial',
              },
            ])}

            {campoTexto(
              'Cuéntanos sobre la mascota *',
              'descripcion',
              'Personalidad, comportamiento y actividades favoritas...',
              true,
            )}

            {campoTexto(
              '¿Por qué se da en adopción? *',
              'motivo',
              'Explica brevemente el motivo...',
              true,
            )}

            {/* CONTACTO */}
            <View className="mb-5 rounded-2xl bg-slate-50 p-4">
              <Text className="mb-2 text-lg font-bold text-[#263b52]">
                📞 Información de contacto
              </Text>

              <Text className="mb-5 leading-5 text-slate-500">
                Este número será utilizado para contactar al responsable
                de la mascota.
              </Text>

              {campoTexto(
                'Número de teléfono *',
                'telefono',
                'Ej. 987654321',
                false,
                'phone-pad',
              )}

              {campoTexto(
                'Correo electrónico *',
                'correo',
                'Ej. ejemplo@gmail.com',
                false,
                'email-address',
              )}
            </View>

            {/* RESPONSABILIDAD */}
            <TouchableOpacity
              onPress={() =>
                cambiarCampo(
                  'aceptaResponsabilidad',
                  !mascota.aceptaResponsabilidad,
                )
              }
              className="mb-6 flex-row items-start rounded-xl border border-blue-200 bg-blue-50 p-4"
            >
              <Text className="mr-3 text-xl text-[#377fb2]">
                {mascota.aceptaResponsabilidad ? '☑' : '☐'}
              </Text>

              <View className="flex-1">
                <Text className="font-bold text-slate-800">
                  Confirmo que entiendo mi responsabilidad
                </Text>

                <Text className="mt-2 leading-5 text-slate-600">
                  Al publicar esta mascota me comprometo a proporcionar
                  información verdadera y a participar responsablemente
                  en el proceso de adopción.
                </Text>
              </View>
            </TouchableOpacity>

            {/* BOTONES */}
            <TouchableOpacity
              onPress={cancelar}
              disabled={cargando}
              className="mb-3 items-center rounded-xl bg-slate-200 px-5 py-4"
            >
              <Text className="font-bold text-slate-700">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={publicarAdopcion}
              disabled={cargando || !mascota.aceptaResponsabilidad}
              className={`items-center rounded-xl px-5 py-4 ${
                cargando || !mascota.aceptaResponsabilidad
                  ? 'bg-green-300'
                  : 'bg-green-500'
              }`}
            >
              {cargando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="font-bold text-white">
                  ❤️ Publicar para adopción
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
