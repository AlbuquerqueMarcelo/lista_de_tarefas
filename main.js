const form = document.querySelector("#form-tarefa");
const input = document.querySelector("#nova-tarefa");
const listaPendentes = document.querySelector("#lista-pendentes");
const listaConcluidas = document.querySelector("#lista-concluidas");
const filtroBtns = document.querySelectorAll(".filtros button");

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let filtroAtual = "todas";

function salvar() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  mostrar();
}

function mostrar() {
  listaPendentes.innerHTML = "";
  listaConcluidas.innerHTML = "";

  const pendentes = tarefas.filter(t => !t.check);
  const concluidas = tarefas.filter(t => t.check);

  const tarefasFiltradas = {
    todas: tarefas,
    pendentes,
    concluidas,
  }[filtroAtual];

  tarefasFiltradas.forEach((tarefa) => {
    const li = document.createElement("li");

    const linha = document.createElement("div");
    linha.classList.add("linha");

    // Span ou input com o texto da tarefa (inicialmente span)
    const texto = document.createElement("span");
    texto.textContent = tarefa.nome;

    // Checkbox para marcar concluída
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = tarefa.check;

    // Div das ações (botões)
    const acoes = document.createElement("div");
    acoes.classList.add("acoes");

    // Botão subir
    const up = document.createElement("button");
    up.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    up.title = "Subir tarefa";
    up.onclick = () => {
      const idx = tarefas.indexOf(tarefa);
      if (idx > 0) {
        [tarefas[idx], tarefas[idx - 1]] = [tarefas[idx - 1], tarefas[idx]];
        salvar();
      }
    };

    // Botão descer
    const down = document.createElement("button");
    down.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
    down.title = "Descer tarefa";
    down.onclick = () => {
      const idx = tarefas.indexOf(tarefa);
      if (idx < tarefas.length - 1) {
        [tarefas[idx], tarefas[idx + 1]] = [tarefas[idx + 1], tarefas[idx]];
        salvar();
      }
    };

    // Botão editar
    const editar = document.createElement("button");
    editar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editar.title = "Editar tarefa";
    editar.onclick = () => {
      // Trocar o span pelo input para edição
      const inputEdit = document.createElement("input");
      inputEdit.type = "text";
      inputEdit.value = tarefa.nome;
      inputEdit.style.flex = "1";
      inputEdit.style.fontSize = "inherit";
      inputEdit.style.padding = "2px 6px";
      inputEdit.style.borderRadius = "4px";
      inputEdit.style.border = "1px solid #ccc";

      // Substituir o texto pelo input
      linha.replaceChild(inputEdit, texto);
      inputEdit.focus();

      // Função para salvar a edição
      function salvarEdicao() {
        const novoTexto = inputEdit.value.trim();
        if (novoTexto === "") {
          alert("O texto da tarefa não pode ficar vazio!");
          inputEdit.focus();
          return;
        }
        tarefa.nome = novoTexto;
        salvar();
      }

      // Salvar ao pressionar Enter
      inputEdit.onkeydown = (e) => {
        if (e.key === "Enter") {
          salvarEdicao();
        } else if (e.key === "Escape") {
          // Cancelar edição com ESC e voltar ao texto original
          linha.replaceChild(texto, inputEdit);
        }
      };

      // Salvar ao perder foco (click fora)
      inputEdit.onblur = () => {
        salvarEdicao();
      };
    };

    // Botão excluir
    const del = document.createElement("button");
    del.innerHTML = '<i class="fa-solid fa-trash"></i>';
    del.title = "Excluir tarefa";
    del.onclick = () => {
      if (confirm("Tem certeza que quer excluir?")) {
        const idx = tarefas.indexOf(tarefa);
        tarefas.splice(idx, 1);
        salvar();
      }
    };

    checkbox.onchange = () => {
      tarefa.check = checkbox.checked;
      salvar();
    };

    linha.append(texto, checkbox);
    acoes.append(up, down, editar, del);

    li.append(linha, acoes);

    const dataSpan = document.createElement("small");
    dataSpan.textContent = formatarData(tarefa.data);
    li.appendChild(dataSpan);

    if (tarefa.check) {
      listaConcluidas.appendChild(li);
    } else {
      listaPendentes.appendChild(li);
    }
  });
}

function formatarData(isoString) {
  const data = new Date(isoString);
  if (isNaN(data)) return "";
  const dia = data.getDate().toString().padStart(2, "0");
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const ano = data.getFullYear();
  const hora = data.getHours().toString().padStart(2, "0");
  const min = data.getMinutes().toString().padStart(2, "0");
  return `${dia}/${mes}/${ano} ${hora}:${min}`;
}

form.onsubmit = (e) => {
  e.preventDefault();
  const texto = input.value.trim();
  if (texto === "") {
    alert("Por favor, digite uma tarefa.");
    return;
  }
  tarefas.push({
    nome: texto,
    check: false,
    data: new Date().toISOString(),
  });
  input.value = "";
  salvar();
};

filtroBtns.forEach((btn) => {
  btn.onclick = () => {
    filtroAtual = btn.getAttribute("data-filtro");
    mostrar();
  };
});

mostrar();
