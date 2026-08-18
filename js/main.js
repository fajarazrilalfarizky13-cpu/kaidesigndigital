/* ============================================================
   KaiDesign Digital — main.js
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Constants ---------- */
  var WHATSAPP_NUMBER = "6285746313644";
  var WHATSAPP_URL = "https://wa.me/" + WHATSAPP_NUMBER;
  var MONTHS_ID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  /* ============================================================
     NAVBAR
     ============================================================ */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function closeMenu() {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Buka menu navigasi");
  }

  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
  });

  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  /* ---------- Scrollspy ---------- */
  var spyLinks = document.querySelectorAll(".nav-link[data-section]");
  var spySections = [];
  spyLinks.forEach(function (link) {
    var sec = document.querySelector(link.getAttribute("href"));
    if (sec) spySections.push({ id: sec.id, link: link });
  });

  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        spySections.forEach(function (item) {
          item.link.classList.toggle("is-active", item.id === entry.target.id);
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  spySections.forEach(function (item) {
    var sec = document.getElementById(item.id);
    if (sec) spyObserver.observe(sec);
  });

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }







  /* ============================================================
     FAQ ACCORDION
     ============================================================ */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var q = item.querySelector(".faq-q");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      faqItems.forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ============================================================
     ORDER FORM
     ============================================================ */
  var form = document.getElementById("orderForm");
  var usernameInput = document.getElementById("username");
  var paketInputs = document.querySelectorAll('input[name="paket"]');
  var layananSelect = document.getElementById("layananDesain");
  var customField = document.getElementById("field-custom");
  var customInput = document.getElementById("customDesain");
  var deadlineInput = document.getElementById("deadline");
  var catatanInput = document.getElementById("catatan");
  var fileInput = document.getElementById("fileInput");
  var fileListEl = document.getElementById("fileList");
  var fileCountEl = document.getElementById("fileCount");
  var submitBtn = document.getElementById("submitBtn");

  var selectedFiles = [];

  /* Deadline: tanggal minimal hari ini */
  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }
  deadlineInput.min = todayISO();

  /* ---------- Layanan → kategori otomatis ---------- */
  function currentCategory() {
    var opt = layananSelect.options[layananSelect.selectedIndex];
    return opt && opt.dataset.category ? opt.dataset.category : "";
  }

  /* ---------- Custom Desain conditional ---------- */
  function toggleCustomField() {
    var isCustom = layananSelect.value === "Custom Desain";
    customField.hidden = !isCustom;
    if (!isCustom) customInput.value = "";
    customField.classList.remove("invalid");
  }
  layananSelect.addEventListener("change", function () {
    toggleCustomField();
    updateSummary();
    clearError("field-layanan");
  });

  /* ---------- Format tanggal ---------- */
  function formatDateID(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return "";
    var y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
    if (!y || !m || !d) return "";
    return d + " " + MONTHS_ID[m - 1] + " " + y;
  }

  /* ---------- File upload ---------- */
  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function renderFiles() {
    fileListEl.innerHTML = "";
    selectedFiles.forEach(function (file, i) {
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.className = "file-name";
      name.textContent = file.name;
      name.title = file.name;
      var size = document.createElement("span");
      size.className = "file-size";
      size.textContent = formatBytes(file.size);
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "file-remove";
      remove.setAttribute("aria-label", "Hapus file " + file.name);
      remove.textContent = "×";
      remove.addEventListener("click", function () {
        selectedFiles.splice(i, 1);
        renderFiles();
        updateSummary();
      });
      li.appendChild(name);
      li.appendChild(size);
      li.appendChild(remove);
      fileListEl.appendChild(li);
    });
    var n = selectedFiles.length;
    fileCountEl.textContent = "File/Referensi: " + n + " file";
  }

  fileInput.addEventListener("change", function () {
    var incoming = Array.prototype.slice.call(fileInput.files);
    incoming.forEach(function (file) {
      var dup = selectedFiles.some(function (f) {
        return f.name === file.name && f.size === file.size;
      });
      if (!dup) selectedFiles.push(file);
    });
    fileInput.value = "";
    renderFiles();
    updateSummary();
  });

  /* ---------- Error helpers ---------- */
  function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    if (field) field.classList.remove("invalid");
  }
  function setError(fieldId, message) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add("invalid");
    if (message) {
      var err = field.querySelector(".field-error");
      if (err) err.textContent = message;
    }
  }

  var fieldIds = ["field-username", "field-paket", "field-layanan", "field-custom", "field-deadline", "field-catatan"];
  fieldIds.forEach(function (id) {
    var field = document.getElementById(id);
    if (!field) return;
    field.addEventListener("input", function () { field.classList.remove("invalid"); });
    field.addEventListener("change", function () { field.classList.remove("invalid"); });
  });

  /* ---------- Collect data ---------- */
  function getFormData() {
    var paket = "";
    paketInputs.forEach(function (p) { if (p.checked) paket = p.value; });
    var layanan = layananSelect.value;
    var kategori = currentCategory();
    var isCustom = layanan === "Custom Desain";
    return {
      username: usernameInput.value.trim(),
      paket: paket,
      layanan: layanan,
      kategori: kategori,
      isCustom: isCustom,
      customDesain: isCustom ? customInput.value.trim() : "",
      deadline: deadlineInput.value,
      deadlineText: formatDateID(deadlineInput.value),
      catatan: catatanInput.value.trim(),
      fileCount: selectedFiles.length
    };
  }

  /* ---------- Validation ---------- */
  function validate(data) {
    var errors = [];

    if (!data.username) {
      setError("field-username");
      errors.push("field-username");
    }
    if (!data.paket) {
      setError("field-paket");
      errors.push("field-paket");
    }
    if (!data.layanan) {
      setError("field-layanan");
      errors.push("field-layanan");
    }
    if (data.isCustom && !data.customDesain) {
      setError("field-custom");
      errors.push("field-custom");
    }
    if (!data.deadline) {
      setError("field-deadline");
      errors.push("field-deadline");
    } else if (data.deadline < todayISO()) {
      setError("field-deadline", "Tanggal tidak boleh di masa lalu.");
      errors.push("field-deadline");
    }
    if (!data.catatan) {
      setError("field-catatan");
      errors.push("field-catatan");
    }
    return errors;
  }

  /* ---------- WhatsApp message ---------- */
  function buildMessage(data) {
    var lines = [
      "ORDER BARU — KaiDesign Digital",
      "",
      "Username: " + data.username,
      "Layanan Desain: " + data.layanan,
      "Kategori: " + data.kategori,
      "Paket: " + data.paket,
      "Deadline: " + data.deadlineText
    ];
    if (data.isCustom) {
      lines.push("Jenis Desain Lainnya: " + data.customDesain);
    }
    lines.push(
      "",
      "Catatan:",
      data.catatan,
      "",
      "File/Referensi: " + data.fileCount + " file",
      "",
      "Mohon konfirmasi pesanan saya."
    );
    return lines.join("\n");
  }

  /* ---------- Submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = getFormData();
    var errors = validate(data);

    if (errors.length > 0) {
      var first = document.getElementById(errors[0]);
      if (first) {
        first.scrollIntoView({ behavior: "smooth", block: "center" });
        var focusEl = first.querySelector("input, select, textarea, .paket-card");
        if (focusEl && focusEl.focus) focusEl.focus();
      }
      return;
    }

    var message = buildMessage(data);
    var url = WHATSAPP_URL + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");

    submitBtn.disabled = true;
    var original = submitBtn.innerHTML;
    submitBtn.innerHTML = "Membuka WhatsApp…";
    setTimeout(function () {
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
    }, 2500);
  });

  /* ---------- Live summary ---------- */
  var sum = {
    paket: document.getElementById("sum-paket"),
    layanan: document.getElementById("sum-layanan"),
    kategori: document.getElementById("sum-kategori"),
    deadline: document.getElementById("sum-deadline"),
    catatan: document.getElementById("sum-catatan"),
    file: document.getElementById("sum-file")
  };

  function updateSummary() {
    var data = getFormData();
    sum.paket.textContent = data.paket || "—";
    sum.layanan.textContent = data.layanan || "—";
    sum.kategori.textContent = data.kategori || "—";
    sum.deadline.textContent = data.deadlineText || "—";
    sum.catatan.textContent = data.catatan || "Belum diisi";
    sum.file.textContent = data.fileCount + " file";
  }

  [usernameInput, catatanInput, deadlineInput, customInput].forEach(function (el) {
    el.addEventListener("input", updateSummary);
  });
  paketInputs.forEach(function (p) {
    p.addEventListener("change", function () {
      updateSummary();
      clearError("field-paket");
    });
  });
})();
