import { View, TextInput } from "react-native";
import { useState, useEffect } from "react";

export default function BarraBusca({ aoMudar }) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const t = setTimeout(() => aoMudar(texto), 500);
    return () => clearTimeout(t);
  }, [texto]);

  return (
    <View
      style={{
        backgroundColor: "#eee",
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
      }}
    >
      <TextInput
        placeholder="Buscar Pokémon..."
        style={{ fontSize: 16 }}
        value={texto}
        onChangeText={setTexto}
      />
    </View>
  );
}
