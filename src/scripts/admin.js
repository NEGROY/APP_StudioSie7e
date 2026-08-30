import { CircleCheck, CircleX, createIcons, Eye, Pencil, Trash2 } from "lucide";
import Swal from "sweetalert2";

const ICONS = { CircleCheck, CircleX, Eye, Pencil, Trash2 };
const PAGE_SIZE = 5;
const ALERT_THEME = {
  background: "#111111",
  color: "#fbfbfb",
  confirmButtonColor: "#3368a0",
  cancelButtonColor: "#5b6470"
};

function defaultWorkDateTime() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T10:00`;
}

const TABLES = [
  {
    key: "servicios",
    label: "Servicios",
    paginated: true,
    statusIcons: true,
    fields: [
      { name: "nombre", label: "Nombre", required: true },
      { name: "precio", label: "Precio (Q)", type: "number", step: "0.01", required: true, format: "currency" },
      { name: "descripcion", label: "Descripción", type: "textarea", wide: true },
      { name: "estado", label: "Estado", type: "select", options: ["activo", "inactivo"] }
    ]
  },
  {
    key: "caracteristicas",
    label: "Características",
    paginated: true,
    statusIcons: true,
    fields: [
      { name: "nombre", label: "Nombre", required: true },
      { name: "precio", label: "Precio (Q)", type: "number", step: "0.01", format: "currency" },
      { name: "descripcion", label: "Descripción", type: "textarea", wide: true },
      { name: "estado", label: "Estado", type: "select", options: ["activo", "inactivo"] }
    ]
  },
  {
    key: "asignacion",
    label: "Asignación",
    paginated: true,
    statusIcons: true,
    fields: [
      { name: "servicio_id", label: "Servicio", type: "relation", source: "servicios", required: true, searchable: true },
      { name: "caracteristica_id", label: "Característica", type: "relation", source: "caracteristicas", required: true, searchable: true },
      { name: "estado", label: "Estado", type: "select", options: ["activo", "inactivo"] }
    ],
    listColumns: [
      { name: "id", label: "ID" },
      { name: "servicio_nombre", label: "Servicio" },
      { name: "caracteristica_nombre", label: "Característica" },
      { name: "estado", label: "Estado" }
    ]
  },
  {
    key: "promociones",
    label: "Promociones",
    statusIcons: true,
    imagePreview: true,
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea", wide: true },
      { name: "fecha_inicio", label: "Inicio", type: "date", required: true },
      { name: "fecha_fin", label: "Fin", type: "date", required: true },
      { name: "imagen_url", label: "Imagen URL" },
      { name: "estado", label: "Estado", type: "select", options: ["activo", "inactivo"] }
    ]
  },
  {
    key: "estilos",
    label: "Festividades",
    statusIcons: true,
    fields: [
      { name: "nombre", label: "Nombre", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea", wide: true },
      { name: "estado", label: "Estado", type: "select", options: ["activo", "inactivo"] }
    ]
  },
  {
    key: "anuncios",
    label: "Anuncios",
    imagePreview: true,
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea", wide: true },
      { name: "estilo_id", label: "Festividad", type: "relation", source: "estilos", required: true },
      { name: "fecha_inicio", label: "Inicio", type: "date", required: true },
      { name: "fecha_fin", label: "Fin", type: "date", required: true },
      { name: "imagen_url", label: "Imagen URL" },
      { name: "promocion_id", label: "Promoción opcional", type: "relation", source: "promociones" },
      { name: "estado", label: "Estado", type: "select", options: ["activo", "inactivo"] }
    ]
  },
  {
    key: "agentes_modelos",
    apiKey: "agentes-modelos",
    label: "Modelos",
    paginated: true,
    statusIcons: true,
    photoActions: true,
    fields: [
      { name: "nombre", label: "Nombre", required: true },
      { name: "dpi", label: "DPI" },
      { name: "telefono", label: "Teléfono" },
      { name: "ubicacion", label: "Ubicación" },
      { name: "correo", label: "Correo", type: "email" },
      { name: "foto_url", label: "Foto URL", wide: true, hiddenInList: true },
      { name: "fecha_inicio", label: "Fecha inicio", type: "date" },
      { name: "salario", label: "Salario", type: "number", step: "0.01" },
      { name: "puesto", label: "Puesto" },
      { name: "comentarios", label: "Comentarios", type: "textarea", wide: true },
      { name: "estado", label: "Estado", type: "select", options: ["activo", "inactivo"] }
    ]
  },
  {
    key: "trabajos",
    label: "Trabajos",
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea", wide: true },
      { name: "cliente", label: "Cliente" },
      { name: "fecha_trabajo", label: "Fecha trabajo", type: "datetime-local", defaultValue: defaultWorkDateTime },
      { name: "tipo_evento", label: "Tipo evento" },
      { name: "estado", label: "Estado", type: "select", options: ["agendado", "en_proceso", "finalizado"] },
      { name: "agente_id", label: "Modelo/agente", type: "relation", source: "agentes-modelos", required: true },
      { name: "comentarios", label: "Comentarios", type: "textarea", wide: true }
    ]
  }
];

const nav = document.querySelector("#adminNav");
const form = document.querySelector("#adminForm");
const title = document.querySelector("#adminTitle");
const head = document.querySelector("#adminTableHead");
const body = document.querySelector("#adminTableBody");
const message = document.querySelector("#adminMessage");
const userLabel = document.querySelector("#adminUser");
const logoutButton = document.querySelector("#logoutButton");
const listTools = document.querySelector("#adminListTools");
const assignmentFilters = document.querySelector("#assignmentFilters");
const assignmentSearch = document.querySelector("#assignmentSearch");
const assignmentOrder = document.querySelector("#assignmentOrder");
const previousPage = document.querySelector("#previousPage");
const nextPage = document.querySelector("#nextPage");
const pageInfo = document.querySelector("#pageInfo");

let currentTable = TABLES[0];
let editingId = null;
let currentPage = 1;
let totalPages = 1;
let searchTerm = "";
let assignmentOrderValue = "servicio";
let searchTimer;
const relationCache = new Map();

const setMessage = (text) => {
  message.textContent = text;
};

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>'"]/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]
  );

function renderIcons() {
  createIcons({
    icons: ICONS,
    attrs: { width: "17", height: "17", "stroke-width": "2", "aria-hidden": "true" }
  });
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Solicitud no completada.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function showError(error) {
  const duplicateAssignment = currentTable.key === "asignacion" && error.status === 409;
  await Swal.fire({
    ...ALERT_THEME,
    icon: "error",
    title: duplicateAssignment ? "Asignación duplicada" : "No se pudo completar",
    text: error.message
  });
}

async function showSuccess(titleText) {
  await Swal.fire({
    ...ALERT_THEME,
    toast: true,
    position: "top-end",
    icon: "success",
    title: titleText,
    showConfirmButton: false,
    timer: 1700,
    timerProgressBar: true
  });
}

async function guard() {
  try {
    const user = await request("/api/auth/me");
    if (user.rol !== "admin") {
      window.location.href = "/login";
      return false;
    }
    userLabel.textContent = `${user.nombre} · ${user.rol}`;
    return true;
  } catch {
    window.location.href = "/login";
    return false;
  }
}

function resourcePath(table = currentTable) {
  return table.apiKey || table.key;
}

async function getRelationOptions(source) {
  if (!relationCache.has(source)) {
    const rows = await request(`/api/admin/${source}?estado=activo`);
    relationCache.set(source, Array.isArray(rows) ? rows : rows.data || []);
  }
  return relationCache.get(source);
}

async function prepareRelations(table) {
  const sources = [...new Set(table.fields.filter((field) => field.type === "relation").map((field) => field.source))];
  await Promise.all(sources.map(getRelationOptions));
}

function renderNav() {
  nav.innerHTML = TABLES.map(
    (table) => `<button type="button" data-table="${table.key}" class="${table.key === currentTable.key ? "is-active" : ""}">${escapeHtml(table.label)}</button>`
  ).join("");

  nav.querySelectorAll("[data-table]").forEach((button) => {
    button.addEventListener("click", () => {
      const table = TABLES.find((item) => item.key === button.dataset.table);
      selectTable(table);
    });
  });
}

function fieldAttributes(field) {
  return [
    `name="${field.name}"`,
    field.required ? "required" : "",
    field.step ? `step="${field.step}"` : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function fieldControl(field, value = "") {
  const attrs = fieldAttributes(field);

  if (field.type === "textarea") {
    return `<textarea ${attrs}>${escapeHtml(value)}</textarea>`;
  }

  if (field.type === "relation") {
    const options = relationCache.get(field.source) || [];
    const search = field.searchable
      ? `<input class="relation-search" type="search" data-filter-select="${field.name}" placeholder="Buscar ${escapeHtml(field.label.toLowerCase())}" autocomplete="off" />`
      : "";
    return `${search}<select ${attrs}>
      <option value="">${field.required ? "Seleccione una opción" : "Sin selección"}</option>
      ${options
        .map(
          (option) =>
            `<option value="${option.id}" ${String(option.id) === String(value) ? "selected" : ""}>${escapeHtml(option.nombre || option.titulo)}</option>`
        )
        .join("")}
    </select>`;
  }

  if (field.type === "select") {
    return `<select ${attrs}>${field.options
      .map((option) => `<option value="${option}" ${String(option) === String(value) ? "selected" : ""}>${escapeHtml(option)}</option>`)
      .join("")}</select>`;
  }

  return `<input type="${field.type || "text"}" value="${escapeHtml(value)}" ${attrs} />`;
}

function normalizeFieldValue(value, field) {
  if ((value === null || value === undefined) && !editingId && field.defaultValue) {
    return field.defaultValue();
  }
  if (value === null || value === undefined) return "";
  if (field.type === "date") return String(value).slice(0, 10);
  if (field.type === "datetime-local") return String(value).slice(0, 16);
  return value;
}

async function renderForm(values = {}) {
  const table = currentTable;
  await prepareRelations(table);
  if (table !== currentTable) return;

  title.textContent = table.label;
  form.innerHTML = table.fields
    .map(
      (field) => `
        <label class="${field.wide ? "field-wide" : ""}">
          ${escapeHtml(field.label)}
          ${fieldControl(field, normalizeFieldValue(values[field.name], field))}
        </label>
      `
    )
    .join("");

  form.insertAdjacentHTML(
    "beforeend",
    `<div class="form-actions">
      <button class="button button--primary" type="submit">${editingId ? "Actualizar" : "Crear"}</button>
      <button class="button button--ghost" type="button" id="cancelEdit">Limpiar</button>
    </div>`
  );

  form.querySelector("#cancelEdit").addEventListener("click", () => {
    editingId = null;
    renderForm();
  });

  form.querySelectorAll("[data-filter-select]").forEach((input) => {
    input.addEventListener("input", () => {
      const select = form.elements[input.dataset.filterSelect];
      const filter = input.value.trim().toLocaleLowerCase("es");
      [...select.options].forEach((option, index) => {
        if (index === 0) return;
        option.hidden = Boolean(filter) && !option.textContent.toLocaleLowerCase("es").includes(filter);
      });
    });
  });
}

function serializeForm() {
  const data = Object.fromEntries(new FormData(form));
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === "" ? null : value]));
}

function listColumns(table) {
  if (table.listColumns) return table.listColumns;
  return [
    { name: "id", label: "ID" },
    ...table.fields.filter((field) => !field.hiddenInList).map((field) => ({ ...field }))
  ];
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return escapeHtml(value);
  return `Q ${new Intl.NumberFormat("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
}

function formatCell(value, column, table, row) {
  if (column.name === "imagen_url" && table.imagePreview) {
    const hasImage = Boolean(value);
    return `<button class="table-icon-button" type="button" data-preview-image="${row.id}" aria-label="${hasImage ? "Ver imagen" : "Sin imagen"}" title="${hasImage ? "Ver imagen" : "Sin imagen"}" ${hasImage ? "" : "disabled"}><i data-lucide="eye"></i></button>`;
  }
  if (value === null || value === undefined) return "";
  if (column.name === "estado" && table.statusIcons) {
    const active = value === "activo";
    return `<span class="status-indicator"><i data-lucide="${active ? "circle-check" : "circle-x"}"></i>${escapeHtml(value)}</span>`;
  }
  if (column.format === "currency") return formatCurrency(value);
  if (column.type === "date") return escapeHtml(String(value).slice(0, 10));
  if (column.type === "relation") {
    const option = (relationCache.get(column.source) || []).find((item) => String(item.id) === String(value));
    if (option) return escapeHtml(option.nombre || option.titulo);
  }
  if (typeof value === "object") return escapeHtml(JSON.stringify(value));
  return escapeHtml(value);
}

function actionButtons(row, table) {
  const photoButton = table.photoActions
    ? `<button class="table-icon-button" type="button" data-photo="${row.id}" aria-label="${row.foto_url ? "Ver foto" : "Sin foto"}" title="${row.foto_url ? "Ver foto" : "Sin foto"}" ${row.foto_url ? "" : "disabled"}><i data-lucide="eye"></i></button>`
    : "";

  return `${photoButton}
    <button class="table-icon-button" type="button" data-edit="${row.id}" aria-label="Editar" title="Editar"><i data-lucide="pencil"></i></button>
    <button class="table-icon-button" type="button" data-delete="${row.id}" aria-label="Eliminar" title="Eliminar"><i data-lucide="trash-2"></i></button>`;
}

function updateListTools(pagination) {
  const usesPagination = currentTable.paginated;
  const isAssignment = currentTable.key === "asignacion";
  listTools.hidden = !usesPagination;
  assignmentFilters.hidden = !isAssignment;
  if (!usesPagination) return;

  totalPages = pagination.totalPages;
  currentPage = pagination.page;
  pageInfo.textContent = `Página ${currentPage} de ${totalPages} · ${pagination.total} registro(s)`;
  previousPage.disabled = currentPage <= 1;
  nextPage.disabled = currentPage >= totalPages;
}

async function loadRows() {
  const table = currentTable;
  setMessage("Cargando registros...");
  try {
    let path = `/api/admin/${resourcePath(table)}`;
    if (table.paginated) {
      const params = new URLSearchParams({ page: currentPage, limit: PAGE_SIZE });
      if (table.key === "asignacion") {
        if (searchTerm) params.set("q", searchTerm);
        params.set("orden", assignmentOrderValue);
      }
      path += `?${params}`;
    }

    const payload = await request(path);
    if (table !== currentTable) return;
    if (table.paginated && currentPage > payload.pagination.totalPages) {
      currentPage = payload.pagination.totalPages;
      await loadRows();
      return;
    }

    const rows = Array.isArray(payload) ? payload : payload.data || [];
    const columns = listColumns(table);

    head.innerHTML = `<tr>${columns.map((column) => `<th>${escapeHtml(column.label || column.name)}</th>`).join("")}<th>Acciones</th></tr>`;
    body.innerHTML = rows
      .map(
        (row) => `
          <tr class="${table.statusIcons && row.estado === "inactivo" ? "is-inactive" : ""}">
            ${columns.map((column) => `<td>${formatCell(row[column.name], column, table, row)}</td>`).join("")}
            <td><div class="table-actions">${actionButtons(row, table)}</div></td>
          </tr>
        `
      )
      .join("");
    renderIcons();

    body.querySelectorAll("[data-preview-image]").forEach((button) => {
      button.addEventListener("click", async () => {
        const row = rows.find((item) => String(item.id) === button.dataset.previewImage);
        await Swal.fire({
          ...ALERT_THEME,
          title: row.titulo,
          imageUrl: row.imagen_url,
          imageAlt: `Imagen de ${row.titulo}`,
          imageWidth: 640,
          showCloseButton: true,
          showConfirmButton: false
        });
      });
    });

    body.querySelectorAll("[data-photo]").forEach((button) => {
      button.addEventListener("click", async () => {
        const row = rows.find((item) => String(item.id) === button.dataset.photo);
        await Swal.fire({
          ...ALERT_THEME,
          title: row.nombre,
          imageUrl: row.foto_url,
          imageAlt: `Fotografía de ${row.nombre}`,
          imageWidth: 520,
          showCloseButton: true,
          showConfirmButton: false
        });
      });
    });

    body.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", async () => {
        const row = rows.find((item) => String(item.id) === button.dataset.edit);
        editingId = row.id;
        await renderForm(row);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    body.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", async () => {
        const confirmation = await Swal.fire({
          ...ALERT_THEME,
          icon: "warning",
          title: "¿Eliminar registro?",
          text: "Esta acción no se puede deshacer.",
          showCancelButton: true,
          confirmButtonText: "Eliminar",
          cancelButtonText: "Cancelar",
          focusCancel: true
        });
        if (!confirmation.isConfirmed) return;

        try {
          await request(`/api/admin/${resourcePath(table)}/${button.dataset.delete}`, { method: "DELETE" });
          relationCache.clear();
          await renderForm();
          await loadRows();
          await showSuccess("Registro eliminado");
        } catch (error) {
          setMessage(error.message);
          await showError(error);
        }
      });
    });

    if (table.paginated) {
      updateListTools(payload.pagination);
      setMessage(payload.pagination.total ? `${payload.pagination.total} registro(s).` : "No hay registros para mostrar.");
    } else {
      updateListTools({});
      setMessage(rows.length ? `${rows.length} registro(s).` : "No hay registros todavía.");
    }
  } catch (error) {
    setMessage(error.message);
    await showError(error);
  }
}

