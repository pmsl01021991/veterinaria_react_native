import { useRef } from 'react';
import { Image, Linking, ScrollView, Text, TouchableOpacity, useWindowDimensions, View,} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';

const banner = require('../assets/huellitas/Imagenes/Img-principal-alt.png');
const imagenSobreNosotros = require('../assets/huellitas/Imagenes/Img-secundaria.png');

const especialidades = [
  {
    titulo: 'Cirugía Especializada',
    descripcion:
      'Cirugías especializadas, desde cirugías plásticas hasta neurocirugías.',
    fondo: 'bg-red-600',
    icono: '🩺',
  },
  {
    titulo: 'Cirugía General',
    descripcion:
      'Esterilizaciones, extracción de tumores y otros procedimientos generales.',
    fondo: 'bg-green-600',
    icono: '🏥',
  },
  {
    titulo: 'Oftalmología',
    descripcion:
      'Detectamos y tratamos alteraciones de la visión y molestias oculares.',
    fondo: 'bg-yellow-500',
    icono: '👁️',
  },
  {
    titulo: 'Medicina Regenerativa',
    descripcion:
      'Técnicas modernas para favorecer la recuperación de nuestros pacientes.',
    fondo: 'bg-cyan-500',
    icono: '🧬',
  },
  {
    titulo: 'Odontología',
    descripcion:
      'Atención especializada para cuidar la salud oral de tu mascota.',
    fondo: 'bg-blue-600',
    icono: '🦷',
  },
  {
    titulo: 'Cardiología',
    descripcion:
      'Evaluación y tratamiento para detectar enfermedades cardíacas.',
    fondo: 'bg-gray-600',
    icono: '❤️',
  },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);

  const alturaBanner = width * (627 / 1422);

  const anchoImagenSobreNosotros = width - 40;

  const altoImagenSobreNosotros =
    anchoImagenSobreNosotros * (667 / 1000);

  const navegar = (section: string) => {
    const posiciones: Record<string, number> = {
      inicio: 0,
      especialidades: alturaBanner + 100,
      'sobre-nosotros': 2600,
      contactanos: 3600,
    };

    scrollRef.current?.scrollTo({
      y: posiciones[section] ?? 0,
      animated: true,
    });
  };

  const abrirMapa = async () => {
    await Linking.openURL(
      'https://www.google.com/maps/search/?api=1&query=Av+Jose+Pardo+de+Zela+455+Lince+Lima'
    );
  };

  return (
    <View className="flex-1 bg-white">

      <Header onNavigate={navegar} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >

        {/* BANNER */}
        <View className="w-full bg-white">
          <Image
            source={banner}
            style={{
              width,
              height: alturaBanner,
            }}
            resizeMode="contain"
          />
        </View>        

        {/* ESPECIALIDADES */}
        <View
          className="px-5 pb-8 pt-10"
          nativeID="especialidades"
        >

          <Text className="text-center text-2xl font-bold text-[#263b52]">
            Especialidades
          </Text>

          <Text className="mt-2 mb-6 text-center text-sm text-gray-500">
            Servicios especializados para el cuidado de tu mascota
          </Text>

          <View className="flex-row flex-wrap justify-between">

            {especialidades.map((item) => (
              <View
                key={item.titulo}
                className={`mb-4 w-[48%] overflow-hidden rounded-2xl ${item.fondo}`}
              >

                <View className="items-center px-3 pb-3 pt-5">

                  <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Text className="text-2xl">
                      {item.icono}
                    </Text>
                  </View>

                  <Text className="mt-3 text-center text-base font-bold leading-5 text-white">
                    {item.titulo}
                  </Text>

                </View>

                <View className="border-t border-white/20 px-4 py-4">

                  <Text className="text-center text-xs leading-5 text-white">
                    {item.descripcion}
                  </Text>

                </View>

              </View>
            ))}

          </View>
        </View>

        {/* SOBRE NOSOTROS */}
        <View
          className="bg-[#f5f8fb] px-5 py-10"
          nativeID="sobre-nosotros"
        >

          <Text className="text-2xl font-bold text-[#263b52]">
            Sobre Nosotros
          </Text>

          <Text className="mt-4 text-sm leading-6 text-gray-600">
            Somos un equipo de profesionales enfocados en llevar medicina
            veterinaria de calidad a nuestros pacientes, brindando atención
            personalizada y acompañamiento continuo a sus tutores.
          </Text>

          <Image
            source={imagenSobreNosotros}
            className="mt-6 rounded-2xl"
            style={{
              width: anchoImagenSobreNosotros,
              height: altoImagenSobreNosotros,
            }}
            resizeMode="contain"
          />

        </View>

        {/* CONTACTO */}
        <View
          className="px-5 py-10"
          nativeID="contactanos"
        >

          <Text className="text-2xl font-bold text-[#263b52]">
            Contáctanos
          </Text>

          <Text className="mt-2 text-sm text-gray-500">
            Estamos para ayudarte
          </Text>

          {/* DIRECCIÓN */}
          <View className="mt-7 flex-row rounded-2xl bg-gray-50 p-4">

            <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-[#e8f3fa]">
              <Text className="text-xl">
                📍
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-[#263b52]">
                Dirección
              </Text>

              <Text className="mt-1 text-sm leading-5 text-gray-600">
                Av Jose Pardo de Zela Nº 455, Lince, Lima
              </Text>
            </View>

          </View>

          {/* TELÉFONO */}
          <View className="mt-3 flex-row rounded-2xl bg-gray-50 p-4">

            <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-[#e8f3fa]">
              <Text className="text-xl">
                📞
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-[#263b52]">
                Teléfono
              </Text>

              <Text className="mt-1 text-sm text-gray-600">
                (+51) 456 7890
              </Text>
            </View>

          </View>

          {/* CORREO */}
          <View className="mt-3 flex-row rounded-2xl bg-gray-50 p-4">

            <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-[#e8f3fa]">
              <Text className="text-xl">
                ✉️
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-[#263b52]">
                Correo electrónico
              </Text>

              <Text className="mt-1 text-sm text-gray-600">
                informes@huellitas.com
              </Text>
            </View>

          </View>

          {/* MAPA */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={abrirMapa}
            className="mt-5 rounded-xl bg-[#377fb2] px-5 py-4"
          >
            <Text className="text-center text-base font-bold text-white">
              📍 Ver ubicación en Google Maps
            </Text>
          </TouchableOpacity>

        </View>

        <Footer />

      </ScrollView>

    </View>
  );
}