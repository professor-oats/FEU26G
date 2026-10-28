JavaScript

getArticlePrice(identifier) {
if (identifier === undefined || identifier === null) {
throw new Error('Bro, du måste skicka med ett artikelID eller namn');
}

// 1. Kolla först om artikeln finns via ID
let foundArticle = this.articles.find(article => article.id === identifier);

// 2. Om den inte hittades på ID, kolla om den finns på namn
if (!foundArticle) {
foundArticle = this.articles.find(article => article.name === identifier);
}

// 3. Om den fortfarande inte hittas, kasta fel
if (!foundArticle) {
throw new Error('Yo, du kanske har stavat fel på id eller namnet, kolla att du slagit in rätt');
}

// 4. Kolla lagret
if (Number(foundArticle.quantity) > 0) {
return foundArticle.price;
} else {
throw new Error("Varan slut bror, ring Maxim");
}
}