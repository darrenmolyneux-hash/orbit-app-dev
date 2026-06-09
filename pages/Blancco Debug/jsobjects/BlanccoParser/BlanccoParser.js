export default {

  getXml() {
    let xml = BlanccoSearch.data?.response || BlanccoSearch.data || "";

    if (typeof xml !== "string") {
      xml = JSON.stringify(xml);
    }

    return xml
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  },

  findTags(searchText = "") {
    const xml = this.getXml();

    const regex = /<entries name="([^"]+)">([\s\S]*?)<\/entries>/g;
    const rows = [];

    const sections = [...xml.matchAll(regex)];

    sections.forEach((sectionMatch) => {
      const section = sectionMatch[1];
      const sectionXml = sectionMatch[2];

      const entryRegex = /<entry name="([^"]+)"[^>]*>(.*?)<\/entry>/gs;
      const entries = [...sectionXml.matchAll(entryRegex)];

      entries.forEach((entryMatch, index) => {
        rows.push({
          section,
          index,
          tag: entryMatch[1],
          value: entryMatch[2].trim()
        });
      });
    });

    return rows.filter(row =>
      !searchText ||
      row.section.toLowerCase().includes(searchText.toLowerCase()) ||
      row.tag.toLowerCase().includes(searchText.toLowerCase()) ||
      row.value.toLowerCase().includes(searchText.toLowerCase())
    );
  },

  getFromSection(sectionName, tagName, occurrence = 0) {
    const rows = this.findTags("");

    const matches = rows.filter(row =>
      row.section === sectionName &&
      row.tag === tagName
    );

    return matches[occurrence]?.value || "";
  },

  bytesToGB(value) {
    const bytes = Number(value);
    return bytes ? Math.round(bytes / 1024 / 1024 / 1024) + "GB" : "";
  },

  bytesToGBDecimal(value) {
    const bytes = Number(value);
    return bytes ? Math.round(bytes / 1000 / 1000 / 1000) + "GB" : "";
  },

  parseBlancco() {
    return {
     
      processor: this.getFromSection("processors", "model"),
   

      ram: this.bytesToGB(this.getFromSection("memory", "total_memory")),

      drive_model: this.getFromSection("disks", "model"),
      drive_serial: this.getFromSection("disks", "serial"),
      drive_interface: this.getFromSection("disks", "interface_type"),
      drive_capacity: this.bytesToGBDecimal(this.getFromSection("disks", "capacity")),

      gpu: this.getFromSection("video_card", "model"),

      screen_size: this.getFromSection("displays", "size"),
      screen_resolution: this.getFromSection("displays", "resolution"),

      
   battery_health:
  this.getFromSection(
    "mobile_battery",
    "battery_health_metric",
    1
  )
    ? this.getFromSection(
        "mobile_battery",
        "battery_health_metric",
        1
      ) + "%"
    : "",

erasure_status: this.getFromSection("erasure", "state"),
erasure_standard: this.getFromSection("erasure", "erasure_standard_name")
    };
  }

}