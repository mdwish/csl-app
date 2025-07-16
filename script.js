let offset = 0;
let total = 0;
let pageSize = parseInt(document.querySelector('#page-size').value, 10);
let sortOrder = 'relevance';

const spinner = document.querySelector('#loading-spinner');
const errorDiv = document.querySelector('#error-message');
const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');
const historyList = document.querySelector('#search-history');

document.querySelector('#page-size').addEventListener('change', (e) => {
  pageSize = parseInt(e.target.value, 10);
  offset = 0;
  const name = document.querySelector('#name').value;
  if (name) {
    fetchResults(name, offset);
  }
});

document.querySelector('#sort').addEventListener('change', (e) => {
  sortOrder = e.target.value;
  const name = document.querySelector('#name').value;
  if (name) {
    offset = 0;
    fetchResults(name, offset);
  }
});

const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#name').value;
  if (!name) {
    return;
  }
  offset = 0;
  fetchResults(name, offset);
});

prevBtn.addEventListener('click', () => {
  offset = Math.max(0, offset - pageSize);
  const name = document.querySelector('#name').value;
  fetchResults(name, offset);
});

nextBtn.addEventListener('click', () => {
  offset += pageSize;
  const name = document.querySelector('#name').value;
  fetchResults(name, offset);
});

function updateHistory(term) {
  if (!term) return;
  let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  history = history.filter((t) => t !== term);
  history.unshift(term);
  history = history.slice(0, 5);
  localStorage.setItem('searchHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  historyList.innerHTML = '';
  history.forEach((term) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-link p-0 history-item';
    btn.textContent = term;
    btn.addEventListener('click', () => {
      document.querySelector('#name').value = term;
      offset = 0;
      fetchResults(term, offset);
    });
    historyList.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderHistory();

  const toggleBtn = document.querySelector('#toggleFilters');
  toggleBtn.addEventListener('click', () => {
    const listSwitches = document.querySelectorAll('input[name="list"]');
    const typeSwitches = document.querySelectorAll('input[name="type"]');
    const allSwitches = [...listSwitches, ...typeSwitches];
    const anyUnchecked = Array.from(allSwitches).some((cb) => !cb.checked);
    allSwitches.forEach((checkbox) => {
      checkbox.checked = anyUnchecked;
    });
    const name = document.querySelector('#name').value;
    if (name) {
      offset = 0;
      fetchResults(name, offset);
    }
  });

  document.querySelectorAll('.only-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      document.querySelectorAll('input[name="list"]').forEach((cb) => {
        cb.checked = cb.value === filter;
      });
      const name = document.querySelector('#name').value;
      if (name) {
        offset = 0;
        fetchResults(name, offset);
      }
    });
  });

  document.querySelectorAll('input[name="list"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const name = document.querySelector('#name').value;
      if (name) {
        offset = 0;
        fetchResults(name, offset);
      }
    });
  });

  document.querySelectorAll('input[name="type"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const name = document.querySelector('#name').value;
      if (name) {
        offset = 0;
        fetchResults(name, offset);
      }
    });
  });
});

function sortResults(results) {
  if (sortOrder === 'nameAsc') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'nameDesc') {
    results.sort((a, b) => b.name.localeCompare(a.name));
  }
  return results;
}

