export default {
  parse() {
    const xml = BlanccoSearch.data;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    const entries = xmlDoc.getElementsByTagName("entry");

    let result = {};

    for (let i = 0; i < entries.length; i++) {
      const name = entries[i].getAttribute("name");
      const value = entries[i].textContent;
      result[name] = value;
    }

    return result;
  }
}
