console.log('Happy developing ✨')

/*

1. Introduktion
Vi ska bygga en kassafunktion till IT Högskolans påhittade Kafé som heter Kodstugan.
Tanken med den här övningen är att vi ska samla ihop och använda de kunskaper inom JavaScript
som vi gått igenom så här långt i kursen. Nu får vi möjlighet att börja fundera ut egna lösningar
baserat på givna kriterier. Ganska likt hur ett verkligt webbprojekt kan vara formulerat.
I övningen får ni använda teoridelarna från kapitel 1 – 12. Om ni vill får ni gärna använda
ytterligare funktionalitet från exempelvis MDN Web Docs, men detta är helt valfritt

 */

/* Make a table in html and let it reflect changes upon purchases and other mishaps */
/* Artikel Pris SEK I lager Kategori - table header */
//   Göran   2        Alltid   Politiker
//   Kaffe   25       JA       Dryck
//   Te      15       JA       Dryck
//   Läsk    29       JA       Dryck
//   Kanelbulle 25    JA       Sötsak
//   Kanelgiffel 5    JA       Sötsak
//   Lösgodis 1 hg  15  NEJ      Godis
//   Fralla med ost  35  Ja     Bröd
//   Fralla med ost och skinka 40  NEJ   Bröd    HARAM BROR

/* Fixa någon nice sort och dynamisk position så att användare kan filtrera and whatnot */
// T.ex. billigast först, godast först, viktigast först + standard man trycker på header så sorterar den på kategori

let LoggedInUser = "";

const articleArray = [
  {
    "id":"Go",
    "name":"Göran",
    "price": 2,
    "quantity": 0,
    "category":"Politiker"
  },
  {
    "id":"Ka",
    "name":"Kaffe",
    "price": 25,
    "quantity": 10,
    "category":"Dryck"
  },
  {
    "id":"Te",
    "name":"Te",
    "price": 15,
    "quantity": 8,
    "category":"Dryck"
  },
  {
    "id":"La",
    "name":"Läsk",
    "price": 29,
    "quantity": 20,
    "category":"Dryck"
  },
  {
    "id":"Kb",
    "name":"Kanelbulle",
    "price": 25,
    "quantity": 10,
    "category":"Sötsaker"
  },
  {
    "id":"Kg",
    "name":"Kanelgiffel",
    "price": 5,
    "quantity": 10,
    "category":"Sötsaker"
  },
  {
    "id":"Lg",
    "name":"Lösgodis 1 hg",
    "price": 15,
    "quantity": 0,
    "category":"Godis"
  },
  {
    "id":"Fro",
    "name":"Fralla med ost",
    "price": 35,
    "quantity": 6,
    "category":"Bröd"
  },
  {
    "id":"Fros",
    "name":"Fralla med ost och skinka",
    "price": 40,
    "quantity": 6,
    "category":"Bröd"
  }
];

// Assignments
// Skapa en metod som kan ta in antingen name eller id för att få ut pris på en artikel
// Handle error och quantity i lager
// Make sort methods that first click sorts A-Ö and toggle for reverse
// Make sort that does same for price first lowest-to-highest and toggle
// Simply put it should render sorted

class ArticleMenu {
  constructor(articles = []) {
    this.articles = articles;
    this._sortedCache = null;
    this._isDirty = true;

    // Keep track of sorting state for toggle
    this._currentSortKey = null;
    this._sortAscending = true;

    this.selectedArticleId = null; // Which selected
    this.editingArticleId = null; // Which to edit

    this.lastDeletedArticle = null;
  }

  getAll() {
    return this.articles;
  }

  getArticlesByCat(cat_name) {
    if (!this.articles.some(article => article.category === cat_name)) {
      throw new Error('Fel kategori - Kolla att du har skrivit rätt');
    }
    return this.articles.filter(article => {
      return article.category === cat_name;
    })
  }

