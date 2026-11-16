const STORAGE_KEY = "cadastroClientes";

const form = document.getElementById("clienteForm");
const lista = document.getElementById("listaClientes");
const busca = document.getElementById("busca");
const totalClientes = document.getElementById("totalClientes");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

const campos = {
  id: document.getElementById("clienteId"),
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  telefone: document.getElementById("telefone"),
  cpf: document.getElementById("cpf"),
  nascimento: document.getElementById("nascimento"),
  endereco: document.getElementById("endereco")
};

let clientes = carregarClientes();

function carregarClientes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function salvarClientes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

function escaparHTML(valor = "") {
  return String(valor).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[caractere]);
}

function renderizarClientes() {
  const termo = busca.value.trim().toLocaleLowerCase("pt-BR");

  const filtrados = clientes.filter(cliente =>
    [cliente.nome, cliente.email, cliente.telefone, cliente.cpf]
      .some(valor => (valor || "").toLocaleLowerCase("pt-BR").includes(termo))
  );

  totalClientes.textContent = clientes.length;

  if (filtrados.length === 0) {
    lista.innerHTML = `<tr><td colspan="5" class="empty">${
      clientes.length ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."
    }</td></tr>`;
    return;
  }

  lista.innerHTML = filtrados.map(cliente => `
    <tr>
      <td>${escaparHTML(cliente.nome)}</td>
      <td>${escaparHTML(cliente.email)}</td>
      <td>${escaparHTML(cliente.telefone)}</td>
      <td>${escaparHTML(cliente.cpf || "—")}</td>
      <td>
        <div class="actions">
          <button class="action-button edit" data-action="editar" data-id="${escaparHTML(cliente.id)}">Editar</button>
          <button class="action-button delete" data-action="excluir" data-id="${escaparHTML(cliente.id)}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function limparFormulario() {
  form.reset();
  campos.id.value = "";
  formTitle.textContent = "Novo cliente";
  submitButton.textContent = "Cadastrar cliente";
  cancelButton.hidden = true;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const cliente = {
    id: campos.id.value || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    nome: campos.nome.value.trim(),
    email: campos.email.value.trim(),
    telefone: campos.telefone.value.trim(),
    cpf: campos.cpf.value.trim(),
    nascimento: campos.nascimento.value,
    endereco: campos.endereco.value.trim()
  };

  if (!cliente.nome || !cliente.email || !cliente.telefone) {
    alert("Preencha nome, e-mail e telefone.");
    return;
  }

  const emailDuplicado = clientes.some(item =>
    item.email.toLowerCase() === cliente.email.toLowerCase() && item.id !== cliente.id
  );

  if (emailDuplicado) {
    alert("Já existe um cliente cadastrado com esse e-mail.");
    campos.email.focus();
    return;
  }

  const indice = clientes.findIndex(item => item.id === cliente.id);

  if (indice >= 0) {
    clientes[indice] = cliente;
  } else {
    clientes.push(cliente);
  }

  salvarClientes();
  renderizarClientes();
  limparFormulario();
});

lista.addEventListener("click", event => {
  const botao = event.target.closest("button[data-action]");
  if (!botao) return;

  const cliente = clientes.find(item => item.id === botao.dataset.id);
  if (!cliente) return;

  if (botao.dataset.action === "editar") {
    campos.id.value = cliente.id;
    campos.nome.value = cliente.nome;
    campos.email.value = cliente.email;
    campos.telefone.value = cliente.telefone;
    campos.cpf.value = cliente.cpf || "";
    campos.nascimento.value = cliente.nascimento || "";
    campos.endereco.value = cliente.endereco || "";

    formTitle.textContent = "Editar cliente";
    submitButton.textContent = "Salvar alterações";
    cancelButton.hidden = false;
    campos.nome.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (botao.dataset.action === "excluir") {
    const confirmar = confirm(`Deseja realmente excluir o cliente ${cliente.nome}?`);
    if (!confirmar) return;

    clientes = clientes.filter(item => item.id !== cliente.id);
    salvarClientes();
    renderizarClientes();

    if (campos.id.value === cliente.id) limparFormulario();
  }
});

busca.addEventListener("input", renderizarClientes);
cancelButton.addEventListener("click", limparFormulario);

renderizarClientes();
