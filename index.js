import translate from 'google-translate-api-x';

const PUBMED_API_KEY = ''; // Можно оставить пустым
const count = 5;

async function getAndTranslateArticles(query, count) {
    try {
        console.log(`🔎 Поиск в PubMed: "${query}"...`);

        // 1. Формируем URL для поиска
        // Важно: знак "?" после esearch.fcgi
        let searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${count}&retmode=json`;
        
        if (PUBMED_API_KEY) {
            searchUrl += `&api_key=${PUBMED_API_KEY}`;
        }

        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) throw new Error(`PubMed Search Error: ${searchRes.status}`);
        
        const searchData = await searchRes.json();
        const ids = searchData.esearchresult.idlist;

        if (!ids || ids.length === 0) {
            console.log("Ничего не найдено.");
            return;
        }

        // 2. Формируем URL для получения данных
        let summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
        
        if (PUBMED_API_KEY) {
            summaryUrl += `&api_key=${PUBMED_API_KEY}`;
        }

        const summaryRes = await fetch(summaryUrl);
        const summaryData = await summaryRes.json();

        console.log(`✅ Найдено статей: ${ids.length}\n`);

        // 3. Перевод
        for (let id of ids) {
            const article = summaryData.result[id];
            const originalTitle = article.title;

            // Используем google-translate-api-x
            const translation = await translate(originalTitle, { to: 'ru' });

            console.log(`🆔 PMID: ${id}`);
            console.log(`🇬🇧 EN: ${originalTitle}`);
            console.log(`🇺🇦 UA: ${translation.text}`);
            console.log(`🔗 https://pubmed.ncbi.nlm.nih.gov/${id}/`);
            console.log('-'.repeat(50));
        }

    } catch (error) {
        console.error("❌ Ошибка выполнения:");
        console.error(error.message);
    }
}

getAndTranslateArticles("diabetes treatment 2025", count);