  getArticlePrice(art_id = undefined) {
    if (art_id === undefined || art_id === null) {
      throw new Error('Bro, du måste skicka med artikelID eller namn');
    }
    const articleById = this.articles.find(article => article.id === art_id);  /* Kolla först om article.id finns och om inte return price by name */
    if (!articleById) {
      const articleByName = this.articles.find(article => article.name === art_id);  /* Kolla om article.name finns - Kasta error om ej */
      if (!articleByName) {
        throw new Error('Yo, du kanske har stavat fel på id eller namnet, kolla att du slagit in rätt');
      }
      return Number(articleByName.quantity) > 0 ? articleByName.price : console.error("Varan slut bror, ring Maxim"); // Ternary can't take actions such as throw
        // A clean approach would be an ordinary condition check to throw error - I like current for priv project
    }
    return Number(articleById.quantity) > 0 ? articleById.price : console.error("Varan slut bror, ring Maxim");
  }

  addEntry(art_id, name, price, quant, cat) {
    const newArticle = {
      id: art_id,
      name: name,
      price: Number(price),
      quantity: Number(quant),
      category: cat
    };
    this.articles.push(newArticle);
    this._isDirty = true;
    this.renderMenu("money-menu");
  }

  deleteEntry(art_id) {
    // Find index for art_id
    const index = this.articles.findIndex(article => article.id === art_id);

    // IF exists
    if (index !== -1) {
      this.lastDeletedArticle = {
        article: { ...this.articles[index] },
        index: index
      };
      this.articles.splice(index, 1);
      this._isDirty = true;
      this.selectedArticleId = null;
      this.renderMenu("money-menu");
    }
  }

  undoDelete() {
    if (!this.lastDeletedArticle) {
      return;
    }

    // Put article back in list
    this.articles.splice(this.lastDeletedArticle.index, 0, this.lastDeletedArticle.article);

    // Nullify so can't undo multiples
    this.lastDeletedArticle = null;

    this._isDirty = true;
    this.renderMenu("money-menu");
  }

  startEdit(art_id) {
    this.editingArticleId = art_id;
    this.renderMenu("money-menu");
  }
  cancelEdit() {
    this.editingArticleId = null;
    this.renderMenu("money-menu");
  }

  saveEdit(art_id, trElement) {
    const article = this.articles.find(a => a.id === art_id);
    if (!article) return;

    // Fetch values from select edit input fields
    const newId = trElement.querySelector('[data-field="id"]').value;
    const newName = trElement.querySelector('[data-field="name"]').value;
    const newPrice = trElement.querySelector('[data-field="price"]').value;
    const newQuant = trElement.querySelector('[data-field="quantity"]').value;
    const newCat = trElement.querySelector('[data-field="category"]').value;

    // Update the object
    article.id = newId;
    article.name = newName;
    article.price = Number(newPrice);
    article.quantity = Number(newQuant);
    article.category = newCat;

    // Refresh and mark as dirty
    this._isDirty = true;
    this.editingArticleId = null;
    this.selectedArticleId = null;
    this.renderMenu("money-menu");
  }

  sortBy(key) {
    // Toggle direction when key is same
    if (this._currentSortKey === key) {
      this._sortAscending = !this._sortAscending;
    }
    else {
      // Always start with ascension, A-Ö and lowest to highest
      this._currentSortKey = key;
      this._sortAscending = true;
    }

    this._isDirty = true; // Rebuild cache
    this.renderMenu("money-menu");
  }

  /*
  sortByName() {
    this.articles.sort((a, b) => {
      const nameA = a.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.name.toUpperCase(); // ignore upper and lowercase

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    })
  }
   */

  getSortedArticles() {

    if (!this._isDirty && this._sortedCache) {
      return this._sortedCache;
    }

    // If no SortKey for trigger, return this.articles
    if (!this._currentSortKey) {
      return this.articles;
    }

    // Keep track of direction based on the toggle
    const key = this._currentSortKey;
    const direction = this._sortAscending ? 1 : -1;

    // Construct the sorted cache array from this.articles
    this._sortedCache = [...this.articles].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Ensure sorting strings and strings - No mix bro
      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toUpperCase();
        valB = valB.toUpperCase();
        if (valA < valB) return -1 * direction;
        if (valA > valB) return 1 * direction;
        return 0;
      }

