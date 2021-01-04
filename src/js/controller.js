import * as model from './model.js';
import {MODEL_CLOSE_SEC} from "./config.js";
import recipeView from './views/recipeView.js';
import searchView from "./views/searchView.js";
import resultsView from './views/resultsView.js';
import paginationView from "./views/paginationView";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {async} from 'regenerator-runtime';

if (module.hot) {
    module.hot.accept();
}
// https://forkify-api.herokuapp.com/v2

/////////////////////////////////

const recipeControl = async function () {
    try {
        // getting the hash id From URl
        const id = window.location.hash.slice(1);

        if (!id) return;
        // show spinner
        recipeView.renderSpinner();

        // 0) Update results view to mark selected search result
        resultsView.update(model.getSearchResultPage());

        // 1) Updating bookmarks view
        bookmarksView.update(model.state.bookmarks);

        // 2) Loading recipe
        await model.loadRecipe(id);
        // 3) Rendering Recipe
        recipeView.render(model.state.recipe);


    } catch (err) {
        recipeView.renderError();
        console.error(err);
    }
};


// loadSearchResult('pizza');

const controlSearchResult = async function () {
    try {
        resultsView.renderSpinner();
        // 1) Get search query
        const query = searchView.getQuery();
        if (!query) return;

        // 1) Load search result
        await model.loadSearchResult(query);

        // 3) Render result
        // resultsView.render(model.state.search.results);
        resultsView.render(model.getSearchResultPage());

        // 4) Render the initial pagination buttons
        paginationView.render(model.state.search);
    } catch (err) {
        console.log(err);
    }
};

const controlPagination = function (goToPage) {
    // 1) Render New result
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage(goToPage));

    // 4) Render the New pagination buttons
    paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
//    Update the recipe serving (in the state)
    model.updateServings(newServings);
//    Update the recipe view
//       recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);

};

const controlAddBookMark = function () {
    // 1) Add/remove bookmark
    if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
    else model.deleteBookMark(model.state.recipe.id);

    // 2) Update recipe view
    recipeView.update(model.state.recipe);

    // 3) Render bookmark
    bookmarksView.render(model.state.bookmarks);
};
const controlBookMarks = function () {
    bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {
    try {
        // Show loading spinner
        addRecipeView.renderSpinner();
        // Upload the new recipe data
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        //   Render data
        recipeView.render(model.state.recipe);

        //    Success Message
        addRecipeView.renderMessage();

        // Render bookmark view
        bookmarksView.render(model.state.bookmarks);

        //Changed id in the URL
        window.history.pushState(null,'', `#${model.state.recipe.id}`);

        //    CLose form window
        setTimeout(function () {
            // addRecipeView.toggleWindow();
        }, MODEL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error('🎇', err);
        addRecipeView.renderError(err.message);
    }

}

const init = function () {
    bookmarksView.addHandlerRender(controlBookMarks);
    recipeView.addHandlerRender(recipeControl);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookMark(controlAddBookMark);
    searchView.addHandlerSearch(controlSearchResult);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
    console.log('Welcome');
};
init();