async function selectTable(table) {
  currentTable = table;
  editingId = null;
  currentPage = 1;
  searchTerm = "";
  assignmentOrderValue = "servicio";
  assignmentSearch.value = "";
  assignmentOrder.value = assignmentOrderValue;
  renderNav();
  try {
    await renderForm();
    await loadRows();
  } catch (error) {
    setMessage(error.message);
    await showError(error);
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const method = editingId ? "PUT" : "POST";
    const path = editingId
      ? `/api/admin/${resourcePath()}/${editingId}`
      : `/api/admin/${resourcePath()}`;
    await request(path, { method, body: JSON.stringify(serializeForm()) });
    const successText = editingId ? "Registro actualizado" : "Registro creado";
    editingId = null;
    relationCache.clear();
    await renderForm();
    await loadRows();
    await showSuccess(successText);
  } catch (error) {
    setMessage(error.message);
    await showError(error);
  }
});

assignmentSearch?.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchTerm = assignmentSearch.value.trim();
    currentPage = 1;
    loadRows();
  }, 250);
});

assignmentOrder?.addEventListener("change", () => {
  assignmentOrderValue = assignmentOrder.value;
  currentPage = 1;
  loadRows();
});

previousPage?.addEventListener("click", () => {
  if (currentPage <= 1) return;
  currentPage -= 1;
  loadRows();
});

nextPage?.addEventListener("click", () => {
  if (currentPage >= totalPages) return;
  currentPage += 1;
  loadRows();
});

logoutButton?.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
});

if (await guard()) {
  renderNav();
  await renderForm();
  await loadRows();
}