      // Handle numeric
      return (valA - valB) * direction;
    });

    // Clean and sorted
    this._isDirty = false;
    return this._sortedCache;
  }

  renderMenu(table_id = "money-menu") {
    const table = document.getElementById(table_id);
    const articlesToRender = this.getSortedArticles(); // Hämtar cache/sorterat

    let html = `
      <tr>
        <th data-sort="id" class="sortable">ID</th>
        <th data-sort="name" class="sortable">Artikel</th>
        <th data-sort="price" class="sortable">Pris SEK</th>
        <th data-sort="quantity" class="sortable">I lager</th>
        <th data-sort="category" class="sortable">Kategori</th>
        <th>Åtgärd <span id="regret" class="click-me">&#8634;</span></th>
      </tr>
    `;

    articlesToRender.forEach(article => {
      const isSelected = this.selectedArticleId === article.id;
      const isEditing = this.editingArticleId === article.id;

      if (isEditing) {
        // RENDERA INPUT-FÄLT NÄR RADEN REDIGERAS
        html += `
          <tr data-id="${article.id}" class="editing-row">
            <td><input type="text" class="edit-input" data-field="id" value="${article.id}"></td>
            <td><input type="text" class="edit-input" data-field="name" value="${article.name}"></td>
            <td><input type="number" class="edit-input" data-field="price" value="${article.price}"></td>
            <td><input type="number" class="edit-input" data-field="quantity" value="${article.quantity}"></td>
            <td><input type="text" class="edit-input" data-field="category" value="${article.category}"></td>
            <td>
              <div class="action-btn-group">
                <button class="save-btn" data-action="save" data-id="${article.id}">Spara</button>
                <button class="cancel-btn" data-action="cancel" data-id="${article.id}">Avbryt</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        // VANLIG RENDERING (ELLER MARKERAD MED ÄNDRA/TA BORT)
        html += `
          <tr data-id="${article.id}" class="${isSelected ? 'selected' : ''}">
            <td>${article.id}</td>
            <td>${article.name}</td>
            <td>${article.price}</td>
            <td>${article.quantity}</td>
            <td>${article.category}</td>
            <td>
              ${isSelected ? `
                <div class="action-btn-group">
                  <button class="edit-btn" data-action="edit" data-id="${article.id}">Ändra</button>
                  <button class="delete-btn" data-action="delete" data-id="${article.id}">Ta bort</button>
                </div>
              ` : `<span style="font-size: 0.7em; color: #666;">Klicka för val</span>`}
            </td>
          </tr>
        `;
      }
    });
    table.innerHTML = html;
  }
}

const moneymeMenu = new ArticleMenu(articleArray);

// Make a sortKey from the data-sort in the header tag upon click
document.addEventListener("click", (e) => {
  if (e.target.tagName === "TH" && e.target.dataset.sort) {
    const sortKey = e.target.dataset.sort; // e.g. "name", "price", "id" etc.

    moneymeMenu.sortBy(sortKey);
  }
});

/* Start of purchase function */
/*
Utskrift av kvitto i konsolen:
KVITTO
IT Högskolans Kafé Kodstugan
Kund: Gäst
Artiklar: Kaffe, Kanelbulle
Totalt: 50 SEK
Varav moms: 6 SEK (12%)
 */

function startPurchase(login = "Gäst") {
  const cart = [];
  login = getLoggedInUser();

  return {
    addArticles: function(...articles) {
      articles.forEach(article => {
        try {
          if (moneymeMenu.getArticlePrice(article)) {  /* Kolla om varan finns eller stavats rätt genom getArticlePrice */
            cart.push(article);
          }
        } catch (error) {
          console.log(`Kunde inte lägga till: ${error.message}`);
        }
      });
    },

    getSum: function() {
      const allPrices = cart.map(article => moneymeMenu.getArticlePrice(article));
      return allPrices.reduce((sum, price) => sum + price, 0);
    },

    getReceipt: function() {
      return `KVITTO
IT Högskolans Kafé Kodstugan
Kund: Gäst
Artiklar: ${cart.join(", ")}
Totalt: ${this.getSum()} SEK
Varav moms: ${this.getSum() * 0.12} SEK (12%)
Kassör: ${login}
      `
    }
  };
}

/* Start other functions */

const addBtn = document.getElementById("add-article-btn");

addBtn.addEventListener("click", () => {
  const id = document.getElementById("new-art-id").value;
  const name = document.getElementById("new-name").value;
  const price = document.getElementById("new-price").value;
  const quant = document.getElementById("new-quant").value;
  const cat = document.getElementById("new-cat").value;

  // Check if empty
  if (!id || !name || !price || !cat) {
    alert("Fyll i alla fält bror!");
    return;
  }

  moneymeMenu.addEntry(id, name, price, quant, cat);

  // Clear the input fields after adding
  document.getElementById("new-art-id").value = "";
  document.getElementById("new-name").value = "";
  document.getElementById("new-price").value = "";
  document.getElementById("new-quant").value = "";
  document.getElementById("new-cat").value = "";
});

moneymeMenu.renderMenu();

// counter W3Schools

let countDownDate = new Date("Jan 5, 2030 15:37:25").getTime();

// Update the count down every 1 second
let x = setInterval(function() {

  // Get today's date and time
  let now = new Date().getTime();

  // Find the distance between now and the count down date
  let distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("demo").innerHTML = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("demo").innerHTML = "EXPIRED";
  }
}, 1000);

// LOGIN LOGIC START

const loginToggleBtn = document.getElementById("login-toggle-btn");
const loginModal = document.getElementById("login-modal");
const loginSubmitBtn = document.getElementById("login-submit-btn");
const gatedContent = document.getElementById("cashier-gated-content");
const searchGroup = document.getElementById("search-group");

loginToggleBtn.addEventListener("click", () => {
  if (loginModal.style.display === "none" || loginModal.style.display === "") {
    loginModal.style.display = "block";
    loginToggleBtn.textContent = "Stäng Login";
  } else {
    loginModal.style.display = "none";
    loginToggleBtn.textContent = "Kassa Login";
  }
});

loginSubmitBtn.addEventListener("click", () => {
  const userInput = document.getElementById("login-user").value;
  const passInput = document.getElementById("login-pass").value;

  const validUser = "maxim";
  const validPass = "1234";

  if (true /* userInput === validUser && passInput === validPass */) {

    loginModal.style.display = "none";
    loginToggleBtn.style.display = "none";

    gatedContent.style.display = "block";
    searchGroup.style.display = "block";

    setLoggedInUser(validUser);

  } else {
    alert("Fel användarnamn eller lösenord, bror!");
  }
});

const setLoggedInUser = (user) => {
  LoggedInUser = user;
}

const getLoggedInUser = () => {
  return LoggedInUser;
}

// TABLE EVENT LISTENER START

document.getElementById("money-menu").addEventListener("click", (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;

  const articleId = tr.dataset.id;
  if (!articleId) return; // Ignore if th pressed

  const action = e.target.dataset.action;

  if (action === "delete") {
    moneymeMenu.deleteEntry(articleId);
    return;
  }
  if (action === "edit") {
    moneymeMenu.startEdit(articleId);
    return;
  }
  if (action === "save") {
    moneymeMenu.saveEdit(articleId, tr);
    return;
  }
  if (action === "cancel") {
    moneymeMenu.cancelEdit();
    return;
  }
  // Prolong - DO NOT re-render over INPUT
  if (e.target.tagName === "INPUT") {
    return;
  }

  // ORDINARILY click - Render usual
  moneymeMenu.selectedArticleId = articleId;
  moneymeMenu.renderMenu("money-menu");
});

// Respect dynamic render where to add the eventListener
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "regret") {
    moneymeMenu.undoDelete();
  }
});