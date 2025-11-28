import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  mensagem?: string;
  aoTentarNovamente: () => void;
};

export default function Erro({ mensagem = "Algo deu errado.", aoTentarNovamente }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>{mensagem}</Text>

      <TouchableOpacity style={styles.botao} onPress={aoTentarNovamente}>
        <Text style={styles.botaoTexto}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  texto: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  botao: {
    backgroundColor: "#b41a17ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});
