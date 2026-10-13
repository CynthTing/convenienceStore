const products = [
  {name:"統一鮮乳 936ml", category:"乳品 · A-01", emoji:"🥛", stock:8, demand:34, safety:12, qty:30, confidence:"高", status:"需補貨", cost:2100},
  {name:"茶裏王日式綠茶", category:"飲料 · C-03", emoji:"🥤", stock:12, demand:40, safety:10, qty:36, confidence:"高", status:"建議補貨", cost:2160},
  {name:"御飯糰 鮪魚玉米", category:"鮮食 · D-05", emoji:"🍙", stock:6, demand:28, safety:8, qty:28, confidence:"中", status:"需補貨", cost:1680},
  {name:"CITY CAFE 熱美式", category:"咖啡 · E-02", emoji:"☕", stock:19, demand:25, safety:12, qty:18, confidence:"高", status:"建議補貨", cost:900},
  {name:"滿漢大餐牛肉麵", category:"泡麵 · B-12", emoji:"🍜", stock:22, demand:18, safety:8, qty:0, confidence:"高", status:"庫存充足", cost:0},
  {name:"義美巧克力小泡芙", category:"零食 · F-08", emoji:"🍪", stock:10, demand:31, safety:10, qty:31, confidence:"中", status:"需補貨", cost:1620},
  {name:"光泉茉莉茶園", category:"飲料 · C-08", emoji:"🧃", stock:15, demand:26, safety:10, qty:21, confidence:"高", status:"建議補貨", cost:1260}
];

const views = {dashboard:"dashboardView", orders:"ordersView", model:"modelView", settings:"settingsView"};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function showView(name) {
  $$(".view").forEach(view => view.classList.remove("active-view"));
  $(`#${views[name]}`).classList.add("active-view");
  $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === name));
  const labels = {dashboard: "門市管理 / 補貨總覽", orders: "補貨管理 / 補貨建議", model: "系統設定 / 預測與模型", settings: "系統設定 / 門市設定"};
  $(".breadcrumb").textContent = labels[name];
  window.scrollTo({top:0, behavior:"smooth"});
}

function renderOrders() {
  const container = $("#orderRows");
  container.innerHTML = products.map((product, index) => `
    <div class="order-row" data-name="${product.name}">
      <span><input type="checkbox" class="product-check" data-index="${index}" ${product.qty ? "checked" : ""} /></span>
      <span class="order-product"><i>${product.emoji}</i><b>${product.name}<small>${product.category}</small></b></span>
      <span>${product.stock} <small>件</small></span>
      <span>${product.demand} <small>件</small></span>
      <span>${product.safety} <small>件</small></span>
      <span><input class="qty-input" data-index="${index}" type="number" min="0" value="${product.qty}" /></span>
      <span class="confidence">${product.confidence}</span>
      <span class="tag ${product.status === "需補貨" ? "red-tag" : product.status === "庫存充足" ? "green-tag" : "orange-tag"}">${product.status}</span>
    </div>`).join("");
  $$(".product-check").forEach(box => box.addEventListener("change", updateSummary));
  $$(".qty-input").forEach(input => input.addEventListener("input", () => {
    products[Number(input.dataset.index)].qty = Math.max(0, Number(input.value) || 0);
    updateSummary();
  }));
  updateSummary();
}

function updateSummary() {
  const selected = $$(".product-check").filter(box => box.checked);
  const total = selected.reduce((sum, box) => {
    const index = Number(box.dataset.index);
    const qty = Number($(`.qty-input[data-index="${index}"]`).value) || 0;
    return sum + (products[index].cost * (qty / Math.max(products[index].qty, 1)));
  }, 0);
  $("#selectedCount").innerHTML = `${selected.length * 3} <small>項商品</small>`;
  $("#totalCost").textContent = `$${Math.round(total).toLocaleString()}`;
  $("#modalCount").textContent = `${selected.length * 3} 項商品`;
  $("#modalCost").textContent = `$${Math.round(total).toLocaleString()}`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

$$(".nav-item").forEach(item => item.addEventListener("click", () => showView(item.dataset.view)));
$("#reviewButton").addEventListener("click", () => showView("orders"));
$("#allOrdersButton").addEventListener("click", () => showView("orders"));
$("#tutorialButton").addEventListener("click", () => showToast("教學導覽：先檢視建議 → 調整數量 → 確認送出。"));
$("#selectAll").addEventListener("change", event => {
  $$(".product-check").forEach(box => { box.checked = event.target.checked; });
  updateSummary();
});
$("#searchInput").addEventListener("input", event => {
  const keyword = event.target.value.trim();
  $$(".order-row[data-name]").forEach(row => { row.style.display = row.dataset.name.includes(keyword) ? "grid" : "none"; });
});
$("#submitOrderButton").addEventListener("click", () => $("#modal").classList.add("show"));
["closeModal", "cancelModal"].forEach(id => $(`#${id}`).addEventListener("click", () => $("#modal").classList.remove("show")));
$("#confirmOrder").addEventListener("click", () => {
  $("#modal").classList.remove("show");
  showToast("補貨單已送出，單號 RE-20261013-0088");
  setTimeout(() => showView("dashboard"), 1000);
});
$("#saveSettings").addEventListener("click", () => showToast("門市設定已儲存"));
$("#autoConfirm").addEventListener("change", event => {
  event.target.closest(".setting-row").querySelector("h3").textContent = event.target.checked ? "自動確認補貨單（已開啟）" : "自動確認補貨單";
});
renderOrders();
