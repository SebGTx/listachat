window.onload = () => {
  'use strict';
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
}

// Directive vue permettant de gérant un appui long sur un élément
Vue.directive('longpress', {
    bind: function (el, binding, vNode) {
        // Make sure expression provided is a function
        if (typeof binding.value !== 'function') {
            // Fetch name of component
            const compName = vNode.context.name
            // pass warning to console
            let warn = `[longpress:] provided expression '${binding.expression}' is not a function, but has to be`
            if (compName) { warn += `Found in component '${compName}' ` }

            console.warn(warn)
        }

        // Define variable
        let pressTimer = null

        // Define funtion handlers
        // Create timeout ( run function after 1s )
        let start = (e) => {

            if (e.type === 'click' && e.button !== 0) {
                return;
            }

            if (pressTimer === null) {
                pressTimer = setTimeout(() => {
                    // Run function
                    handler()
                }, 1000)
            }
        }

        // Cancel Timeout
        let cancel = (e) => {
            // Check if timer has a value or not
            if (pressTimer !== null) {
                clearTimeout(pressTimer)
                pressTimer = null
            }
        }
        // Run Function
        const handler = (e) => {
            binding.value(e)
        }

        // Add Event listeners
        el.addEventListener("mousedown", start);
        el.addEventListener("touchstart", start);
        // Cancel timeouts if this events happen
        el.addEventListener("click", cancel);
        el.addEventListener("mouseout", cancel);
        el.addEventListener("touchend", cancel);
        el.addEventListener("touchcancel", cancel);
    }
})

// Application vue gérant la barre de navigation
var navbarApp = new Vue({
  el: '#navbar',
  data: {
    sortkey: 'A',
    searchvalue: ''
  },
  methods: {
    filterList : function (event) {
      groceryListApp.$forceUpdate();
    },
    addArticle: function (event) {
      articleContextMenuApp.addmode = true;
      articleContextMenuApp.source = null;
      articleContextMenuApp.id = null;
      articleContextMenuApp.text = '';
      articleContextMenuApp.quantity = 1;
      articleContextMenuApp.category = 'Autres';
      articleContextMenuApp.desc = '';
      $('#articleContextMenu').modal('toggle');
      $('#navbarNav').collapse('hide');
    },
    changeSorting: function (newsortkey) {
      navbarApp.sortkey = newsortkey;
      $('#navbarNav').collapse('hide');
      console.log(navbarApp.sortkey);
      groceryListApp.$forceUpdate();
    },
    forceSWupdate: function () {
      if ('serviceWorker' in navigator) {
        window.location.reload(true);
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          for (let registration of registrations) {
            registration.update();
          }
        })
        window.location.reload(true);
      }
    }
  }
})
  
// Application vue gérant la fenêtre modale de gestion d'un article
var articleContextMenuApp = new Vue({
  el: '#articleContextMenu',
  data: {
    addmode: false,
    source: null,
    id: null,
    text: null,
    quantity: null,
    category: null,
    desc: null
  },
  computed: {
    titre: function () {
      if (this.addmode) {
        return 'Ajouter l\'article';
      } else {
        return 'Modifier l\'article';
      }
    }
  },
  methods: {
    closeWithoutSave: function (event) {
      this.closeContextMenu();
    },
    saveArticle: function (event) {
      if (this.addmode) {
        groceryListApp.groceryList.push(
          { id: null, text: this.text, quantity: this.quantity, category: this.category, desc: this.desc, isActive: false, isChecked: false }
        );
      } else {
        Vue.set(this.source, 'text', this.text);
        Vue.set(this.source, 'quantity', this.quantity);
        Vue.set(this.source, 'category', this.category);
        Vue.set(this.source, 'desc', this.desc);
      }
      this.closeContextMenu();
    },
    removeArticle: function (event) {
      var index = groceryListApp.groceryList.indexOf(this.source)
      groceryListApp.groceryList.splice(index, 1)
      this.closeContextMenu();
    },
    closeContextMenu: function () {
      if (!this.addmode) Vue.set(this.source, 'isActive', false);
      $('#articleContextMenu').modal('toggle');
    }
  }
})

