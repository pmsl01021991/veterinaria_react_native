import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, ScrollView, TextInput,} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { collection, getDocs, query, where, addDoc,} from 'firebase/firestore';
import { db } from '@/services/firebase';

export default function Calendario() {

  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [servicios, setServicios] = useState<any[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<number | null>(null);
  const [nombreServicioSeleccionado, setNombreServicioSeleccionado] = useState('');
  const [paso, setPaso] = useState(0);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoMascota, setTipoMascota] = useState('');
  const [nombreMascota, setNombreMascota] = useState('');
  const [razaMascota, setRazaMascota] = useState('');
  const [edadMascota, setEdadMascota] = useState('');
  const [nombreDueno, setNombreDueno] = useState('');
  const [telefonoDueno, setTelefonoDueno] = useState('');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);

  const hoy = new Date().toISOString().split('T')[0];

  const seleccionarFecha = async (day: DateData) => {
    if (day.dateString < hoy) {
        Alert.alert(
        'Fecha no disponible',
        'No puedes seleccionar una fecha anterior a hoy.'
        );
        return;
    }

    setFechaSeleccionada(day.dateString);

    setServicioSeleccionado(null);
    setNombreServicioSeleccionado('');
    setHoraSeleccionada('');
    setPaso(1);

    await cargarServicios();

    setModalVisible(true);
    };

  const cargarServicios = async () => {
    try {
        setCargandoServicios(true);

        const snapshot = await getDocs(collection(db, 'servicios'));

        const datos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        }));

        setServicios(datos);
    } catch (error) {
        console.error('Error al cargar servicios:', error);
        Alert.alert(
        'Error',
        'No se pudieron cargar los servicios.'
        );
    } finally {
        setCargandoServicios(false);
    }
    };

    const cargarHorasDisponibles = async () => {
        if (!fechaSeleccionada) return;

        try {
            setCargandoHoras(true);

            const horasBase = [
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '14:00',
            '15:00',
            '16:00',
            ];

            const consulta = query(
            collection(db, 'citas'),
            where('fecha', '==', fechaSeleccionada)
            );

            const snapshot = await getDocs(consulta);

            const horasOcupadas = snapshot.docs
                .map(doc => doc.data().hora)
                .filter(Boolean);

            setHorasOcupadas(horasOcupadas);

            setHorasDisponibles(horasBase);
        } catch (error) {
            console.error('Error al cargar horarios:', error);

            Alert.alert(
            'Error',
            'No se pudieron consultar los horarios.'
            );
        } finally {
            setCargandoHoras(false);
        }
        };

        const confirmarReserva = async () => {
            try {
                if (
                !fechaSeleccionada ||
                !horaSeleccionada ||
                !servicioSeleccionado ||
                !nombreServicioSeleccionado ||
                !tipoMascota ||
                !nombreMascota.trim() ||
                !razaMascota.trim() ||
                !edadMascota.trim() ||
                !nombreDueno.trim() ||
                telefonoDueno.length !== 9
                ) {
                Alert.alert(
                    'Datos incompletos',
                    'Verifica que todos los datos obligatorios estén completos.'
                );
                return;
                }

                const datosMascota = {
                tipo: tipoMascota,
                nombre: nombreMascota.trim(),
                raza: razaMascota.trim(),
                edad: edadMascota.trim(),
                duenio: nombreDueno.trim(),
                telefono: telefonoDueno,
                servicio: nombreServicioSeleccionado,
                fecha: fechaSeleccionada,
                hora: horaSeleccionada,
                notasAdicionales: notasAdicionales.trim(),
                notas: notasAdicionales.trim(),
                estado: 'Pendiente',
                };

                await addDoc(collection(db, 'mascotas'), datosMascota);

                const datosCita = {
                fecha: fechaSeleccionada,
                hora: horaSeleccionada,
                servicio: nombreServicioSeleccionado,
                nombreMascota: nombreMascota.trim(),
                duenio: nombreDueno.trim(),
                telefono: telefonoDueno,
                notasAdicionales: notasAdicionales.trim(),
                };

                await addDoc(collection(db, 'citas'), datosCita);

                Alert.alert(
                'Reserva confirmada',
                'La cita se ha registrado correctamente.',
                [
                    {
                    text: 'OK',
                    onPress: () => {
                        setModalVisible(false);
                        setPaso(1);
                    },
                    },
                ]
                );

            } catch (error) {
                console.error('Error al guardar la reserva:', error);

                Alert.alert(
                'Error',
                'No se pudo guardar la reserva. Inténtalo nuevamente.'
                );
            }
            };

  return (
    <View className="flex-1 bg-[#f5f7fb] px-5 pt-6">
      <Text className="text-[26px] font-bold text-[#263b52] mt-5">
        📅 Agenda tu cita
      </Text>

      <Text className="text-[15px] text-gray-500 mt-2 mb-5">
        Selecciona el día en que deseas atender a tu mascota.
      </Text>

      <View
        style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 8,
            elevation: 3,
        }}
        >
        <Calendar
          minDate={hoy}
          onDayPress={seleccionarFecha}
          markedDates={
            fechaSeleccionada
              ? {
                  [fechaSeleccionada]: {
                    selected: true,
                    selectedColor: '#7b3fe4',
                  },
                }
              : {}
          }
          theme={{
            todayTextColor: '#7b3fe4',
            arrowColor: '#7b3fe4',
            selectedDayBackgroundColor: '#7b3fe4',
            selectedDayTextColor: '#ffffff',
            monthTextColor: '#263b52',
            textMonthFontWeight: 'bold',
            textDayFontSize: 15,
            textMonthFontSize: 18,
          }}
        />
      </View>

      <Modal
  visible={modalVisible}
  animationType="fade"
  transparent
  onRequestClose={() => setModalVisible(false)}
