const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  // Seed only this disposable browser profile with synthetic data; never use real workshop data.
  await page.addInitScript(() => {
    const prefix = "nexum_ws___unassigned____";
    localStorage.setItem(prefix + "taller_electronica_v5", JSON.stringify([{
      ticketId: "TK-TEST-BACKUP-001",
      equipoId: "EQ-TEST-BACKUP-001",
      cliente: "Cliente sintético de prueba",
      cid: "CID-TEST-001",
      contacto: "5550100",
      equipo: "Equipo de prueba",
      modelo: "Modelo QA",
      fechaEntrada: "2026-10-28",
      estado: "En espera de diagnóstico",
      categoria: "Electrónica",
      inversion: 25,
      precio: 60,
      moneda: "CUP",
      tasa: 805,
      notas: "Registro sintético para prueba de copia",
      photoIds: []
    }]));
    localStorage.setItem(prefix + "taller_electronica_v5_movements", JSON.stringify([{
      id: "ECN-TEST-BACKUP-001",
      fecha: "2026-10-28",
      tipo: "Entrada",
      cantidad: 123,
      moneda: "CUP",
      tasa: 805,
      notas: "Movimiento sintético de prueba"
    }]));
    localStorage.setItem(prefix + "taller_electronica_economia_config", JSON.stringify({
      amount: 50, currency: "CUP", rate: 805, date: "2026-10-28"
    }));
    localStorage.setItem(prefix + "nexum_categories_v1", JSON.stringify(["Sin definir", "Electrónica", "QA sintético"]));
    localStorage.setItem(prefix + "nexum_settings_v1", JSON.stringify({ theme: "dark", palette: "blue", fontSize: "medium", iconSize: "medium" }));
    localStorage.setItem(prefix + "nexum_equipment_v1", JSON.stringify([{
      equipoId: "EQ-TEST-BACKUP-001", cliente: "Cliente sintético de prueba", equipo: "Equipo de prueba"
    }]));
  });
  const alerts = [];
  page.on("dialog", async dialog => {
    if (dialog.type() === "confirm") {
      await dialog.accept();
    } else {
      alerts.push(dialog.message());
      await dialog.accept();
    }
  });

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nexum-backup-test-"));
  try {
    await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#backupBtn", { state: "attached", timeout: 30000 });
    await page.waitForSelector("#restoreFile", { state: "attached" });

    // This test bypasses only the visual admin-panel gate to exercise the existing
    // backup controls in an isolated, fresh browser profile. It does not call Supabase
    // admin APIs or write to any remote project.
    await page.evaluate(() => {
      const panel = document.querySelector('[data-settings-panel="desarrolladores"]');
      if (panel) {
        panel.classList.add("settings-panel-active");
        panel.style.display = "block";
        panel.style.visibility = "visible";
      }
      let node = document.querySelector("#backupBtn");
      while (node) {
        node.style.visibility = "visible";
        if (getComputedStyle(node).display === "none") node.style.display = "block";
        node = node.parentElement;
      }
    });

    const backupDownload = page.waitForEvent("download");
    await page.locator("#backupBtn").click({ force: true });
    const backup = await backupDownload;
    const backupPath = path.join(tmp, backup.suggestedFilename());
    await backup.saveAs(backupPath);

    const payload = JSON.parse(fs.readFileSync(backupPath, "utf8"));
    for (const key of ["version", "exportado", "app", "data", "movements",
      "equipmentRecords", "economyConfig", "categories", "appSettings"]) {
      assert.ok(Object.prototype.hasOwnProperty.call(payload, key), "missing backup field: " + key);
    }
    assert.equal(payload.app, "NEXUM Taller");
    assert.ok(Array.isArray(payload.data), "data must be an array");
    assert.ok(Array.isArray(payload.movements), "movements must be an array");
    assert.ok(Array.isArray(payload.equipmentRecords), "equipmentRecords must be an array");
    assert.ok(Array.isArray(payload.categories), "categories must be an array");
    assert.equal(typeof payload.appSettings, "object");
    assert.ok(payload.data.some(x => x.ticketId === "TK-TEST-BACKUP-001"), "synthetic ticket missing from backup");
    assert.ok(payload.movements.some(x => x.id === "ECN-TEST-BACKUP-001"), "synthetic movement missing from backup");
    assert.equal(payload.economyConfig.rate, 805);
    assert.ok(payload.categories.includes("QA sintético"));
    console.log("PASS: operational backup includes synthetic ticket, movement, economy settings and categories");

    // Round-trip through the real file input and restore handler, in a disposable browser profile.
    alerts.length = 0;
    await page.locator("#restoreFile").setInputFiles(backupPath);
    await page.waitForFunction(() => document.querySelector("#restoreFile").value === "", null, { timeout: 10000 });
    assert.ok(alerts.includes("Copia restaurada correctamente."), "restore success alert not observed");
    const restored = await page.evaluate(() => {
      const prefix = "nexum_ws___unassigned____";
      return {
        tickets: JSON.parse(localStorage.getItem(prefix + "taller_electronica_v5") || "[]"),
        movements: JSON.parse(localStorage.getItem(prefix + "taller_electronica_v5_movements") || "[]"),
        economy: JSON.parse(localStorage.getItem(prefix + "taller_electronica_economia_config") || "null"),
        categories: JSON.parse(localStorage.getItem(prefix + "nexum_categories_v1") || "[]")
      };
    });
    assert.ok(restored.tickets.some(x => x.ticketId === "TK-TEST-BACKUP-001"), "ticket missing after restore");
    assert.ok(restored.movements.some(x => x.id === "ECN-TEST-BACKUP-001"), "movement missing after restore");
    assert.equal(restored.economy.rate, 805);
    assert.ok(restored.categories.includes("QA sintético"));
    console.log("PASS: synthetic data survives export and restore");

    // A malformed JSON file must be rejected instead of being treated as a valid backup.
    const invalidPath = path.join(tmp, "invalid-backup.json");
    fs.writeFileSync(invalidPath, "{not valid JSON");
    alerts.length = 0;
    await page.locator("#restoreFile").setInputFiles(invalidPath);
    await page.waitForFunction(() => document.querySelector("#restoreFile").value === "", null, { timeout: 10000 });
    assert.ok(alerts.includes("La copia no tiene un formato válido."), "invalid backup was not rejected");
    console.log("PASS: malformed backup is rejected");

    // Check the separate photo export/import format as well.
    alerts.length = 0;
    const photosDownload = page.waitForEvent("download");
    await page.locator("#exportPhotosBtn").click({ force: true });
    const photos = await photosDownload;
    const photosPath = path.join(tmp, photos.suggestedFilename());
    await photos.saveAs(photosPath);
    const photoPayload = JSON.parse(fs.readFileSync(photosPath, "utf8"));
    assert.equal(photoPayload.type, "photo-repository");
    assert.ok(Array.isArray(photoPayload.photos));
    console.log("PASS: photo export uses the expected independent format");

    await page.locator("#importPhotosFile").setInputFiles(photosPath);
    for (let i = 0; i < 40 && !alerts.includes("Repositorio de fotos importado correctamente."); i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(alerts.includes("Repositorio de fotos importado correctamente."), "photo import success alert not observed");
    console.log("PASS: photo export can be re-imported");

    console.log("All NEXUM operational backup smoke tests passed.");
  } finally {
    await context.close();
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
