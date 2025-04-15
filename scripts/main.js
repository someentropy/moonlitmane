const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRE3pamlFwllUrijnQbjMhYHgAYZmAK_yfPjWEb5Bp-fYItSAoVljQX3TtTXPO3ZLSkOE-3nIU8KjxZ/pub?gid=0&single=true&output=csv";
const SPECIALS_SHEET = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRE3pamlFwllUrijnQbjMhYHgAYZmAK_yfPjWEb5Bp-fYItSAoVljQX3TtTXPO3ZLSkOE-3nIU8KjxZ/pub?gid=1907463898&single=true&output=csv";

document.addEventListener('DOMContentLoaded', () => {
  const pricelistEl = document.getElementById('pricelist');
  if (!pricelistEl) {
    console.error('Price list container not found!');
    return;
  }

  // --- Remove or comment out the redundant local CSV load ---
  /*
  Papa.parse('data/pricing.csv', {
    download: true,
    header: true,
    complete: function(results) {
      console.log('CSV parsed data:', results);
      pricelistEl.innerHTML = renderPriceList(results.data);
    },
    error: function(err) {
      console.error('Error parsing CSV:', err);
    }
  });

  function renderPriceList(data) {
    // Convert CSV data into HTML. Customize as needed.
    return data.map(item => `<div>${item.Service} - ${item.Price}</div>`).join('');
  }
  */
  // --- End of redundant pricing load ---

  // ✅ Load price list using the Google Sheet data
  fetch(SHEET_URL)
    .then(response => response.text())
    .then(csv => {
      Papa.parse(csv, {
        header: false,
        complete: function(result) {
          const rows = result.data.slice(1); // Skip header
          const col1 = [];
          const col2 = [];

          rows.forEach(([service, price, column]) => {
            const line = `<li><strong>${service}</strong> – ${price}</li>`;
            if (column && column.trim().toLowerCase() === "column 2") {
              col2.push(line);
            } else {
              col1.push(line);
            }
          });

          const html = `
            <ul>${col1.join("")}</ul>
            <ul>${col2.join("")}</ul>
          `;
          document.getElementById("pricelist").innerHTML = html;
        }
      });
    });

  // ✅ Load specials using PapaParse (already working)
  fetch(SPECIALS_SHEET)
    .then(response => response.text())
    .then(csvText => {
      const result = Papa.parse(csvText, { header: true });

      const specials = result.data
        .map(row => {
          const title = row["title"]?.trim();
          const desc = row["desc"]?.trim();
          const validUntilRaw = row["validUntil"]?.trim();

          if (!title || !desc || !validUntilRaw) return null;

          const expiry = new Date(validUntilRaw);
          if (isNaN(expiry)) return null;

          const today = new Date();
          const msLeft = expiry - today;
          const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

          let countdownMsg = "";
          if (daysLeft === 0) countdownMsg = "Ends today!";
          else if (daysLeft === 1) countdownMsg = "Only 1 day left!";
          else if (daysLeft > 1) countdownMsg = `Only ${daysLeft} days left!`;

          return {
            title,
            desc,
            expiry,
            countdown: countdownMsg
          };
        })
        .filter(s => s && s.expiry >= new Date());

      if (specials.length > 0) {
        const html = `
          <section class="specials slide-in">
            <h2 style="color:#d4af37; font-weight:bold;">🌟 Current Specials</h2>
            <ul>
              ${specials
                .map(s => `<li><strong>${s.title}</strong><br>${s.desc}<br><em>${s.countdown}</em></li>`)
                .join("")}
            </ul>
          </section>
        `;
        const el = document.getElementById("specials-section");
        el.innerHTML = html;
        el.classList.remove("hidden");
      }
    })
    .catch(err => console.error("Specials load failed:", err));
});

