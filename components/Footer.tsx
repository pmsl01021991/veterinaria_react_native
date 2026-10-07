import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const social = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/huellitas',
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/huellitas',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@huellitas',
  },
];

export default function Footer() {
  const abrirRedSocial = async (url: string) => {
    await Linking.openURL(url);
  };

  return (
  <SafeAreaView
  edges={['bottom']}
  className="bg-white"
>
    <View className="bg-[#394a66] px-6 py-8">

      <View className="items-center">
        <Text className="text-xl font-bold text-white">
          🐾 Huellitas Programadoras
        </Text>

        <Text className="mt-2 text-center text-sm leading-5 text-slate-300">
          Cuidamos, amamos y damos hogar a quienes más lo necesitan
        </Text>
      </View>

      <View className="mt-6 flex-row flex-wrap justify-center">
        {social.map((item) => (
          <TouchableOpacity
            key={item.name}
            onPress={() => abrirRedSocial(item.href)}
            className="mx-2 my-1"
          >
            <Text className="font-semibold text-white">
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-6 border-t border-slate-500 pt-4">
        <Text className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Huellitas Programadoras -
          Todos los derechos reservados
        </Text>
      </View>

        </View>
  </SafeAreaView>
  );
}