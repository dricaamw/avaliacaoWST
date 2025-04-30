Sistema de Avaliação de Pacientes - WST 5.4.2

Este é um site feito para facilitar a avaliação de pacientes em grupo, usando um formulário de habilidades. Com ele, é possível preencher os dados de até 5 pacientes ao mesmo tempo e gerar relatórios automáticos de admissão ou alta em formato .docx.

O que o sistema faz
	•	Permite preencher o nome, prontuário e notas dos pacientes.
	•	Calcula automaticamente a pontuação em três níveis: domiciliar, comunitário e avançado.
	•	Gera relatórios prontos para salvar no prontuário, com base em modelos do Word.
	•	Salva os dados no navegador para não perder nada ao recarregar a página.
	•	Limpa os dados automaticamente depois de gerar o relatório.

Como usar
	1.	Preencha o nome e o prontuário de cada paciente.
	2.	Escolha as notas de cada habilidade.
	3.	Clique em “Gerar Admissão” ou “Gerar Alta”.
	4.	O relatório será baixado automaticamente.
	5.	Depois de gerar, os dados daquele paciente são apagados da tela.

Tecnologias usadas
	•	React (estrutura do site)
	•	Docxtemplater (gera o documento do Word)
	•	FileSaver (faz o download do relatório)
	•	localStorage (salva os dados no navegador)

Requisitos
	•	Modelos do Word (modelo_admissao.docx e modelo_alta.docx) com os campos certos para preencher automaticamente.