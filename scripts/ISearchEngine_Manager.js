'use strict';

let app = null;

function main() {
    const canvas = document.getElementById("canvas");
    let viewMode = "grid";
    var audio = document.getElementById("clickSound");
    const searchInput = document.getElementById("searchInput");

    app = new ISearchEngine("database.json");
    app.init(canvas).then(() => {

        const view = document.getElementById("viewbtn");
        view.addEventListener("click", () => {
            if (view.textContent==="Circular View"){
                audio.play();
                viewMode="circular";
                app.gridViewCircular(canvas);
                view.textContent="Grid View";
            }else{
                audio.play();
                viewMode="grid";
                app.gridView(canvas);
                view.textContent="Circular View";
            }
        });

        //displayDominantColorButtons
        app.dominantColors.forEach((color) => {
            const searchDominantColors = document.getElementById("searchDominantColors");
            const colorButton = document.createElement("button");
            colorButton.classList.add("dominantColorButton");
            colorButton.style.backgroundColor = color;
            hover(colorButton);
            searchDominantColors.appendChild(colorButton);
            colorButton.addEventListener("click", () => {
                audio.play();
                app.searchKeywords(color, canvas, viewMode);
            });
        });

        //displayHistogramColorButtons
        app.colors.forEach((color, i) => {
            const histogramButtons = document.getElementById("histogramButtons");
            const colorButton = document.createElement("button");
            colorButton.classList.add("histogramButtons");
            colorButton.style.backgroundColor = color;
            hover(colorButton);
            histogramButtons.appendChild(colorButton);
            colorButton.addEventListener("click", () => {
                audio.play();
                const searchInput = document.getElementById("searchInput");
                const searchTerm = searchInput.value.trim().toLowerCase();
                app.searchColor(searchTerm, i, canvas, viewMode);
            });
        });

        //botão search
        document.getElementById("searchBtn").addEventListener("click", () => {
            audio.play();
            const searchTerm = searchInput.value.trim().toLowerCase();
            app.searchKeywords(searchTerm, canvas, viewMode);
        });

        //nuvem de categorias
        document.getElementById("categorySearch").addEventListener("click", () => {
            audio.play();
            const searchCategory = document.getElementById("searchCategory");
            searchCategory.innerHTML='';
            const title = document.createElement("p");
            title.textContent = "Category cloud:";
            title.style.fontSize = "30px";
            searchCategory.appendChild(title);
            const titleContainer = document.createElement("div");
            titleContainer.style.width = "100%";
            const categoriaTitle = document.createElement("p");
            app.categories.forEach((category) => {
                const categoria = document.createElement("button");
                categoria.innerText = category;
                hover(categoria);
                searchCategory.appendChild(categoria);
                categoria.addEventListener("click", () => {
                    audio.play();
                    searchCategory.appendChild(titleContainer);
                    titleContainer.innerHTML = '';
                    categoriaTitle.textContent = category;
                    categoriaTitle.style.fontSize = "30px";
                    titleContainer.appendChild(categoriaTitle);
                    searchInput.value = "";
                    searchInput.value=category;
                    app.searchKeywords(category, canvas, viewMode);
                });
            });
        });
    });
}

function Generate_Image(canvas) {
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(100, 100);

    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i + 0] = 204;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
        imgData.data[i + 3] = 255;
        if ((i >= 8000 && i < 8400) || (i >= 16000 && i < 16400) || (i >= 24000 && i < 24400) || (i >= 32000 && i < 32400))
            imgData.data[i + 1] = 200;
    }
    ctx.putImageData(imgData, 150, 0);
    return imgData;
}

function hover(element) {
    element.addEventListener("mouseover", () => {
        element.style.opacity = "0.8";
        element.style.transform = "scale(1.2)";
    });
    element.addEventListener("mouseout", () => {
        element.style.opacity = "1.0";
        element.style.transform = "scale(1)";
    });
}