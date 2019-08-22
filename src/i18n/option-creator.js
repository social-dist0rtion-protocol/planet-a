// Run this in Node environment
// Will output languageOptions.js file with all options for specified locales
const cldr = require('cldr');
const fs = require('fs');

const locales = ['fr_FR', 'en_GB','es_ES', 'ca_FR', 'de_DE', 'ro_RO', 'he_IL', 'ru_RU', 'pt_PT', 'ja_JP'];
const all = {};
for (let i = 0; i < locales.length; i ++){
  const locale = locales[i];
  all[locale.slice(0,2)] = cldr.extractNumberSymbols(locale);
}

let content = "export default ";
content += JSON.stringify(all);

fs.writeFile("./languageOptions.js", content, function(err) {
  if(err) {
    return console.log(err);
  }
  console.log("Options were saved");
});
