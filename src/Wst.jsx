import { useState, useCallback } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { habilidades, notas } from "./components/constants";

export default function HomePage() {
  const [pacientes, setPacientes] = useState(
    Array(5)
      .fill()
      .map(() => ({
        nome: "",
        prontuario: "",
        habilidadeNotas: Array(habilidades.length).fill("0"),
      }))
  );

  const atualizarPaciente = useCallback(
    (pacienteIndex, campo, valor) => {
      const novosPacientes = [...pacientes];
      novosPacientes[pacienteIndex][campo] = valor.toUpperCase();
      setPacientes(novosPacientes);
    },
    [pacientes]
  );
  
  const handleNotaChange = (pacienteIndex, habilidadeIndex, valor) => {
    setPacientes((prevPacientes) => {
      const novosPacientes = [...prevPacientes];
      const pacienteAtualizado = { ...novosPacientes[pacienteIndex] };
      const habilidadeNotasAtualizadas = [
        ...pacienteAtualizado.habilidadeNotas,
      ];
      habilidadeNotasAtualizadas[habilidadeIndex] = valor;
      pacienteAtualizado.habilidadeNotas = habilidadeNotasAtualizadas;
      novosPacientes[pacienteIndex] = pacienteAtualizado;
      return novosPacientes;
    });
  };

  const calcularPontuacao = (habilidadeNotas, inicio, fim) => {
    const subset = habilidadeNotas.slice(inicio, fim);
    const validas = subset.filter(
      (nota) => nota !== "NP" && nota !== "TE" && nota !== ""
    );
    if (validas.length === 0) return "N/D";
    const somaNotas = validas.reduce(
      (acc, nota) => acc + parseInt(nota || "0"),
      0
    );
    const totalPossivel = validas.length * 3;
    return ((somaNotas / totalPossivel) * 100).toFixed(2);
  };

  const gerarRelatorio = useCallback(async (paciente, tipo = "admissao") => {
    if (!paciente.nome || !paciente.prontuario) {
      alert("Nome e prontuário do paciente são obrigatórios.");
      return;
    }
    try {
      const modeloUrl =
        tipo === "alta" ? "/modelo_alta.docx" : "/modelo_admissao.docx";
      const response = await fetch(modeloUrl);
      if (!response.ok)
        throw new Error("Erro ao carregar o modelo do relatório");
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const templateData = {
        paciente: paciente.prontuario,
        escore_domiciliar: calcularPontuacao(paciente.habilidadeNotas, 0, 11),
        escore_comunitario: calcularPontuacao(paciente.habilidadeNotas, 0, 21),
        escore_avancado: calcularPontuacao(paciente.habilidadeNotas, 0, 30),
        ...paciente.habilidadeNotas.reduce(
          (acc, nota, index) => ({
            ...acc,
            [`habilidade_${index + 1}`]: nota,
          }),
          {}
        ),
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
    <div className="container">
      <h1 className="title">WST Versão 5.4.2</h1>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="header-cell coluna-habilidade">HABILIDADES</th>
              {pacientes.map((paciente, pacienteIndex) => (
                <th key={pacienteIndex} className="coluna-paciente">
                  <div className="input-group">
                    <input
                      id={`nome-${pacienteIndex}`}
                      type="text"
                      placeholder="Nome"
                      className="input"
                      value={paciente.nome}
                      onChange={(e) =>
                        atualizarPaciente(pacienteIndex, "nome", e.target.value)
                      }
                    />
                    <input
                      id={`prontuario-${pacienteIndex}`}
                      type="text"
                      placeholder="Prontuário"
                      className="input"
                      value={paciente.prontuario}
                      onChange={(e) =>
                        atualizarPaciente(
                          pacienteIndex,
                          "prontuario",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habilidades.map((habilidade, habilidadeIndex) => (
              <tr key={habilidadeIndex}>
                <td className="skill-cell">{habilidade}</td>
                {pacientes.map((paciente, pacienteIndex) => (
                  <td key={pacienteIndex} className="select-cell">
                    <select
                      className="select"
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

            <tr>
              <td className="score-cell">Pontuação Domiciliar</td>
              {pacientes.map((paciente, pacienteIndex) => (
                <td key={pacienteIndex} className="score-cell">
                  {calcularPontuacao(paciente.habilidadeNotas, 0, 11)}%
                </td>
              ))}
            </tr>

            <tr>
              <td className="score-cell">Pontuação Comunitário</td>
              {pacientes.map((paciente, pacienteIndex) => (
                <td key={pacienteIndex} className="score-cell">
                  {calcularPontuacao(paciente.habilidadeNotas, 0, 21)}%
                </td>
              ))}
            </tr>

            <tr>
              <td className="score-cell">Pontuação Avançado</td>
              {pacientes.map((paciente, pacienteIndex) => (
                <td key={pacienteIndex} className="score-cell">
                  {calcularPontuacao(paciente.habilidadeNotas, 0, 30)}%
                </td>
              ))}
            </tr>

            <tr>
              <td className="report-cell">Relatório</td>
              {pacientes.map((paciente, pacienteIndex) => (
                <td key={pacienteIndex} className="report-cell">
                  <button
                    onClick={() => gerarRelatorio(paciente, "admissao")}
                    className="report-button admissao"
                  >
                    Gerar Admissão
                  </button>
                  <button
                    onClick={() => gerarRelatorio(paciente, "alta")}
                    className="report-button alta"
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
