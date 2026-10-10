import { useState } from 'react';
import { Image, Modal, Pressable, Text, TouchableOpacity, View,} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HeaderProps = {
  onNavigate?: (section: string) => void;
  soloMenu?: boolean;
  compacto?: boolean;
};

const logo = require('../assets/huellitas/Imagenes/LOGO2.png');

export default function Header({ onNavigate, soloMenu = false, compacto = false }: HeaderProps) {

  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useFocusEffect(() => {
  let activo = true;

  const cargarUsuario = async () => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem('user');

      if (usuarioGuardado && activo) {
        setUsuario(JSON.parse(usuarioGuardado));
      } else if (activo) {
        setUsuario(null);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  cargarUsuario();

  return () => {
    activo = false;
  };
});

  const navegar = (section: string) => {
    setMenuAbierto(false);

    if (onNavigate) {
      onNavigate(section);
    } else {
      router.push('/' as any);
    }
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('user');

    setUsuario(null);
    setMenuAbierto(false);

    router.replace('/');
  };

  return (
    <>
      {/* HEADER */}
      <View
          className={
            compacto
              ? 'bg-transparent'
              : 'bg-white px-4 pt-10 pb-3 shadow-sm'
          }
        >
        <View
            className={`flex-row items-center justify-end ${
              compacto ? '' : 'px-4'
            }`}
          >
          {!soloMenu && (
              <>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navegar('inicio')}
                  className="shrink-0"
                >
                  <Image
                    source={logo}
                    className="h-14 w-44"
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <View className="flex-1 items-center px-2">
                  {usuario && (
                    <Text
                      numberOfLines={1}
                      className="text-sm font-bold text-[#263b52]"
                    >
                      Bienvenido, {usuario.name || usuario.username?.split('@')[0]}
                    </Text>
                  )}
                </View>
              </>
            )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setMenuAbierto(true)}
            className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#377fb2]"
          >
            <Text className="text-3xl font-bold text-white">☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MENÚ */}
      <Modal
        visible={menuAbierto}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuAbierto(false)}
      >
        <View className="flex-1 flex-row">

          {/* FONDO OSCURO */}
          <Pressable
            className="flex-1 bg-black/40"
            onPress={() => setMenuAbierto(false)}
          />

          {/* PANEL PRINCIPAL */}
          <View className="h-full w-[82%] bg-white px-5 pt-12">

            {/* CABECERA DEL MENÚ */}
            <View className="mb-8 flex-row items-center justify-between">

              <View>
                <Text className="mt-1 text-sm text-gray-500">
                {usuario?.rol === 'admin'
                  ? 'Panel de administrador'
                  : 'Menú principal'}
              </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setMenuAbierto(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Text className="text-xl text-gray-600">
                  ✕
                </Text>
              </TouchableOpacity>

            </View>

            {usuario?.rol === 'admin' ? (
              <>
                {/* MASCOTAS */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                  onPress={() => setMenuAbierto(false)}
                >
                  <Text className="mr-4 text-xl">
                    🐾
                  </Text>

                  <Text className="text-base text-gray-700">
                    Mascotas
                  </Text>
                </TouchableOpacity>

                {/* CITAS */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                  onPress={() => {
                    setMenuAbierto(false);
                    router.push('/citas' as any);
                  }}
                >
                  <Text className="mr-4 text-xl">
                    📅
                  </Text>

                  <Text className="text-base text-gray-700">
                    Citas
                  </Text>
                </TouchableOpacity>

                {/* HISTORIAL */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                  onPress={() => setMenuAbierto(false)}
                >
                  <Text className="mr-4 text-xl">
                    📋
                  </Text>

                  <Text className="text-base text-gray-700">
                    Historial
                  </Text>
                </TouchableOpacity>

                {/* ADOPCIÓN */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                  onPress={() => setMenuAbierto(false)}
                >
                  <Text className="mr-4 text-xl">
                    🐾
                  </Text>

                  <Text className="text-base text-gray-700">
                    Adopción
                  </Text>
                </TouchableOpacity>

                {/* PANEL DE ADMINISTRACIÓN */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                  onPress={() => setMenuAbierto(false)}
                >
                  <Text className="mr-4 text-xl">
                    ⚙️
                  </Text>

                  <Text className="text-base text-gray-700">
                    Panel de Administración
                  </Text>
                </TouchableOpacity>

                {/* SEPARADOR */}
                <View className="my-5 border-t border-gray-200" />

                {/* SALIR */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl bg-red-50 px-4 py-4"
                  onPress={cerrarSesion}
                >
                  <Text className="mr-4 text-xl">
                    🚪
                  </Text>

                  <Text className="text-base font-semibold text-red-600">
                    Salir
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* INICIO */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl bg-[#377fb2] px-4 py-4"
                  onPress={() => navegar('inicio')}
                >
                  <Text className="mr-4 text-xl">
                    🏠
                  </Text>

                  <Text className="text-base font-semibold text-white">
                    Inicio
                  </Text>
                </TouchableOpacity>

                {/* SOBRE NOSOTROS */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                  onPress={() => navegar('sobre-nosotros')}
                >
                  <Text className="mr-4 text-xl">
                    ℹ️
                  </Text>

                  <Text className="text-base text-gray-700">
                    Sobre Nosotros
                  </Text>
                </TouchableOpacity>

                {/* ESPECIALIDADES */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                  onPress={() => navegar('especialidades')}
                >
                  <Text className="mr-4 text-xl">
                    🩺
                  </Text>

                  <Text className="text-base text-gray-700">
                    Especialidades
                  </Text>
                </TouchableOpacity>

                {/* SEPARAR CITA */}
                <TouchableOpacity
                  onPress={() => {
                    setMenuAbierto(false);
                    router.push('/calendario' as any);
                  }}
                  className="flex-row items-center border-b border-gray-200 px-5 py-4"
                >
                  <Text className="mr-3 text-xl">
                    📅
                  </Text>

                  <Text className="text-base font-semibold text-[#263b52]">
                    Separar una cita
                  </Text>
                </TouchableOpacity>

                {/* ADOPCIÓN */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                  onPress={() => setMenuAbierto(false)}
                >
                  <Text className="mr-4 text-xl">
                    🐾
                  </Text>

                  <Text className="text-base text-gray-700">
                    Adopción
                  </Text>
                </TouchableOpacity>

                {/* SESIÓN */}
                {usuario ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="mb-2 flex-row items-center rounded-xl bg-red-50 px-4 py-4"
                    onPress={cerrarSesion}
                  >
                    <Text className="mr-4 text-xl">
                      🚪
                    </Text>

                    <Text className="text-base font-semibold text-red-600">
                      Cerrar sesión
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                    onPress={() => {
                      setMenuAbierto(false);
                      router.push('/login' as any);
                    }}
                  >
                    <Text className="mr-4 text-xl">
                      👤
                    </Text>

                    <Text className="text-base text-gray-700">
                      Iniciar sesión
                    </Text>
                  </TouchableOpacity>
                )}

                {/* CONTACTO */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mb-2 flex-row items-center rounded-xl px-4 py-4"
                  onPress={() => navegar('contactanos')}
                >
                  <Text className="mr-4 text-xl">
                    📞
                  </Text>

                  <Text className="text-base text-gray-700">
                    Contáctanos
                  </Text>
                </TouchableOpacity>

                {/* SEPARADOR */}
                <View className="my-5 border-t border-gray-200" />
              </>
            )}

            <Text className="text-center text-xs text-gray-400">
              Huellitas Programadoras
            </Text>

          </View>
        </View>
      </Modal>
    </>
  );
}