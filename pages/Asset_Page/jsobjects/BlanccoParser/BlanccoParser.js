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

  getRequestedSerial() {
    try {
      return SerialInput.text || DebugSerialInput.text || "";
    } catch (e) {
      try {
        return DebugSerialInput.text || "";
      } catch (e2) {
        return "";
      }
    }
  },

  getMatchingReportXml() {
    const xml = this.getXml();
    const serial = this.getRequestedSerial();

    if (!serial) return xml;

    const reports = [...xml.matchAll(/<report>[\s\S]*?<\/report>/g)].map(m => m[0]);

    if (!reports.length) return xml;

    return reports.find(r => r.includes(serial)) || "";
  },

  getEntryFromXml(xml, sectionName, tagName, occurrence = 0) {
    const sectionRegex = new RegExp(
      `<entries name="${sectionName}">([\\s\\S]*?)<\\/entries>`,
      "g"
    );

    const sections = [...xml.matchAll(sectionRegex)];
    let values = [];

    sections.forEach(section => {
      const sectionXml = section[1];

      const entryRegex = new RegExp(
        `<entry name="${tagName}"[^>]*>(.*?)<\\/entry>`,
        "gs"
      );

      const matches = [...sectionXml.matchAll(entryRegex)];
      values.push(...matches.map(m => m[1].trim()));
    });

    return values[occurrence] || "";
  },

  getRawEntry(tagName, occurrence = 0) {
    const xml = this.getXml();

    const regex = new RegExp(
      `<entry name="${tagName}"[^>]*>(.*?)<\\/entry>`,
      "gs"
    );

    const matches = [...xml.matchAll(regex)];

    return matches[occurrence]?.[1]?.trim() || "";
  },

  getEntry(sectionName, tagName, occurrence = 0) {
    return this.getEntryFromXml(
      this.getMatchingReportXml(),
      sectionName,
      tagName,
      occurrence
    );
  },

  getEntryFromFullXml(sectionName, tagName, occurrence = 0) {
    return this.getEntryFromXml(
      this.getXml(),
      sectionName,
      tagName,
      occurrence
    );
  },

  getBatteryHealthFromRawText() {
    const xml = this.getXml();

    const match =
      xml.match(/(\d+)%\s*\(&lt;\s*80%\)/) ||
      xml.match(/(\d+)%\s*\(<\s*80%\)/) ||
      xml.match(/<entry name="comment"[^>]*>\s*(\d+)%/);

    return match?.[1] || "";
  },

  bytesToGB(value) {
    const bytes = Number(value);
    return bytes ? Math.round(bytes / 1024 / 1024 / 1024) + "GB" : "";
  },

  bytesToGBDecimal(value) {
    const bytes = Number(value);
    return bytes ? Math.round(bytes / 1000 / 1000 / 1000) + "GB" : "";
  },

  findAny(searchText = "") {
    const xml = this.getXml();

    const regex = /<entry name="([^"]+)"[^>]*>(.*?)<\/entry>/gs;
    const entries = [...xml.matchAll(regex)];

    return entries
      .map((m, index) => ({
        index,
        tag: m[1],
        value: m[2].trim()
      }))
      .filter(row =>
        row.tag.toLowerCase().includes(searchText.toLowerCase()) ||
        row.value.toLowerCase().includes(searchText.toLowerCase())
      );
  },

  findRawText(searchText = "") {
    const xml = this.getXml();
    const pos = xml.toLowerCase().indexOf(searchText.toLowerCase());

    return {
      found: pos >= 0,
      position: pos,
      preview: pos >= 0 ? xml.substring(Math.max(0, pos - 300), pos + 500) : ""
    };
  },

  findTags(searchText = "") {
    const xml = this.getMatchingReportXml() || this.getXml();
    const rows = [];

    const regex = /<entries name="([^"]+)">([\s\S]*?)<\/entries>/g;
    const sections = [...xml.matchAll(regex)];

    sections.forEach(sectionMatch => {
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

  parseBlancco() {
    const requestedSerial = this.getRequestedSerial();
    const returnedSerial = this.getEntry("system", "serial");

    const batteryHealth =
      this.getEntry("mobile_battery", "battery_health_metric", 1) ||
      this.getEntry("mobile_battery", "battery_health_metric", 0) ||
      this.getEntry("battery_mobile", "battery_health_metric", 1) ||
      this.getEntry("battery_mobile", "battery_health_metric", 0) ||
      this.getEntry("battery_capacity", "capacity", 0) ||
      this.getEntryFromFullXml("mobile_battery", "battery_health_metric", 1) ||
      this.getEntryFromFullXml("mobile_battery", "battery_health_metric", 0) ||
      this.getEntryFromFullXml("battery_mobile", "battery_health_metric", 1) ||
      this.getEntryFromFullXml("battery_mobile", "battery_health_metric", 0) ||
      this.getEntryFromFullXml("battery_capacity", "capacity", 0) ||
      this.getBatteryHealthFromRawText();

    return {
      requested_serial: requestedSerial,
      returned_serial: returnedSerial,
      serial_match: requestedSerial === returnedSerial,

      serial: returnedSerial,
      processor: this.getEntry("processors", "model"),
      ram: this.bytesToGB(this.getEntry("memory", "total_memory")),

      drive_model: this.getEntry("disks", "model"),
      drive_serial: this.getEntry("disks", "serial"),
      drive_interface: this.getEntry("disks", "interface_type"),
      drive_capacity: this.bytesToGBDecimal(this.getEntry("disks", "capacity")),

      gpu: this.getEntry("video_cards", "model"),
      screen_size: this.getEntry("displays", "size"),
      screen_resolution: this.getEntry("displays", "resolution"),

      battery_health: batteryHealth ? batteryHealth + "%" : "",

      erasure_status:
        this.getEntry("erasure", "state") ||
        this.getEntry("erasures", "state") ||
        this.getEntryFromFullXml("erasure", "state") ||
        this.getEntryFromFullXml("erasures", "state") ||
        this.getRawEntry("state"),

      erasure_standard:
        this.getEntry("erasure", "erasure_standard_name") ||
        this.getEntryFromFullXml("erasure", "erasure_standard_name") ||
        this.getRawEntry("erasure_standard_name")
    };
  },

  debugResponse() {
    const raw = BlanccoSearch.data;

    return {
      data_type: typeof raw,
      has_data: !!raw,
      keys: raw && typeof raw === "object" ? Object.keys(raw) : [],
      preview: JSON.stringify(raw).slice(0, 500),
      requested_serial: this.getRequestedSerial()
    };
  }
}