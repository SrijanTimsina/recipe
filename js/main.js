let likes = JSON.parse(localStorage.getItem("allBookmark"));

window.addEventListener("load", () => displayBookmark(likes));
class Search {
  constructor(query) {
    this.query = query;
  }

  async getRecipe() {
    try {
      document.getElementById("icon-search").style.display = "inline";
      const result = await fetch(
        `https://forkify-api.herokuapp.com/api/search?q=${this.query}`
      );
      const res = await result.json();
      this.result = await res.recipes;
      document.getElementById("icon-search").style.display = "none";
    } catch (e) {
      console.log(e);
    }
  }
  createButton(page, type) {
    document.getElementById("buttons").insertAdjacentHTML(
      "beforeend",
      `
    <button id="${
      type === "prev" ? page - 1 : page + 1
    }" onclick="page(this.id)" class="page-${type}">
     <span>
      <i class="fas fa-caret-${type === "prev" ? "left" : "right"}"></i>
    </span>
      <span> Page ${type === "prev" ? page - 1 : page + 1}</span>
    </button>
    `
    );
  }

  renderButton(recipes, page) {
    let totalPages = Math.ceil(recipes.length / 10);
    let start = (page - 1) * 10;
    let end = page * 10;
    this.renderResults(recipes, start, end);

    if (page === 1 && page < totalPages) {
      this.createButton(page, "next");
    } else if (page < totalPages) {
      this.createButton(page, "prev");
      this.createButton(page, "next");
    } else if (page === totalPages) {
      this.createButton(page, "prev");
    }
  }

  renderResults(allRecipes, start, end) {
    allRecipes.slice(start, end).forEach((el) => {
      document.getElementById("recipe-list").insertAdjacentHTML(
        "beforeend",
        `<li>
          <button class="results-link" onclick=displayRecipe(${el.recipe_id})>
            <img src="${el.image_url}" alt="${el.title}" />
            <div>
              <p class="title">${el.title}</p>
              <p class="publisher">${el.publisher}</p>
            </div>
          </button>
        </li>`
      );
    });
  }
}

const state = {};

const controlSearch = async () => {
  let query = document.getElementById("search-bar").value;
  if (query) {
    document.getElementById("recipe-list").innerHTML = "";
    document.getElementById("buttons").innerHTML = "";
    state.search = new Search(query);
    await state.search.getRecipe();
    await state.search.renderButton(state.search.result, 1);
    document.getElementById("search-bar").value = "";
  }
};

document
  .getElementById("search-button")
  .addEventListener("click", controlSearch);

document.getElementById("search-bar").addEventListener("keyup", (event) => {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("search-button").click();
  }
});
function page(ID) {
  document.getElementById("recipe-list").innerHTML = "";
  document.getElementById("buttons").innerHTML = "";
  let goto = parseInt(ID);
  state.search.renderButton(state.search.result, goto);
}

class Recipe {
  constructor(id) {
    this.id = id;
  }

  async fullRecipe() {
    try {
      const output = await fetch(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      const res = await output.json();
      this.title = res.recipe.title;
      this.publisher = res.recipe.publisher;
      this.image = res.recipe.image_url;
      this.publisherLink = res.recipe.publisher_url;
      this.ingredients = res.recipe.ingredients;
      this.data = [this.id, this.title, this.publisher, this.image];
      this.icon = likes.includes(this.id);
      document.getElementById("icon-recipe").style.display = "none";
      document.getElementById("recipe-all").insertAdjacentHTML(
        "afterbegin",
        `
            <div id="recipe-intro">
            <div class="image">
              <img src="${this.image}"/>
            </div>
              <div id="title">
                <p>${this.title}</p>
              </div>
            </div>
            <div id="recipe-info">
              <button id="${this.id}" onclick=bookmark(${
          this.id
        }) class="bookmark"><i class="${
          this.icon ? "fas" : "far"
        } fa-bookmark"></i></button>
            </div>
            <div id="recipe-ingredients">
              <h1>Recipe Ingredients</h1>
              <ul id="ingredients-list">
              </ul>
            </div>
            <div id="external-link">
              <h1>How to cook it</h1>
              <p>
                Recipe was posted by <b>${
                  this.publisher
                }.</b> Please check their
                page for directions.
              </p>
              <div id="goto-external">
                <a href="${this.publisherLink}" target="_blank"
                  >Directions <i class="fas fa-arrow-right"></i
                ></a>
              </div>
    `
      );
      this.ingredients.forEach((el) => {
        document.getElementById("ingredients-list").insertAdjacentHTML(
          "beforeend",
          `
        <li class="recipe">
          <i class="fas fa-check tick"></i>${el}
        </li>
        `
        );
      });
    } catch (e) {
      console.log(e);
    }
  }
}
function displayRecipe(recipeId) {
  document.getElementById("recipe-all").innerHTML = "";
  document.getElementById("icon-recipe").style.display = "inline";
  const r = new Recipe(recipeId);
  r.fullRecipe();
}
function bookmark(id) {
  document.getElementById("bookmark-list").innerHTML = "";
  if (likes.includes(id)) {
    let index = likes.indexOf(id);
    likes.splice(index, 1);
    document.getElementById(id).innerHTML = `<i class="far fa-bookmark"></i>`;
    displayBookmark(likes);
  } else {
    likes.push(id);
    document.getElementById(id).innerHTML = `<i class="fas fa-bookmark"></i>`;
    displayBookmark(likes);
  }
  localStorage.setItem("allBookmark", JSON.stringify(likes));
}

function displayBookmark(likes) {
  likes.forEach(async (id) => {
    const output = await fetch(
      `https://forkify-api.herokuapp.com/api/get?rId=${id}`
    );
    const res = await output.json();
    let title = res.recipe.title;
    let publisher = res.recipe.publisher;
    let image = res.recipe.image_url;
    document.getElementById("bookmark-list").insertAdjacentHTML(
      "afterbegin",
      `<li class='bookmark-${id}'>
          <button class="bookmarks-link" onclick=displayRecipe(${id})>
            <img src="${image}" />
            <div>
              <p class="title">${title}</p>
              <p class="publisher">${publisher}</p>
            </div>
          </button>
        </li>
    `
    );
  });
}