// Composant Article affiché dans la liste
Vue.component('grocery-item', {
  props: ['grocery'],
  template: `
    <li v-longpress="groceryItemLP" class="list-group-item d-flex justify-content-between align-items-center noselect" v-bind:class="{ \'list-group-item-primary\': grocery.isActive, \'list-group-item-muted\': grocery.isChecked }">
      <div class="d-flex w-100">
        <div class="pr-0 pl-2 pt-2 pb-2 flex-shrink-1">
          <svg class="bd-placeholder-img align-self-center mr-3" width="64" height="64" role="img" version="1.1" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" ><rect width="64" height="64" rx="16" style="fill:#ffad38;paint-order:markers fill stroke"/><path transform="matrix(.35470211 .09605207 -.09511632 .35875096 -68.396595 -14.379439)" d="m341.09601 37.955191c3.72378 13.908184-53.97961 71.589069-67.88634 67.859869s-35.00815-82.542244-24.8252-92.721224c10.18295-10.1789805 88.98776 10.953172 92.71154 24.861355z" style="fill:none;paint-order:normal;stroke-linecap:round;stroke-width:21.66233826;stroke:#ffff26"/></svg>
        </div>
        <div class="pr-2 pl-0 pt-2 pb-2 w-100">
          <h5 class="mb-1">{{ grocery.text }} </h5>
          <p class="mb-1">{{ grocery.desc }}</p>
        </div>
        <div class="pr-2 pl-0 pt-2 pb-2 flex-shrink-1">
          <span class="badge badge-quantity">{{ grocery.quantity }}</span>
        </div>
        <div class="pr-2 pl-0 pt-2 pb-2 flex-shrink-1 notgrayed">
          <input class="custom-checkbox" type="checkbox" v-model="grocery.isChecked" v-on:change="listrefresh">
        </div>
      </div>
    </li>`,
  methods: {
    groceryItemLP: function (event) {
      Vue.set(this.grocery, 'isActive', true);
      articleContextMenuApp.addmode = false;
      articleContextMenuApp.source = this.grocery;
      articleContextMenuApp.id = this.grocery.id;
      articleContextMenuApp.text = this.grocery.text;
      articleContextMenuApp.quantity = this.grocery.quantity;
      articleContextMenuApp.category = this.grocery.category;
      articleContextMenuApp.desc = this.grocery.desc;
      $('#articleContextMenu').modal('toggle');
    },
    listrefresh: function (event) {
      groceryListApp.$forceUpdate();
    }
  }
})

