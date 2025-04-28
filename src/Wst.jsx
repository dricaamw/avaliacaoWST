import { useState, useCallback } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { habilidades, notas } from "./components/constants";

export default function HomePage() {
  const [pacientes, setPacientes] = useState(
    Array(5).fill().map(() => ({
      nome: "",
      prontuario: "",
      habilidadeNotas: Array(habilidades.length).fill("0"),
    }))
  );

  const atualizarPaciente = useCallback((pacienteIndex, campo, valor) => {
    const novosPacientes = [...pacientes];
    novosPacientes[pacienteIndex][campo] = valor.toUpperCase();
    setPacientes(novosPacientes);
  }, [pacientes]);

  const handleNotaChange = useCallback((pacienteIndex, habilidadeIndex, valor) => {
    const novosPacientes = [...pacientes];
    novosPacientes[pacienteIndex].habilidadeNotas[habilidadeIndex] = valor;
    setPacientes(novosPacientes);
  }, [pacientes]);

  // Função para calcular a pontuação
  const calcularPontuacao = (habilidadeNotas, inicio, fim) => {
    const subset = habilidadeNotas.slice(inicio, fim);
    const validas = subset.filter((nota) => nota !== "NP" && nota !== "TE" && nota !== "");
    if (validas.length === 0) return "N/D";
    const somaNotas = validas.reduce((acc, nota) => acc + parseInt(nota || "0"), 0);
    const totalPossivel = validas.length * 3;
    return ((somaNotas / totalPossivel) * 100).toFixed(2);
  };

  const gerarRelatorio = useCallback(async (paciente, tipo = "admissao") => {
    if (!paciente.nome || !paciente.prontuario) {
      alert("Nome e prontuário do paciente são obrigatórios.");
      return;
    }
    try {
      const modeloUrl = tipo === "alta" ? "/modelo_alta.docx" : "/modelo_admissao.docx";
      const response = await fetch(modeloUrl);
      if (!response.ok) throw new Error("Erro ao carregar o modelo do relatório");
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      const templateData = {
        paciente: paciente.prontuario,
        escore_domiciliar: calcularPontuacao(paciente.habilidadeNotas, 0, 11),
        escore_comunitario: calcularPontuacao(paciente.habilidadeNotas, 0, 21),
        escore_avancado: calcularPontuacao(paciente.habilidadeNotas, 0, 30),
        ...paciente.habilidadeNotas.reduce((acc, nota, index) => ({
          ...acc,
          [`habilidade_${index + 1}`]: nota,
        }), {}),
      };

      doc.setData(templateData);
      doc.render();
      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `Relatorio_${paciente.prontuario}_${tipo}.docx`);
    } catch (error) {
      console.error("Erro ao gerar o relatório:", error);
      alert(
        error.message.includes("fetch")
          ? "Não foi possível carregar o modelo do relatório."
          : "Erro ao gerar o relatório. Tente novamente."
      );
    }
  }, []);
  
  return (
    <div className="p-4 font-sans max-w-full overflow-x-auto">
      <h1 className="text-2xl font-bold p-6 text-center">WST Versão 5.4.2</h1>
      <div className="p-4 max-w-full overflow-x-auto">
        <table className="min-w-full table-auto border divide-y divide-gray-200">
          <thead className="bg-blue-200">
            <tr>
              <th className="border text-lg">HABILIDADES</th>
              {pacientes.map((paciente, pacienteIndex) => (
                <th key={pacienteIndex} className="border p-2">
                  <div className="flex flex-col gap-2">
                  <label htmlFor={`nome-${pacienteIndex}`} className="sr-only">
                      Nome
                    </label>
                    <input
                      id={`nome-${pacienteIndex}`}
                      type="text"
                      placeholder="Nome"
                      className="mb-3 mt-1 p-2 border rounded w-full bg-gray-100 focus:bg-white uppercase"
                      value={paciente.nome}
                      onChange={(e) => atualizarPaciente(pacienteIndex, "nome", e.target.value)}
                    />
                    <label htmlFor={`prontuario-${pacienteIndex}`} className="sr-only">
                      Prontuário
                    </label>
                    <input
                      id={`prontuario-${pacienteIndex}`}
                      type="text"
                      placeholder="Prontuário"
                      className="mb-1 p-2 border rounded w-full bg-gray-100 focus:bg-white uppercase"
                      value={paciente.prontuario}
                      onChange={(e) => atualizarPaciente(pacienteIndex, "prontuario", e.target.value)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habilidades.map((habilidade, habilidadeIndex) => (
              <tr key={habilidadeIndex}>
                <td className="border p-2 font-semibold text-lg bg-gray-300">
                  {habilidade}
                </td>
                {pacientes.map((paciente, pacienteIndex) => (
                  <td key={pacienteIndex} className="border p-2">
                    <select
                      className="p-1 border rounded w-full"
                      value={paciente.habilidadeNotas[habilidadeIndex]}
                      onChange={(e) =>
                        handleNotaChange(
                          pacienteIndex,
                          habilidadeIndex,
                          e.target.value
                        )
                      }
                    >
                      <option value="">Selecione</option>
                      {notas.map((nota, notaIndex) => (
                        <option key={notaIndex} value={nota}>
                          {nota}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
            {/* Linha de Pontuação Domiciliar */}
            <tr>
              <td className="border p-2 font-semibold text-lg bg-yellow-200">
                Pontuação Domiciliar
              </td>
              {pacientes.map((paciente, pacienteIndex) => (
                <td
                  key={pacienteIndex}
                  className="border p-2 text-center font-bold"
                >
                  {calcularPontuacao(paciente.habilidadeNotas, 0, 11)}%
                </td>
              ))}
            </tr>

            {/* Linha de Pontuação Comunitário */}
            <tr>
              <td className="border p-2 font-semibold text-lg bg-yellow-200">
                Pontuação Comunitário
              </td>
              {pacientes.map((paciente, pacienteIndex) => (
                <td
                  key={pacienteIndex}
                  className="border p-2 text-center font-bold"
                >
                  {calcularPontuacao(paciente.habilidadeNotas, 0, 21)}%
                </td>
              ))}
            </tr>

            {/* Linha de Pontuação Avançado */}
            <tr>
              <td className="border p-2 font-semibold text-lg bg-yellow-200">
                Pontuação Avançado
              </td>
              {pacientes.map((paciente, pacienteIndex) => (
                <td
                  key={pacienteIndex}
                  className="border p-2 text-center font-bold"
                >
                  {calcularPontuacao(paciente.habilidadeNotas, 0, 30)}%
                </td>
              ))}
            </tr>

            {/* Linha do botão de gerar relatório */}
            <tr>
              <td className="border p-2 font-semibold text-lg bg-gray-300">
                Relatório
              </td>
              {pacientes.map((paciente, pacienteIndex) => (
                <td key={pacienteIndex} className="border p-2 text-center">
                  <button
                    onClick={() => gerarRelatorio(paciente, "admissao")}
                    className="mt-2 p-2 bg-blue-500 text-white font-bold text-lg rounded hover:bg-blue-600 w-full"
                  >
                    Gerar Admissão
                  </button>

                  <button
                    onClick={() => gerarRelatorio(paciente, "alta")}
                    className="mt-2 p-2 bg-green-500 text-white font-bold text-lg rounded hover:bg-green-600 w-full"
                  >
                    Gerar Alta
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
