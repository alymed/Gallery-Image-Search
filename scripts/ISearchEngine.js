'use strict';

class ISearchEngine {

    constructor(dbase) {
        this.allpictures = new Pool(3000);
        this.resultPictures = new Pool(3000);      //pool que vai conter as imagens que se pretendem mostrar no canvas 
        this.resultsPath = new Array(100)          //array para armazenar paths de todas as imagens de uma certa categoria, daí 100 espaços 

        this.colors = ["red", "orange", "yellow", "green", "Blue-green", "blue", "purple", "pink", "white", "grey", "black", "brown"];
        this.redColor = [240, 220, 255, 16, 100, 0, 111, 255, 255, 153, 20, 136];
        this.greenColor = [20, 100, 250, 206, 177, 81, 32, 86, 255, 153, 20, 84];
        this.blueColor = [20, 30, 52, 65, 187, 255, 159, 159, 255, 153, 20, 24];

        this.categories = ["beach", "birthday", "face", "indoor", "manmade/artificial", "manmade/manmade", "manmade/urban", "marriage", "nature", "no_people", "outdoor", "party", "people", "snow"];

        this.jsonData;
        this.jsonFile = dbase;
        this.db = new DatabaseJSON();
        this.lsDb = new LocalStorageDatabaseJSON();
        this.numAllPictures = this.categories.length * 100
        this.numShownPic = 30;
        this.imgWidth = 250;
        this.imgHeight = 200;

        this.dominantColors = [];

        this.colorDatabase = new Array(12);
        this.minPixels = 3000;
    }

    async init(cnv) {
        this.jsonData = await this.db.loadFile(this.jsonFile)
        this.databaseProcessing(cnv);
        this.getDominanteColors(this.jsonData);
    }

    getDominanteColors(jsonData) {
        this.dominantColors = jsonData.images.map(image => image.dominantcolor).filter((value, index, self) => self.indexOf(value) === index);
    }

    searchKeywords(categoria, cnv, view) {
        this.resultPictures.empty_Pool();
        this.resultsPath = [];
        this.resultsPath = this.db.search(categoria, this.jsonData, this.numShownPic);
        this.allpictures.stuff.forEach(imgTC => {
            this.resultsPath.forEach(path => {
                if (imgTC.impath === path) {
                    this.resultPictures.insert(imgTC)
                }
            });
        });

        if (view === "circular") {
            this.gridViewCircular(cnv);
        } else if (view === "grid") {
            this.gridView(cnv);
        }
    }

    searchColor(categoria, indexColor, cnv, view) {
        //Tratamento de erro
        let debugCounter = 0;
        this.categories.forEach(cat => {
            if (categoria === cat) {
                debugCounter++;
            }
        });
        if (debugCounter < 1) {
            throw 'Categoria inválida ou nula.'
        }

        this.resultPictures.empty_Pool();
        const imgByCategory = this.lsDb.read(categoria);
        const imgByColor = imgByCategory.images[indexColor]

        this.allpictures.stuff.forEach(imgTC => {          // precorrer as imagens ja criadas e processadas

            imgByColor.forEach(img => {
                if (imgTC.impath === img.path) {           //se o path for igual vamos adicionar meter o objeto do allpictures no result
                    this.resultPictures.insert(imgTC)      //se o path for igual vamos adicionar meter o objeto do allpictures no result, 
                }                                          //assim nao criamos outra instancia de Picture e ja processamos a imagem que estamos a guardar
            });
        });

        this.resultPictures.stuff.forEach(img => {
            if (img.hist[indexColor] < this.minPixels) { // remover imagens cujo o numero de pixeis de uma certa cor seja inferior a um valor minimo 
                this.resultPictures.remove();
            }
        });

        if (view === "circular") {
            this.gridViewCircular(cnv);
        } else if (view === "grid") {
            this.gridView(cnv);
        }
    }

    databaseProcessing() {
        const h12color = new ColorHistogram(this.redColor, this.greenColor, this.blueColor);
        const colmoments = new ColorMoments();

        //canvas "artificial"
        const procCnv = document.createElement("canvas");
        procCnv.width = 2000;
        procCnv.height = 2000;

        for (let i = 0; i < this.categories.length; i++) {
            this.resultsPath = [];
            const categoria = this.categories[i];
            this.resultsPath = this.db.search(categoria, this.jsonData, 1400);

            this.resultsPath.forEach(path => {
                const img = new Picture(0, 0, this.imgWidth, this.imgHeight, path, categoria);
                const eventname = "processed_picture_" + img.impath;
                const eventP = new Event(eventname);
                const self = this;
                img.computation(procCnv, h12color, colmoments, eventP); //processa a imagem
                document.addEventListener(eventname, function () {
                    self.imageProcessed(img, eventname) //adiciona à pool e verifica se pode-se criar a base de dados 
                })
            });
        }
    }

