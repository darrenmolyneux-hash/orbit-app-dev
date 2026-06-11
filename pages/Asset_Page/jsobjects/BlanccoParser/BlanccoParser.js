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
    const xml = this.getMatchingReportXml() || this.getXml();

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

  cleanValue(value) {
    return value ? String(value).trim() : "";
  },

  bytesToGB(value) {
    const bytes = Number(value);
    return bytes ? Math.round(bytes / 1024 / 1024 / 1024) + "GB" : "";
  },

  bytesToGBDecimal(value) {
    const bytes = Number(value);
    return bytes ? Math.round(bytes / 1000 / 1000 / 1000) + "GB" : "";
  },

  addPercent(value) {
    if (!value) return "";
    return String(value).includes("%") ? value : value + "%";
  },

  getBatteryHealthFromRawText() {
    const xml = this.getXml();

    const match =
      xml.match(/(\d+)%\s*\(&lt;\s*80%\)/) ||
      xml.match(/(\d+)%\s*\(<\s*80%\)/) ||
      xml.match(/<entry name="comment"[^>]*>\s*(\d+)%/);

    return match?.[1] || "";
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
      asset_tag:
        this.getEntry("system", "asset_tag") ||
        this.getRawEntry("asset_tag"),

      manufacturer:
        this.getEntry("system", "manufacturer") ||
        this.getRawEntry("manufacturer"),

      make:
        this.getEntry("system", "manufacturer") ||
        this.getRawEntry("manufacturer"),

      model:
        this.getEntry("system", "model") ||
        this.getRawEntry("model"),

      product_name:
        this.getEntry("system", "product_name") ||
        this.getRawEntry("product_name"),

      family:
        this.getEntry("system", "family") ||
        this.getRawEntry("family"),

      year:
        this.getEntry("system", "year") ||
        this.getEntry("system", "manufacture_year") ||
        this.getEntry("system", "release_year") ||
        this.getRawEntry("year") ||
        this.getRawEntry("manufacture_year") ||
        this.getRawEntry("release_year"),

      bios_version:
        this.getEntry("bios", "version") ||
        this.getRawEntry("bios_version") ||
        this.getRawEntry("version"),

      bios_date:
        this.getEntry("bios", "date") ||
        this.getRawEntry("bios_date"),

      uuid:
        this.getEntry("system", "uuid") ||
        this.getRawEntry("uuid"),

      processor:
        this.getEntry("processors", "model") ||
        this.getRawEntry("processor") ||
        this.getRawEntry("cpu"),

      processor_speed:
        this.getEntry("processors", "speed") ||
        this.getRawEntry("processor_speed"),

      processor_cores:
        this.getEntry("processors", "cores") ||
        this.getRawEntry("cores"),

      ram:
        this.bytesToGB(this.getEntry("memory", "total_memory")) ||
        this.getRawEntry("ram"),

      memory_type:
        this.getEntry("memory", "type") ||
        this.getRawEntry("memory_type"),

      drive_model:
        this.getEntry("disks", "model"),

      drive_serial:
        this.getEntry("disks", "serial"),

      drive_interface:
        this.getEntry("disks", "interface_type"),

      drive_capacity:
        this.bytesToGBDecimal(this.getEntry("disks", "capacity")),

      drive_health:
        this.getEntry("disks", "health") ||
        this.getRawEntry("drive_health"),

      drive_power_on_hours:
        this.getEntry("disks", "power_on_hours") ||
        this.getRawEntry("power_on_hours"),

      drive_type:
        this.getEntry("disks", "type") ||
        this.getRawEntry("drive_type"),

      gpu:
        this.getEntry("video_cards", "model") ||
        this.getRawEntry("gpu"),

      screen_size:
        this.getEntry("displays", "size"),

      screen_resolution:
        this.getEntry("displays", "resolution"),

      touchscreen:
        this.getEntry("displays", "touchscreen") ||
        this.getRawEntry("touchscreen"),

      battery_health:
        this.addPercent(batteryHealth),

      battery_cycle_count:
        this.getEntry("mobile_battery", "cycle_count") ||
        this.getEntry("battery_mobile", "cycle_count") ||
        this.getRawEntry("cycle_count"),

      battery_serial:
        this.getEntry("mobile_battery", "serial") ||
        this.getEntry("battery_mobile", "serial") ||
        this.getRawEntry("battery_serial"),

      battery_manufacturer:
        this.getEntry("mobile_battery", "manufacturer") ||
        this.getEntry("battery_mobile", "manufacturer") ||
        this.getRawEntry("battery_manufacturer"),

      battery_design_capacity:
        this.getEntry("mobile_battery", "design_capacity") ||
        this.getEntry("battery_mobile", "design_capacity") ||
        this.getRawEntry("design_capacity"),

      battery_full_charge_capacity:
        this.getEntry("mobile_battery", "full_charge_capacity") ||
        this.getEntry("battery_mobile", "full_charge_capacity") ||
        this.getRawEntry("full_charge_capacity"),

      wifi:
        this.getEntry("network_adapters", "wireless") ||
        this.getRawEntry("wifi"),

      ethernet_mac:
        this.getEntry("network_adapters", "mac_address") ||
        this.getRawEntry("mac_address"),

      imei:
        this.getEntry("mobile", "imei") ||
        this.getRawEntry("imei"),

      meid:
        this.getEntry("mobile", "meid") ||
        this.getRawEntry("meid"),

      sim_status:
        this.getEntry("mobile", "sim_status") ||
        this.getRawEntry("sim_status"),

      secure_boot:
        this.getEntry("system", "secure_boot") ||
        this.getRawEntry("secure_boot"),

      tpm:
        this.getEntry("system", "tpm") ||
        this.getRawEntry("tpm"),

      computrace:
        this.getEntry("system", "computrace") ||
        this.getRawEntry("computrace"),

      mdm_lock:
        this.getEntry("system", "mdm_lock") ||
        this.getRawEntry("mdm_lock"),

      icloud_lock:
        this.getEntry("system", "icloud_lock") ||
        this.getRawEntry("icloud_lock"),

      bios_lock:
        this.getEntry("system", "bios_lock") ||
        this.getRawEntry("bios_lock"),

      erasure_status:
        this.getEntry("erasure", "state") ||
        this.getEntry("erasures", "state") ||
        this.getEntryFromFullXml("erasure", "state") ||
        this.getEntryFromFullXml("erasures", "state") ||
        this.getRawEntry("state"),

      erasure_standard:
        this.getEntry("erasure", "erasure_standard_name") ||
        this.getEntryFromFullXml("erasure", "erasure_standard_name") ||
        this.getRawEntry("erasure_standard_name"),

      erasure_start_time:
        this.getEntry("erasure", "start_time") ||
        this.getEntryFromFullXml("erasure", "start_time") ||
        this.getRawEntry("start_time"),

      erasure_end_time:
        this.getEntry("erasure", "end_time") ||
        this.getEntryFromFullXml("erasure", "end_time") ||
        this.getRawEntry("end_time"),

      erasure_duration:
        this.getEntry("erasure", "duration") ||
        this.getEntryFromFullXml("erasure", "duration") ||
        this.getRawEntry("duration"),

      verification_status:
        this.getEntry("erasure", "verification_status") ||
        this.getRawEntry("verification_status"),

      report_uuid:
        this.getRawEntry("report_uuid") ||
        this.getRawEntry("uuid"),

      blancco_report_id:
        this.getRawEntry("report_id") ||
        this.getRawEntry("blancco_report_id"),

      blancco_cert_url:
        "https://oliver-eu-west-1.portal.blancco.cloud/api/reports/" +
        (this.getRawEntry("license_consumption_id") || "") +
        "?language=en_US&format=HTML",

      cosmetic_grade: "",
      functional_grade: "",
      final_grade: "",
      resale_value: "",
      rebate_value: "",
      reuse_status: "",
      recycling_status: "",
      quarantine_status: "",
      client_asset_id: "",
      collection_reference: "",
      job_reference: "",
      pallet_reference: "",
      location_collected_from: "",
      processed_by: "",
      processing_notes: ""
    };
  },

  async saveToDb(parsed) {
    if (!parsed.serial) {
      showAlert("No serial number in Blancco data — nothing written", "warning");
      return null;
    }

    if (!parsed.serial_match) {
      showAlert(
        `Serial mismatch — requested: ${parsed.requested_serial}, returned: ${parsed.returned_serial}`,
        "warning"
      );
      return null;
    }

    const result = await qryWriteBlanccoToAsset.run({
      serial:           parsed.serial,
      cpu:              parsed.processor,
      ram:              parsed.ram,
      hdd:              parsed.drive_capacity,
      year:             parsed.year,
      screen_size:      parsed.screen_size,
      resolution:       parsed.screen_resolution,
      graphics:         parsed.gpu,
      erasure_status:   parsed.erasure_status,
      erasure_standard: parsed.erasure_standard,
      battery_health:   parsed.battery_health,
      drive_model:      parsed.drive_model,
      drive_interface:  parsed.drive_interface,
      apple_no:         parsed.model_id || parsed.family || "",
      blancco_cert_url: parsed.blancco_cert_url
    });

    if (!result.length) {
      showAlert(`No asset found with serial: ${parsed.serial}`, "error");
      return null;
    }

    return result[0];
  },

  async fetchAndSave() {
    await BlanccoSearch.run();

    const parsed = this.parseBlancco();

    const saved = await this.saveToDb(parsed);
    if (!saved) return;

    await GetAssetById.run();

    showAlert(
      `Saved — ${parsed.product_name || parsed.model} (${parsed.serial})`,
      "success"
    );
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
};