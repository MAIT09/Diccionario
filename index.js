// Código para las listas desplegables
let listElements = document.querySelectorAll('.list_button--click');

listElements.forEach(listElements => {
    listElements.addEventListener('click', () => {
        listElements.classList.toggle('arrow');

        let height = 0;
        let menu = listElements.nextElementSibling;
        if (menu.clientHeight == "0") {
            height = menu.scrollHeight;
        }
        menu.style.height = `${height}px`;
    });
});

// API de traducción de MyMemory (reemplaza con tu propia clave si es necesario)
const translateApiUrl = "https://api.mymemory.translated.net/get";
const email = "moisesdavidbatista@mail.com"; // Reemplaza con tu email

async function translateText(text, targetLanguage, sourceLanguage) {
    const url = `${translateApiUrl}?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}&de=${email}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            console.error("Error en la traducción:", data);
            return text; // Devuelve el texto original en caso de error
        }
    } catch (error) {
        console.error("Error en la solicitud de traducción:", error);
        return text; // Devuelve el texto original en caso de error
    }
}

const result = document.getElementById("result");
const sound = document.getElementById("sound");
const btn = document.getElementById("search-btn");

btn.addEventListener("click", async () => {
    let inpWord = document.getElementById("inp-word").value.trim();

    if (!inpWord) {
        result.innerHTML = '<h3 class="error">Por favor, ingrese una palabra</h3>';
        return;
    }

    result.innerHTML = '<h3>Cargando...</h3>'; // Indicador de carga

    const dictionaryApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/`;

    try {
        // Traducir la palabra del español al inglés
        const translatedToEnglish = await translateText(inpWord, 'en', 'es');

        // Buscar la palabra en inglés en el diccionario
        const response = await fetch(`${dictionaryApiUrl}${translatedToEnglish}`);
        if (!response.ok) throw new Error("Palabra no encontrada");

        const data = await response.json();
        const word = data[0].word;
        const phoneticText = data[0].phonetics[0]?.text || "Sin pronunciación";
        const definition = data[0].meanings[0]?.definitions[0]?.definition || "No hay significado disponible.";
        const example = data[0].meanings[0]?.definitions[0]?.example || "";
        const audioUrl = data[0].phonetics[0]?.audio || '';

        // Traducir los resultados al español
        const translatedWord = await translateText(word, 'es', 'en');
        const translatedPhoneticText = await translateText(phoneticText, 'es', 'en');
        const translatedDefinition = await translateText(definition, 'es', 'en');
        const translatedExample = await translateText(example, 'es', 'en');

        result.innerHTML = `
            <div class="word">
                <h3>${translatedWord}</h3>
                <button onclick="playSound('${audioUrl}')">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
            </div>
            <div class="details">
                <p>${translatedPhoneticText}</p>
            </div>
            <p class="word-meaning">${translatedDefinition}</p>
            <p class="word-example">${translatedExample}</p>
        `;

    } catch (error) {
        result.innerHTML = '<h3 class="error">No se pudo encontrar la palabra</h3>';
    }
});

function playSound(audioUrl) {
    if (audioUrl) {
        let audio = new Audio(audioUrl);
        audio.play();
    } else {
        alert("No hay audio disponible.");
    }
}