// Application vue principale gérant la liste à l'aide du composant Article
var groceryListApp = new Vue({
  el: '#grocerylist',
  data: {
    groceryList: [
      { id: 0, text: 'baguette', quantity: 1, category: 'Pain, Viénoiserie', desc: '', isActive: false, isChecked: false },
      { id: 1, text: 'beurre végétal', quantity: 2, category: '', desc: '400g', isActive: false, isChecked: false },
      { id: 2, text: 'bouteille gaz', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 3, text: 'épinards', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 4, text: 'fromage', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 5, text: 'jus de fruit', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 6, text: 'papier toilette', quantity: 2, category: '', desc: '', isActive: false, isChecked: false },
      { id: 7, text: 'patee chat', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 8, text: 'patee chien pedigree', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 9, text: 'pâtes penne', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 10, text: 'poireau', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 11, text: 'pomme de terre gratin', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 12, text: 'pommes', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 13, text: 'sauce soja', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 14, text: 'vinaigre blanc', quantity: 2, category: '', desc: '', isActive: false, isChecked: false },
      { id: 15, text: 'yaourts andros vegetal', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 16, text: 'yaourts brebis', quantity: 1, category: '', desc: '', isActive: false, isChecked: false },
      { id: 17, text: 'abricots', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 18, text: 'ail', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 19, text: 'ajax poudre', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 20, text: 'amandes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 21, text: 'apero sans alcool', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 22, text: 'apéro ss gluten', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 23, text: 'apres shampooing soin', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 24, text: 'aubergine', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 25, text: 'avocats', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 26, text: 'bananes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 27, text: 'bananes chips', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 28, text: 'barres d\'amandes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 29, text: 'barres de céréales', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 30, text: 'bicarbonate soude', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 31, text: 'biscotte ss gluten', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 32, text: 'biscottes carrefour blé complet', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 33, text: 'bjorg olive', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 34, text: 'bouillon de légumes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 35, text: 'bouillon de volaille', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 36, text: 'bouteille jus fruits boulot', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 37, text: 'brasse andros coco', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 38, text: 'brebi chataigne lili', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 39, text: 'briochin desinfectant 100 pourcent naturel. nettoyant toutes surfaces', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 40, text: 'brocolis', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 41, text: 'café boulot seb', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 42, text: 'café senseo', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 43, text: 'cannelle', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 44, text: 'cappuccino boulot', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 45, text: 'carottes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 46, text: 'carottes surgelées', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 47, text: 'carré de coton', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 48, text: 'cartouche maxtra', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 49, text: 'céleri', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 50, text: 'céréales cruesli chocolat noir', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 51, text: 'cereales muesli petit déjeuner', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 52, text: 'céréales ss gluten', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 53, text: 'cerneaux de noix de pecan', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 54, text: 'champignons', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 55, text: 'chataignes bocal', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 56, text: 'chips', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 57, text: 'chocolat à patisser', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 58, text: 'chocolat en poudre', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 59, text: 'choux blanc', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 60, text: 'choux fleur', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 61, text: 'choux vert', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 62, text: 'citron bio', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 63, text: 'citron vert', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 64, text: 'clémentines corse', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 65, text: 'coca cola', quantity: 1, category: '', desc: 'Pack de 8 bouteilles en verre', isActive: false, isChecked: true },
      { id: 66, text: 'compote', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 67, text: 'compresses', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 68, text: 'concombre', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 69, text: 'confiture fraise', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 70, text: 'confiture mures', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 71, text: 'confitures autres', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 72, text: 'cornichons', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 73, text: 'coton tige', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 74, text: 'coulis de tomates', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 75, text: 'courge', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 76, text: 'courgette', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 77, text: 'cracotte lili', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 78, text: 'cracottes sans gluten', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 79, text: 'cranberries', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 80, text: 'creme de coco', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 81, text: 'creme fraîche', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 82, text: 'creme mains', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 83, text: 'croquettes chat stérilisé', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 84, text: 'cruesli', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 85, text: 'cure dents', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 86, text: 'curry poudre', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 87, text: 'dattes dénoyautées', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 88, text: 'dentifrice', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 89, text: 'dentifrice Manue', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 90, text: 'déodorant cadum', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 91, text: 'déodorant Killian', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 92, text: 'déodorant Manue biophanature', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 93, text: 'déodorant seb', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 94, text: 'dépoussiérant', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 95, text: 'eau démineralisee', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 96, text: 'échalote', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 97, text: 'emmental', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 98, text: 'endives', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 99, text: 'enveloppes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 100, text: 'éponges', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 101, text: 'farine sans gluten', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 102, text: 'fécule de maïs', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 103, text: 'feuille de menthe', quantity: 28, category: '', desc: '', isActive: false, isChecked: true },
      { id: 104, text: 'feuille de nori', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 105, text: 'feuille simple A4 grand carreaux', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 106, text: 'filet de saumon', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 107, text: 'filtres à café', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 108, text: 'fine herbes ducros', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 109, text: 'flocons avoine', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 110, text: 'framboises', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 111, text: 'friandises bella', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 112, text: 'fromage de chèvre buche', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 113, text: 'fromage hamburger', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 114, text: 'fromage sandwichs', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 115, text: 'fruits', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 116, text: 'gâteaux gouter', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 117, text: 'gâteaux goûter manue', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 118, text: 'gâteaux sans gluten', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 119, text: 'gateaux ss gluten', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 120, text: 'gel depilatoire', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 121, text: 'gel wc', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 122, text: 'graine de sésame', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 123, text: 'gros sel', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 124, text: 'haricots rouges', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 125, text: 'haricots verts Bella', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 126, text: 'haricots verts bocaux', quantity: 3, category: '', desc: '', isActive: false, isChecked: true },
      { id: 127, text: 'haricots verts surgelés', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 128, text: 'herbamare', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 129, text: 'herbes de provences', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 130, text: 'houmous de poichiche', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 131, text: 'huile boulot', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 132, text: 'huile d\'olive', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 133, text: 'huile de colza', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 134, text: 'huile de noix', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 135, text: 'huile de sésame', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 136, text: 'huile isio 4', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 137, text: 'jambon de dinde', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 138, text: 'jus de citron bio', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 139, text: 'jus fruit boulot', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 140, text: 'ketchup', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 141, text: 'kinoa et boulgour', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 142, text: 'kiwis', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 143, text: 'krisprolls ss gluten', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 144, text: 'lait amande cappuccino', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 145, text: 'lait amande chocolat', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 146, text: 'lait concentré sucrée', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 147, text: 'lait d\'amande calcium', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 148, text: 'lait d\'amandes vanille', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 149, text: 'lait d\'avoine calcium', quantity: 3, category: '', desc: '', isActive: false, isChecked: true },
      { id: 150, text: 'lait de coco', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 151, text: 'lait de riz', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 152, text: 'lavette table', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 153, text: 'lentilles corail', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 154, text: 'lentilles vertes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 155, text: 'lessive rechargeable', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 156, text: 'levure chimique', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 157, text: 'lingette wc', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 158, text: 'lingettes intimes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 159, text: 'liquide lave glace', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 160, text: 'litière', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 161, text: 'mâche', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 162, text: 'maïs', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 163, text: 'mangue', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 164, text: 'maquereaux', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 165, text: 'mayonnaise', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 166, text: 'miel', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 167, text: 'mix C patisserie Schär', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 168, text: 'moscato d\'asti', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 169, text: 'mouchoirs', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 170, text: 'moutarde forte', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 171, text: 'nectarines jaunes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 172, text: 'noisette en poudre', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 173, text: 'noix cajou nature', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 174, text: 'noix coco rapee', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 175, text: 'noix du bresil', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 176, text: 'oasis', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 177, text: 'oeufs', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 178, text: 'oignon jaune', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 179, text: 'oignon rouge', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 180, text: 'olives vertes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 181, text: 'orange', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 182, text: 'orangina', quantity: 1, category: '', desc: 'Pack de 8 bouteilles en verre', isActive: false, isChecked: true },
      { id: 183, text: 'pain grillé au blé complet', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 184, text: 'pain grillé leclerc', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 185, text: 'pain hamburger', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 186, text: 'pain hamburger sans gluten', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 187, text: 'pain sans gluten', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 188, text: 'pamplemousse rose', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 189, text: 'papier cuisson', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 190, text: 'pâte', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 191, text: 'pate à tartiner', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 192, text: 'pâte d\'amande', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 193, text: 'pate millefoglie sans gluten', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 194, text: 'pate sablee', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 195, text: 'pâte. à tartiner vegan', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 196, text: 'patee bjorg', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 197, text: 'pâtes coquillettes', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 198, text: 'pates sans gluten', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 199, text: 'pâtes spaghettis', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 200, text: 'pâtes tagliatelle', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 201, text: 'pépites de chocolat', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 202, text: 'persil', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 203, text: 'persil en bocal', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 204, text: 'petit dej Manue', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 205, text: 'petit produit vaisselle', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 206, text: 'petite boite de petits pois', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 207, text: 'petits pois carottes bocaux', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 208, text: 'pistaches', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 209, text: 'poires', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 210, text: 'poivron', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 211, text: 'pomme de terre frites', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 212, text: 'pomme de terre rissolé', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 213, text: 'pousse de soja', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 214, text: 'pralin', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 215, text: 'praliné dessert nestle', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 216, text: 'produit nettoyant pour salle de bain', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 217, text: 'produit nettoyant sol', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 218, text: 'produit vaisselle', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 219, text: 'puree d amande', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 220, text: 'raisin', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 221, text: 'recharge javel', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 222, text: 'riz Bella', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 223, text: 'riz complet', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 224, text: 'riz long grain', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 225, text: 'riz rond japonais', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 226, text: 'sachets sucre vanillé', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 227, text: 'sacs poubelle', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 228, text: 'sacs poubelle 30 litres', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 229, text: 'salade', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 230, text: 'san pelegrino', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 231, text: 'sauce mirin', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 232, text: 'sauce pâtes', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 233, text: 'saucisse Strasbourg', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 234, text: 'saucisse viennoise', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 235, text: 'saumon fumé', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 236, text: 'savon dove', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 237, text: 'savon hydratant', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 238, text: 'savon main le petit olivier', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 239, text: 'savon noir', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 240, text: 'sel fin de table', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 241, text: 'sel régénérant pour lave-vaiselle', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 242, text: 'semoule au lait de chêvre lili', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 243, text: 'semoule ble', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 244, text: 'serviette hygiéniques légères', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 245, text: 'serviettes hygiéniques', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 246, text: 'shampooing Aelita', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 247, text: 'shampooing le petit olivier', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 248, text: 'sirop d agave', quantity: 2, category: '', desc: '', isActive: false, isChecked: true },
      { id: 249, text: 'sirop de menthe', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 250, text: 'sirop de pêche', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 251, text: 'soja mandarine citron vert', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 252, text: 'sopalin', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 253, text: 'steack végétaux', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 254, text: 'steaks haché', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 255, text: 'sucre canne en poudre', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 256, text: 'sucre glace', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 257, text: 'sucre morceaux boulot', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 258, text: 'sucre vanilliné', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 259, text: 'surimi', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 260, text: 'tablette chocolat', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 261, text: 'tablette chocolat au lait dessert', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 262, text: 'tablette chocolat blanc dessert', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 263, text: 'tablette chocolat noir dessert', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 264, text: 'tablette chocolat pralinoise dessert', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 265, text: 'tablettes lave-vaisselle', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 266, text: 'the tetley', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 267, text: 'thon', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 268, text: 'tofu mariné au soy', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 269, text: 'tomates', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 270, text: 'vanille liquide', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 271, text: 'vegetaline', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 272, text: 'vin', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 273, text: 'vinaigre balsamique', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 274, text: 'vinaigre de riz', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 275, text: 'yaourt à la grec', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 276, text: 'yaourt brebis châtaigne lili', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 277, lid: null, text: 'yaourt chèvre nature', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 278, lid: null, text: 'yaourt riz au lait brebis lili', quantity: 1, category: '', desc: '', isActive: false, isChecked: true },
      { id: 279, lid: null, text: 'yaourts tracieleta', quantity: 1, category: '', desc: '', isActive: false, isChecked: true }
    ]
  },
  computed: {
    groceryListSorted: function() {
      function compareCheckedText(a, b) {
         if (a.isChecked < b.isChecked) return -1;
         if (a.isChecked > b.isChecked) return 1;
         if (a.text.localeCompare(b.text) < 0) return -1;
         if (a.text.localeCompare(b.text) > 0) return 1;
         return 0;
      }
      
      function compareCheckedCategoryText(a, b) {
         if (a.isChecked < b.isChecked) return -1;
         if (a.isChecked > b.isChecked) return 1;
         if (a.category.localeCompare(b.category) < 0) return -1;
         if (a.category.localeCompare(b.category) > 0) return 1;
         if (a.text.localeCompare(b.text) < 0) return -1;
         if (a.text.localeCompare(b.text) > 0) return 1;
         return 0;
      }
      
      switch (navbarApp.sortkey) {
        case 'C':
          //return [...this.groceryList].sort(compareCheckedCategoryText);
          return this.groceryList.filter(item => {
            return item.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().indexOf(navbarApp.searchvalue.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()) > -1
          }).sort(compareCheckedCategoryText);
          break;
        default:
          //return [...this.groceryList].sort(compareCheckedText);
          return this.groceryList.filter(item => {
            return item.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().indexOf(navbarApp.searchvalue.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()) > -1
          }).sort(compareCheckedText);
      }
      
    }
  }
})