function updateFilterCounts(sources) {
  const counts = {};
  if (Array.isArray(sources)) {
    sources.forEach((src) => {
      const match = src.value.match(/\(([^()]+)\)/);
      if (match && match[1]) {
        counts[match[1]] = src.count;
      }
    });
  }
  document.querySelectorAll('input[name="list"]').forEach((checkbox) => {
    const label = document.querySelector(`label[for="${checkbox.id}"]`);
    if (!label) return;
    if (!label.dataset.baseText) {
      label.dataset.baseText = label.textContent;
    }
    const count = counts[checkbox.value] || 0;
    label.textContent = `${label.dataset.baseText} (${count})`;
  });
}

  function fetchResults(name, offset) {
    const selectedLists = Array.from(document.querySelectorAll('input[name="list"]:checked'))
      .map(checkbox => checkbox.value)
      .join(',');
    const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked'))
      .map(checkbox => checkbox.value);

  const url = `https://data.trade.gov/consolidated_screening_list/v1/search?name=${name}&fuzzy_name=true&offset=${offset}&size=${pageSize}&sources=${selectedLists}`;

  spinner.style.display = 'block';
  errorDiv.textContent = '';

  fetch(url, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
      'subscription-key': 'b9730532d6ba42fabc7e93f2b1c1df60',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
  })
    .then((data) => {
      total = data.total;
      document.querySelector('#total-results').textContent = `${total} Results`;
      updateFilterCounts(data.sources);
      const resultsDiv = document.querySelector('#results');
      resultsDiv.innerHTML = '';
      if (data.total === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        spinner.style.display = 'none';
        updateHistory(name);
        return;
      }

      prevBtn.style.display = offset > 0 ? 'inline-block' : 'none';
      nextBtn.style.display = offset + pageSize < total ? 'inline-block' : 'none';

        const accordion = document.createElement('div');
        accordion.classList.add('accordion');
        accordion.setAttribute('id', 'accordionExample');

        const filteredResults = sortResults(
          data.results.filter((r) => {
            const rType = r.type === null ? 'Unknown' : r.type;
            return selectedTypes.includes(rType);
          })
        );

        filteredResults.forEach((result, index) => {
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item');

        const accordionHeading = document.createElement('h2');
        accordionHeading.classList.add('accordion-header');
        accordionHeading.setAttribute('id', `heading${index}`);

        const accordionButton = document.createElement('button');
        accordionButton.classList.add('accordion-button', 'collapsed');
        accordionButton.setAttribute('type', 'button');
        accordionButton.setAttribute('data-bs-toggle', 'collapse');
        accordionButton.setAttribute('data-bs-target', `#collapse${index}`);
        accordionButton.setAttribute('aria-expanded', 'false');
        accordionButton.setAttribute('aria-controls', `collapse${index}`);
        accordionButton.innerHTML = `${result.type === null ? '&#10067;' : ''} ${result.type === 'Individual' ? '&#128100;' : ''} ${result.type === 'Entity' ? '&#127970;' : ''} ${result.type === 'Aircraft' ? '&#9992;' : ''} ${result.type === 'Vessel' ? '&#128674;' : ''} ${result.name}`;

        accordionHeading.appendChild(accordionButton);

        const accordionBody = document.createElement('div');
        accordionBody.classList.add('accordion-collapse', 'collapse');
        accordionBody.setAttribute('id', `collapse${index}`);
        accordionBody.setAttribute('aria-labelledby', `heading${index}`);
        accordionBody.setAttribute('data-bs-parent', '#accordionExample');

        const accordionBodyContent = document.createElement('div');
        accordionBodyContent.classList.add('accordion-body');
        accordionBodyContent.innerHTML = `
          <strong>ID:</strong> ${result.id}<br>
          ${result.type ? `<strong>Type:</strong> ${result.type === 'Individual' ? '&#128100;' : ''} ${result.type === 'Entity' ? '&#127970;' : ''} ${result.type === 'Aircraft' ? '&#9992;' : ''} ${result.type === 'Vessel' ? '&#128674;' : ''} ${result.type}<br>` : ''}
          <strong>Name:</strong> ${result.name}<br>
          ${result.alt_names.length ? `<strong>Alt Names:</strong> ${result.alt_names.join(', ')}<br>` : ''}
          ${result.call_sign ? `<strong>Call Sign:</strong> ${result.call_sign}<br>` : ''}
          ${result.citizenships.length ? `<strong>Citizenships:</strong> ${result.citizenships.join(', ')}<br>` : ''}
          ${result.country ? `<strong>Country:</strong> ${result.country}<br>` : ''}
          ${result.dates_of_birth.length ? `<strong>Dates of Birth:</strong> ${result.dates_of_birth.join(', ')}<br>` : ''}
          ${result.end_date ? `<strong>End Date:</strong> ${result.end_date}<br>` : ''}
          <strong>Entity Number:</strong> ${result.entity_number}<br>
          ${result.federal_register_notice ? `<strong>Federal Register Notice:</strong> ${result.federal_register_notice}<br>` : ''}
          ${result.gross_registered_tonnage ? `<strong>Gross Registered Tonnage:</strong> ${result.gross_registered_tonnage}<br>` : ''}
          ${result.gross_tonnage ? `<strong>Gross Tonnage:</strong> ${result.gross_tonnage}<br>` : ''}
          ${result.license_policy ? `<strong>License Policy:</strong> ${result.license_policy}<br>` : ''}
          ${result.license_requirement ? `<strong>License Requirement:</strong> ${result.license_requirement}<br>` : ''}
          ${result.nationalities.length ? `<strong>Nationalities:</strong> ${result.nationalities.join(', ')}<br>` : ''}
          ${result.places_of_birth.length ? `<strong>Places of Birth:</strong> ${result.places_of_birth.join(', ')}<br>` : ''}
          ${result.programs.length ? `<strong>Programs:</strong> ${result.programs.join(', ')}<br>` : ''}
          ${result.remarks ? `<strong>Remarks:</strong> ${result.remarks}<br>` : ''}
          ${result.standard_order ? `<strong>Standard Order:</strong> ${result.standard_order}<br>` : ''}
          ${result.start_date ? `<strong>Start Date:</strong> ${result.start_date}<br>` : ''}
          ${result.title ? `<strong>Title:</strong> ${result.title}<br>` : ''}
          ${result.vessel_flag ? `<strong>Vessel Flag:</strong> ${result.vessel_flag}<br>` : ''}
          ${result.vessel_owner ? `<strong>Vessel Owner:</strong> ${result.vessel_owner}<br>` : ''}
          ${result.vessel_type ? `<strong>Vessel Type:</strong> ${result.vessel_type}<br>` : ''}
          ${result.addresses.length && result.addresses[0] !== null ? `<strong>Addresses:</strong> <ul>${result.addresses.map(address => `<li>${address.address !== null ? `${address.address}<br>` : ''}${address.city !== null ? `${address.city} ` : ''}${address.state !== null ? `, ${address.state} ` : ''}${address.postal_code !== null ? ` ${address.postal_code}` : ''}${address.country !== null ? `${address.country} ` : ''}</li>`).join('')}</ul>` : ''}
          ${result.ids.length ? `<strong>Identification:</strong> <ul>${result.ids.map(id => `<li>${id.type}: ${id.number}<br>${id.issue_date ? `Issue Date: ${id.issue_date}` : ''} ${id.expiration_date ? `Expiration Date: ${id.expiration_date}` : ''} ${id.country ? `Country: ${id.country}` : ''}</li>`).join('')}</ul>` : ''}
          <strong>Source:</strong> ${result.source}<br>
          ${result.source_information_url ? `<strong>Source Information URL:</strong> <a href="${result.source_information_url}" target="_blank">${result.source_information_url}</a><br>` : ''}
          ${result.source_list_url ? `<strong>Source List URL:</strong> <a href="${result.source_list_url}" target="_blank">${result.source_list_url}</a><br>` : ''}
        `;

        accordionBody.appendChild(accordionBodyContent);
        accordionItem.appendChild(accordionHeading);
        accordionItem.appendChild(accordionBody);
        accordion.appendChild(accordionItem);
      });

      resultsDiv.appendChild(accordion);
      spinner.style.display = 'none';
      updateHistory(name);
    })
    .catch(() => {
      spinner.style.display = 'none';
      errorDiv.textContent = 'Failed to load results.';
      document.querySelector('#results').innerHTML = '';
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      updateFilterCounts([]);
    });
}
