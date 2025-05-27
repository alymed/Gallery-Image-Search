'use strict';

class DatabaseJSON {

    constructor() { }

    async loadFile(filename) {
        let jsonData = {};
        try {
            const response = await fetch(filename);
            const jsonString = await response.text();
            jsonData = JSON.parse(jsonString);
        } catch (error) {
            console.error('Error loading JSON file:', error);
        }
        return jsonData;
    }

    search(query, jsonData, maxResults) {
        let imagesMatched = [];
        if (query.startsWith("#")) { //se a informação na query for uma cor
            imagesMatched = jsonData.images.filter(im => im.dominantcolor === query);
        } else {
            imagesMatched = jsonData.images.filter(im => im.class === query);
        }
        maxResults = maxResults > imagesMatched.length ? imagesMatched.length : maxResults;
        return imagesMatched.slice(0, maxResults).map(im => im.path);
    }
}

class LocalStorageDatabaseJSON {

    constructor() { }

    save(keyname, jsonObject) {
        try {
            localStorage.setItem(keyname, JSON.stringify(jsonObject));
        } catch (e) {
            alert('Save failed!');
            if (e == 'QUOTA_EXCEEDED_ERR') {
                alert('Quota exceeded!');
            }
        }
    }

    read(keyname) {
        let localStorageJson = localStorage.getItem(keyname);
        let jsonData = null;

        if (localStorageJson === null) {
            throw new Error('Data not found in localStorage');
        }

        jsonData = JSON.parse(localStorageJson);
        return jsonData;
    }
}