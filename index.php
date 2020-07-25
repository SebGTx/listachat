<?php
  if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off") {
    $location = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $location);
    exit;
  }
?>
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>List@chat</title>
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/bootstrap.min.css">
    <link rel="manifest" href="./manifest.json">
    <link rel="icon" href="./favicon.ico" type="image/x-icon" />  
    <link rel="apple-touch-icon" href="./img/listachat-icon-152.png">   
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="white"/>
    <meta name="theme-color" content="white"/>  
    <meta name="apple-mobile-web-app-capable" content="yes">  
    <meta name="apple-mobile-web-app-status-bar-style" content="black"> 
    <meta name="apple-mobile-web-app-title" content="List@Chat"> 
    <meta name="msapplication-TileImage" content="./img/listachat-icon-144.png">  
    <meta name="msapplication-TileColor" content="#FFFFFF">
  </head>
  <body class="fullscreen">
    
    <!-- Navbar -->
    <div id="navbar">
      <nav class="navbar fixed-top text-light navbar-dark bg-dark">
        <div class="d-flex w-100">
          <div class="pr-2 pl-2 pt-1 pb-0 flex-shrink-1">
            <img src="./img/listachat-icon-32.png" class="d-inline-block align-top" alt="List@Chat">
          </div>
          <div class="pr-4 pl-4 pt-1 pb-0 w-100">
            <input type="text" class="form-control form-control-sm" placeholder="Recherche" v-model="searchvalue" v-on:keyup="filterList">
          </div>
          <div class="pr-2 pl-2 pt-0 pb-0 flex-shrink-1">
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
        <div class="collapse navbar-collapse" id="navbarNav">
          <div class="navbar-nav">
            <a class="nav-item nav-link" href="#" v-on:click="addArticle">Ajouter un article</a>
            <a class="nav-item nav-link" href="#" v-on:click="changeSorting('A')" v-bind:class="{ active: sortkey == 'A' }">Tri par article</a>
            <a class="nav-item nav-link" href="#" v-on:click="changeSorting('C')" v-bind:class="{ active: sortkey == 'C' }">Tri par catégorie</a>
            <!--<a class="nav-item nav-link" href="#" v-on:click="forceSWupdate">Recharger</a>-->
            <!--<a class="nav-item nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>-->
          </div>
        </div>
      </nav>
    </div>
    
    <!-- Modal -->
    <div class="modal fade" id="articleContextMenu" tabindex="-1" role="dialog" aria-labelledby="Menu contextuel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="articleContextMenuTitle">{{ titre }}</h5>
            <button type="button" class="close" v-on:click="closeWithoutSave" aria-label="Fermer">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group row">
                <label for="champArticle" class="col-sm-2 col-form-label">Article</label>
                <div class="col-sm-10">
                  <input type="text" class="form-control" id="champArticle" v-model="text" placeholder="Article">
                </div>
              </div>
              <div class="form-group row">
                <label for="champQuantite" class="col-sm-2 col-form-label">Quantité</label>
                <div class="col-sm-10">
                  <input type="text" class="form-control" id="champQuantite" v-model="quantity" placeholder="Quantité">
                </div>
              </div>
              <div class="form-group row">
                <label for="champCategorie" class="col-sm-2 col-form-label">Catégorie</label>
                <div class="col-sm-10">
                  <select class="form-control" id="champCategorie" v-model="category">
                    <option disabled value="">Catégorie</option>
                    <option>Animaux</option>
                    <option>Autres</option>
                    <option>Boissons</option>
                    <option>Conserves</option>
                    <option>Culture</option>
                    <option>Frais</option>
                    <option>Fruits</option>
                    <option>Gateaux</option>
                    <option>Hygiène</option>
                    <option>Légumes</option>
                    <option>Pain, Viénoiserie</option>
                    <option>Poisson</option>
                    <option>Surgelés</option>
                    <option>Vêtements</option>
                    <option>Viande</option>
                  </select>
                </div>
              </div>
              <div class="form-group row">
                <label for="champDescription" class="col-sm-3 col-form-label">Description</label>
                <div class="col-sm-9">
                  <textarea v-model="desc" class="form-control" id="champDescription" placeholder="Description"></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" v-bind:class="{ hidden: addmode }" v-on:click="removeArticle">Supprimer</button>
            <button type="button" class="btn btn-success" v-on:click="saveArticle">Enregistrer</button>
            <button type="button" class="btn btn-primary" v-on:click="closeWithoutSave">Fermer</button>
          </div>
        </div>
      </div>
    </div>
      
    <!-- Content -->
    <div class="container-fluid">
      <div id="grocerylist">
        <ul class="list-group list-group-flush">
          <grocery-item v-for="item in groceryListSorted" v-bind:grocery="item" v-bind:key="item.id"></grocery-item>
        </ul>
      </div>
      <br>
    </div>
    
    <!-- JS -->
    <script src="./js/vue.min.js"></script>
    <script src="./js/jquery-3.4.1.min.js"></script>
    <script src="./js/bootstrap.bundle.min.js"></script>
    <script src="./js/main.js"></script>    
  </body>
</html>