>
  <View className="flex-1 bg-black/50 justify-center px-5">

    <View className="bg-[#f5f7fb] rounded-3xl overflow-hidden max-h-[85%]">

      <View className="bg-[#7b3fe4] px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-white text-lg font-bold">
            Agendar cita
          </Text>

          <Text className="text-white/80 text-sm mt-1">
            Paso {paso} de 10
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(false)}
        >
          <Text className="text-white text-2xl">
            ×
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >

        {paso === 1 && (
          <View>

            <Text className="text-2xl font-bold text-[#263b52] mb-2">
              🩺 Selecciona el servicio
            </Text>

            <Text className="text-gray-500 mb-5">
              Fecha seleccionada: {fechaSeleccionada}
            </Text>

            {cargandoServicios ? (
              <Text className="text-gray-500 text-center py-5">
                Cargando servicios...
              </Text>
            ) : servicios.length === 0 ? (
              <Text className="text-gray-500 text-center py-5">
                No hay servicios registrados.
              </Text>
            ) : (
              servicios.map((servicio) => (
                <TouchableOpacity
                  key={servicio.id}
                  className={`p-4 rounded-xl mb-3 border ${
                    servicioSeleccionado === servicio.id
                      ? 'bg-[#7b3fe4] border-[#7b3fe4]'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => {
                    setServicioSeleccionado(servicio.id);
                    setNombreServicioSeleccionado(servicio.nombre);
                  }}
                >
                  <Text
                    className={`text-base font-semibold ${
                      servicioSeleccionado === servicio.id
                        ? 'text-white'
                        : 'text-[#263b52]'
                    }`}
                  >
                    {servicio.nombre}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                    className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                    onPress={() => setModalVisible(false)}
                >
                    <Text className="text-[#263b52] text-base font-bold">
                    ← Volver
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!servicioSeleccionado}
                    className={`flex-1 py-3 rounded-xl items-center ${
                    servicioSeleccionado ? 'bg-[#7b3fe4]' : 'bg-gray-300'
                    }`}
                    onPress={() => {
                    setPaso(2);
                    cargarHorasDisponibles();
                    }}
                >
                    <Text className="text-white text-base font-bold">
                    Continuar →
                    </Text>
                </TouchableOpacity>
                </View>

          </View>
        )}

        {paso === 2 && (
          <View>

            <Text className="text-2xl font-bold text-[#263b52] mb-2">
              🕐 Selecciona el horario
            </Text>

            <Text className="text-gray-500 mb-5">
              {nombreServicioSeleccionado}
            </Text>

            {cargandoHoras ? (
                <Text className="text-gray-500 text-center py-5">
                    Consultando horarios...
                </Text>
                ) : horasDisponibles.length === 0 ? (
                <Text className="text-red-500 text-center py-5">
                    No hay horarios disponibles para esta fecha.
                </Text>
                ) : (
                horasDisponibles.map((hora) => {
                    const ocupada = horasOcupadas.includes(hora);

                    return (
                    <TouchableOpacity
                        key={hora}
                        disabled={ocupada}
                        className={`p-4 rounded-xl mb-3 border ${
                        ocupada
                            ? 'bg-gray-200 border-gray-300'
                            : horaSeleccionada === hora
                            ? 'bg-[#7b3fe4] border-[#7b3fe4]'
                            : 'bg-white border-gray-200'
                        }`}
                        onPress={() => setHoraSeleccionada(hora)}
                    >
                        <Text
                        className={`text-center text-base font-semibold ${
                            ocupada
                            ? 'text-gray-400'
                            : horaSeleccionada === hora
                            ? 'text-white'
                            : 'text-[#263b52]'
                        }`}
                        >
                        {hora}
                        </Text>

                        {ocupada && (
                        <Text className="text-center text-sm text-gray-400 mt-1">
                            No disponible
                        </Text>
                        )}
                    </TouchableOpacity>
                    );
                })
                )}

            <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                    className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                    onPress={() => setPaso(1)}
                >
                    <Text className="text-[#263b52] text-base font-bold">
                    ← Volver
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!horaSeleccionada}
                    className={`flex-1 py-3 rounded-xl items-center ${
                    horaSeleccionada ? 'bg-[#7b3fe4]' : 'bg-gray-300'
                    }`}
                    onPress={() => setPaso(3)}
                >
                    <Text className="text-white text-base font-bold">
                    Continuar →
                    </Text>
                </TouchableOpacity>
                </View>

          </View>
        )}

        {paso === 3 && (
            <View>

                <Text className="text-2xl font-bold text-[#263b52] mb-2">
                🐾 Tipo de mascota
                </Text>

                <Text className="text-gray-500 mb-5">
                Selecciona qué tipo de mascota deseas registrar.
                </Text>

                <View className="flex-row flex-wrap justify-between">

                <TouchableOpacity
                    className={`w-[48%] p-5 rounded-2xl mb-4 items-center border ${
                    tipoMascota === 'perro'
                        ? 'bg-[#7b3fe4] border-[#7b3fe4]'
                        : 'bg-white border-gray-200'
                    }`}
                    onPress={() => setTipoMascota('perro')}
                >
                    <Text className="text-5xl mb-2">
                    🐶
                    </Text>

                    <Text
                    className={`text-base font-bold ${
                        tipoMascota === 'perro'
                        ? 'text-white'
                        : 'text-[#263b52]'
                    }`}
                    >
                    Perro
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`w-[48%] p-5 rounded-2xl mb-4 items-center border ${
                    tipoMascota === 'gato'
                        ? 'bg-[#7b3fe4] border-[#7b3fe4]'
                        : 'bg-white border-gray-200'
                    }`}
                    onPress={() => setTipoMascota('gato')}
                >
                    <Text className="text-5xl mb-2">
                    🐱
                    </Text>

                    <Text
                    className={`text-base font-bold ${
                        tipoMascota === 'gato'
                        ? 'text-white'
                        : 'text-[#263b52]'
                    }`}
                    >
                    Gato
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`w-[48%] p-5 rounded-2xl mb-4 items-center border ${
                    tipoMascota === 'ave'
                        ? 'bg-[#7b3fe4] border-[#7b3fe4]'
                        : 'bg-white border-gray-200'
                    }`}
                    onPress={() => setTipoMascota('ave')}
                >
                    <Text className="text-5xl mb-2">
                    🦜
                    </Text>

                    <Text
                    className={`text-base font-bold ${
                        tipoMascota === 'ave'
                        ? 'text-white'
                        : 'text-[#263b52]'
                    }`}
                    >
                    Ave
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`w-[48%] p-5 rounded-2xl mb-4 items-center border ${
                    tipoMascota === 'pez'
                        ? 'bg-[#7b3fe4] border-[#7b3fe4]'
                        : 'bg-white border-gray-200'
                    }`}
                    onPress={() => setTipoMascota('pez')}
                >
                    <Text className="text-5xl mb-2">
                    🐟
                    </Text>

                    <Text
                    className={`text-base font-bold ${
                        tipoMascota === 'pez'
                        ? 'text-white'
                        : 'text-[#263b52]'
                    }`}
                    >
                    Pez
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`w-[48%] p-5 rounded-2xl mb-4 items-center border ${
                        tipoMascota === 'otros'
                        ? 'bg-[#7b3fe4] border-[#7b3fe4]'
                        : 'bg-white border-gray-200'
                    }`}
                    onPress={() => setTipoMascota('otros')}
                    >
                    <Text className="text-5xl mb-2">
                        🐾
                    </Text>

                    <Text
                        className={`text-base font-bold ${
                        tipoMascota === 'otros'
                            ? 'text-white'
                            : 'text-[#263b52]'
                        }`}
                    >
                        Otros
                    </Text>
                    </TouchableOpacity>

                </View>

                <View className="flex-row gap-3 mt-5">
                    <TouchableOpacity
                        className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                        onPress={() => setPaso(2)}
                    >
                        <Text className="text-[#263b52] text-base font-bold">
                        ← Volver
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!tipoMascota}
                        className={`flex-1 py-3 rounded-xl items-center ${
                        tipoMascota ? 'bg-[#7b3fe4]' : 'bg-gray-300'
                        }`}
                        onPress={() => setPaso(4)}
                    >
                        <Text className="text-white text-base font-bold">
                        Continuar →
                        </Text>
                    </TouchableOpacity>
                    </View>

            </View>
            )}

            {paso === 4 && (
                <View>
                    <Text className="text-2xl font-bold text-[#263b52] mb-2">
                    🐾 Nombre de la mascota
                    </Text>

                    <Text className="text-gray-500 mb-5">
                    ¿Cómo se llama tu mascota?
                    </Text>

                    <TextInput
                    value={nombreMascota}
                    onChangeText={setNombreMascota}
                    placeholder="Ejemplo: Max"
                    placeholderTextColor="#9ca3af"
                    className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-[#263b52]"
                    autoCapitalize="words"
                    />

                    <View className="flex-row gap-3 mt-5">
                        <TouchableOpacity
                            className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                            onPress={() => setPaso(3)}
                        >
                            <Text className="text-[#263b52] text-base font-bold">
                            ← Volver
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={!nombreMascota.trim()}
                            className={`flex-1 py-3 rounded-xl items-center ${
                            nombreMascota.trim() ? 'bg-[#7b3fe4]' : 'bg-gray-300'
                            }`}
                            onPress={() => setPaso(5)}
                        >
                            <Text className="text-white text-base font-bold">
                            Continuar →
                            </Text>
                        </TouchableOpacity>
                        </View>
                </View>
                )}

                {paso === 5 && (
                    <View>
                        <Text className="text-2xl font-bold text-[#263b52] mb-2">
                        🐾 Raza de la mascota
                        </Text>

                        <Text className="text-gray-500 mb-5">
                        ¿Cuál es la raza de tu mascota?
                        </Text>

                        <TextInput
                        value={razaMascota}
                        onChangeText={setRazaMascota}
                        placeholder="Ejemplo: Labrador"
                        placeholderTextColor="#9ca3af"
                        className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-[#263b52]"
                        autoCapitalize="words"
                        />

                        <View className="flex-row gap-3 mt-5">
                            <TouchableOpacity
                                className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                                onPress={() => setPaso(4)}
                            >
                                <Text className="text-[#263b52] text-base font-bold">
                                ← Volver
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={!razaMascota.trim()}
                                className={`flex-1 py-3 rounded-xl items-center ${
                                razaMascota.trim() ? 'bg-[#7b3fe4]' : 'bg-gray-300'
                                }`}
                                onPress={() => setPaso(6)}
                            >
                                <Text className="text-white text-base font-bold">
                                Continuar →
                                </Text>
                            </TouchableOpacity>
                            </View>
                    </View>
                    )}

                    {paso === 6 && (
                        <View>
                            <Text className="text-2xl font-bold text-[#263b52] mb-2">
                            🎂 Edad de la mascota
                            </Text>

                            <Text className="text-gray-500 mb-5">
                            ¿Cuántos años tiene tu mascota?
                            </Text>

                            <TextInput
                            value={edadMascota}
                            onChangeText={setEdadMascota}
                            placeholder="Ejemplo: 3"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-[#263b52]"
                            maxLength={2}
                            />

                            <View className="flex-row gap-3 mt-5">
                                <TouchableOpacity
                                    className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                                    onPress={() => setPaso(5)}
                                >
                                    <Text className="text-[#263b52] text-base font-bold">
                                    ← Volver
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    disabled={!edadMascota.trim()}
                                    className={`flex-1 py-3 rounded-xl items-center ${
                                    edadMascota.trim() ? 'bg-[#7b3fe4]' : 'bg-gray-300'
                                    }`}
                                    onPress={() => setPaso(7)}
                                >
                                    <Text className="text-white text-base font-bold">
                                    Continuar →
                                    </Text>
                                </TouchableOpacity>
                                </View>
                        </View>
                        )}

                        {paso === 7 && (
                            <View>
                                <Text className="text-2xl font-bold text-[#263b52] mb-2">
                                👤 Nombre del dueño
                                </Text>

                                <Text className="text-gray-500 mb-5">
                                Ingresa el nombre del propietario de la mascota.
                                </Text>

                                <TextInput
                                value={nombreDueno}
                                onChangeText={setNombreDueno}
                                placeholder="Ejemplo: Juan Pérez"
                                placeholderTextColor="#9ca3af"
                                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-[#263b52]"
                                autoCapitalize="words"
                                />

                                <View className="flex-row gap-3 mt-5">
                                    <TouchableOpacity
                                        className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                                        onPress={() => setPaso(6)}
                                    >
                                        <Text className="text-[#263b52] text-base font-bold">
                                        ← Volver
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        disabled={!nombreDueno.trim()}
                                        className={`flex-1 py-3 rounded-xl items-center ${
                                        nombreDueno.trim() ? 'bg-[#7b3fe4]' : 'bg-gray-300'
                                        }`}
                                        onPress={() => setPaso(8)}
                                    >
                                        <Text className="text-white text-base font-bold">
                                        Continuar →
                                        </Text>
                                    </TouchableOpacity>
                                    </View>
                            </View>
                            )}

                    {paso === 8 && (
                        <View>
                            <Text className="text-2xl font-bold text-[#263b52] mb-2">
                            📱 Teléfono
                            </Text>

                            <Text className="text-gray-500 mb-5">
                            Ingresa el número de teléfono del dueño.
                            </Text>

                            <TextInput
                            value={telefonoDueno}
                            onChangeText={setTelefonoDueno}
                            placeholder="Ejemplo: 987654321"
                            placeholderTextColor="#9ca3af"
                            keyboardType="phone-pad"
                            maxLength={9}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-[#263b52]"
                            />

                            <View className="flex-row gap-3 mt-5">
                                <TouchableOpacity
                                    className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                                    onPress={() => setPaso(7)}
                                >
                                    <Text className="text-[#263b52] text-base font-bold">
                                    ← Volver
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    disabled={telefonoDueno.length !== 9}
                                    className={`flex-1 py-3 rounded-xl items-center ${
                                    telefonoDueno.length === 9 ? 'bg-[#7b3fe4]' : 'bg-gray-300'
                                    }`}
                                    onPress={() => setPaso(9)}
                                >
                                    <Text className="text-white text-base font-bold">
                                    Continuar →
                                    </Text>
                                </TouchableOpacity>
                                </View>
                        </View>
                        )}
                
                {paso === 9 && (
                    <View>
                        <Text className="text-2xl font-bold text-[#263b52] mb-2">
                        📝 Notas adicionales
                        </Text>

                        <Text className="text-gray-500 mb-5">
                        ¿Hay algo que debamos saber sobre tu mascota?
                        </Text>

                        <TextInput
                        value={notasAdicionales}
                        onChangeText={setNotasAdicionales}
                        placeholder="Ejemplo: Es nervioso, tener cuidado..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-[#263b52] min-h-[130px]"
                        />

                        <View className="flex-row gap-3 mt-5">
                            <TouchableOpacity
                                className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                                onPress={() => setPaso(8)}
                            >
                                <Text className="text-[#263b52] text-base font-bold">
                                ← Volver
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-[#7b3fe4] py-3 rounded-xl items-center"
                                onPress={() => setPaso(10)}
                            >
                                <Text className="text-white text-base font-bold">
                                Continuar →
                                </Text>
                            </TouchableOpacity>
                            </View>
                    </View>
                    )}

                {paso === 10 && (
                    <View>
                        <Text className="text-2xl font-bold text-[#263b52] mb-2">
                        ✅ Confirmar reserva
                        </Text>

                        <Text className="text-gray-500 mb-5">
                        Revisa que los datos sean correctos antes de confirmar.
                        </Text>

                        <View className="bg-white rounded-2xl p-4 mb-3">
                        <Text className="text-sm text-gray-500">
                            📅 Fecha
                        </Text>

                        <Text className="text-base font-bold text-[#263b52] mt-1">
                            {fechaSeleccionada}
                        </Text>
                        </View>

                        <View className="bg-white rounded-2xl p-4 mb-3">
                        <Text className="text-sm text-gray-500">
                            🩺 Servicio
                        </Text>

                        <Text className="text-base font-bold text-[#263b52] mt-1">
                            {nombreServicioSeleccionado}
                        </Text>
                        </View>

                        <View className="bg-white rounded-2xl p-4 mb-3">
                        <Text className="text-sm text-gray-500">
                            🕐 Hora
                        </Text>

                        <Text className="text-base font-bold text-[#263b52] mt-1">
                            {horaSeleccionada}
                        </Text>
                        </View>

                        <View className="bg-white rounded-2xl p-4 mb-3">
                        <Text className="text-sm text-gray-500">
                            🐾 Mascota
                        </Text>

                        <Text className="text-base font-bold text-[#263b52] mt-1">
                            {nombreMascota}
                        </Text>

                        <Text className="text-gray-600 mt-1">
                            Tipo: {tipoMascota}
                        </Text>

                        <Text className="text-gray-600 mt-1">
                            Raza: {razaMascota}
                        </Text>

                        <Text className="text-gray-600 mt-1">
                            Edad: {edadMascota} años
                        </Text>
                        </View>

                        <View className="bg-white rounded-2xl p-4 mb-3">
                        <Text className="text-sm text-gray-500">
                            👤 Dueño
                        </Text>

                        <Text className="text-base font-bold text-[#263b52] mt-1">
                            {nombreDueno}
                        </Text>

                        <Text className="text-gray-600 mt-1">
                            📱 {telefonoDueno}
                        </Text>
                        </View>

                        <View className="bg-white rounded-2xl p-4 mb-5">
                        <Text className="text-sm text-gray-500">
                            📝 Notas
                        </Text>

                        <Text className="text-gray-600 mt-1">
                            {notasAdicionales || 'Sin notas adicionales.'}
                        </Text>
                        </View>

                        <View className="flex-row gap-3 mt-5">
                            <TouchableOpacity
                                className="flex-1 bg-gray-300 py-3 rounded-xl items-center"
                                onPress={() => setPaso(9)}
                            >
                                <Text className="text-[#263b52] text-base font-bold">
                                ← Volver
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-[#7b3fe4] py-3 rounded-xl items-center"
                                onPress={confirmarReserva}
                            >
                                <Text className="text-white text-base font-bold">
                                Confirmar
                                </Text>
                            </TouchableOpacity>
                            </View>
                    </View>
                    )}

      </ScrollView>

    </View>
  </View>
</Modal>
    </View>

    
  );
}