    imageProcessed(img, eventname) {
        const dingSound = document.getElementById("dingSound");
        this.allpictures.insert(img);
        console.log("image processed");

        const processing = document.getElementById("processing");
        const process = document.createElement("p");

        processing.innerHTML = '';
        process.textContent = this.allpictures.stuff.length + " images processed out of " + Math.min(this.jsonData.images.length, this.numAllPictures);
        processing.appendChild(process);

        const progressBar = document.getElementById("progressBar");
        const progressValue = (this.allpictures.stuff.length / Math.min(this.jsonData.images.length, this.numAllPictures)) * 100;
        progressBar.style.width = progressValue + "%";
        progressBar.setAttribute("aria-valuenow", progressValue);

        if (this.allpictures.stuff.length === this.numAllPictures) {  //cria a colorDataBase no LocalStorage após o processamento todas as imagens
            this.createColorDatabaseLS();
            dingSound.play();
            process.textContent = "All images processed.";
            progressBar.style.width = "100%";
            progressBar.setAttribute("aria-valuenow", 100);
            //this.createIExampledatabaseLS(); 
        }
    }

    createColorDatabaseLS() {
        const imagesByCat = {};
        const colorDatabase = {};

        this.allpictures.stuff.forEach(picture => {
            if (!imagesByCat[picture.category]) {
                imagesByCat[picture.category] = [];
            }
            imagesByCat[picture.category].push(picture);
        });

        this.categories.forEach(category => {
            colorDatabase[category] = { images: [] };
            this.colors.forEach((color, i) => {
                this.sortbyColor(i, imagesByCat[category]);
                const selectedImages = imagesByCat[category].slice(0, this.numShownPic)
                    .map(img => ({ class: color, path: img.impath }));

                colorDatabase[category].images.push(selectedImages);
            });
        });

        for (const category in colorDatabase) {
            this.lsDb.save(category, colorDatabase[category]);
        }
    }

    sortbyColor(idxColor, list) {
        list.sort(function (a, b) {
            return b.hist[idxColor] - a.hist[idxColor];
        });
    }

    gridView(canvas) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        let x = 0;
        let y = 0;

        for (let i = 0; i < this.resultPictures.stuff.length; i++) {
            const img = this.resultPictures.stuff[i];
            img.setPosition(x, y);
            const startTime = Date.now();
            this.fadeInAnimation(canvas, img, x, y, startTime);
            img.draw(canvas);
            x += this.imgWidth + 10;
            if (x >= canvas.width) {
                x = 0;
                y += this.imgHeight + 5;
            }
        }
    }

    fadeInAnimation(canvas, img, x, y, startTime) {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        canvas.getContext("2d").globalAlpha = Math.min(1, elapsed / 2000);
        img.setPosition(x, y);
        img.draw(canvas);

        if (elapsed < 2000) {
            requestAnimationFrame(() => this.fadeInAnimation(canvas, img, x, y, startTime, 2000));
        }
    }

    gridViewCircular(canvas) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 11; i++) {
            const img = this.resultPictures.stuff[i];

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) / 3;
            const angleIncrement = (2 * Math.PI) / 11;
            const angle = i * angleIncrement;

            const imgX = centerX + radius * Math.cos(angle) - this.imgWidth / 2;
            const imgY = centerY + radius * Math.sin(angle) - this.imgHeight / 2;

            const startTime = Date.now();
            this.fadeInAnimation(canvas, img, imgX, imgY, startTime);
        }
    }
}

class Pool {
    constructor(maxSize) {
        this.size = maxSize;
        this.stuff = [];
    }

    insert(obj) {
        if (this.stuff.length < this.size) {
            this.stuff.push(obj);
        } else {
            alert("The application is full: there isn't more memory space to include objects");
        }
    }

    remove() {
        if (this.stuff.length !== 0) {
            this.stuff.pop();
        } else {
            alert("There aren't objects in the application to delete");
        }
    }

    empty_Pool() {
        while (this.stuff.length > 0) {
            this.remove();
        }
    }
}