const search = document.querySelector('#search');
if (search) {
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.card')].map(element => ({
    element, tags: JSON.parse(element.dataset.tags)
  }));
  const selected = new Set();
  function updateCollection() {
    const words = search.value.trim().toLowerCase().split(/\s+/);
    let visible = 0;
    for (const {element, tags} of cards) {
      const match = words.every(word => element.dataset.search.includes(word))
        && [...selected].every(tag => tags.includes(tag));
      element.hidden = !match;
      if (match) visible++;
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', button.dataset.filter ? selected.has(button.dataset.filter) : !selected.size);
    }
    document.querySelector('#empty').hidden = visible !== 0;
    document.querySelector('#count').textContent = visible + (visible === 1 ? ' recipe' : ' recipes');
  }
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const tag = button.dataset.filter;
      if (!tag) selected.clear();
      else if (selected.has(tag)) selected.delete(tag);
      else selected.add(tag);
      updateCollection();
    });
  }
  search.addEventListener('input', updateCollection);
  updateCollection();
}

const servingControl = document.querySelector('[data-base]');
if (servingControl) {
  const base = Number(servingControl.dataset.base);
  let servings = base;
  const minus = document.querySelector('#minus');
  const plus = document.querySelector('#plus');
  const output = document.querySelector('#servings');
  const amounts = document.querySelectorAll('[data-amount]');
  const format = new Intl.NumberFormat('en',{maximumSignificantDigits:8, useGrouping:false});
  function adjust(change) {
    servings += change;
    output.textContent = servings;
    minus.disabled = servings <= 1;
    plus.disabled = servings >= 999;
    for (const amount of amounts) {
      const {unit, approx, max} = amount.dataset;
      const scale = value => format.format(Number(value) * servings / base);
      amount.textContent = [approx === 'true' ? '≈ ' : '', scale(amount.dataset.amount), max ? '–' + scale(max) : '', unit ? ' ' + unit : ''].join('');
    }
  }
  minus.addEventListener('click', () => adjust(-1));
  plus.addEventListener('click', () => adjust(1));
}

const login = document.querySelector('#login');
if (login) {
  let password = '';
  let editingId = '';
  const status = document.querySelector('#admin-status');
  const editor = document.querySelector('#editor');
  const form = document.querySelector('#edit');
  const list = document.querySelector('#admin-list');
  const editStatus = document.querySelector('#edit-status');
  const field = name => form.elements.namedItem(name);
  async function api(path = '', method = 'GET', body) {
    const response = await fetch('/api/recipes' + path, {
      method,
      headers: {'Authorization': 'Bearer ' + password, 'Content-Type': 'application/json'},
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  }
  function showForm(recipe) {
    form.reset();
    editStatus.textContent = '';
    editingId = recipe?.id ?? '';
    document.querySelector('#edit-title').textContent = recipe ? 'Edit recipe' : 'New recipe';
    document.querySelector('#photo-note').textContent = recipe?.photo ? 'Leave blank to keep the current photo.' : '';
    field('photo').required = !recipe?.photo;
    for (const name of ['name','description','time','servings','servingUnit','nutrition']) {
      field(name).value = recipe?.[name] ?? (name === 'servings' ? 1 : '');
    }
    field('tags').value = recipe?.tags.join(', ') ?? '';
    field('steps').value = recipe?.steps.join('\n') ?? '';
    field('ingredients').value = recipe?.ingredients.map(item =>
      (item.approx ? '~' : '') + item.amount + (item.max == null ? '' : '–' + item.max) + ' | ' + item.unit + ' | ' + item.name).join('\n') ?? '';
    form.hidden = false;
    field('name').focus();
  }
  function action(text, handle) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button secondary';
    button.textContent = text;
    button.addEventListener('click', handle);
    return button;
  }
  function showList(recipes) {
    list.replaceChildren();
    for (const recipe of recipes) {
      const row = document.createElement('div');
      row.className = 'admin-entry';
      const label = document.createElement('span');
      label.textContent = recipe.name;
      row.append(label, action('Edit', () => showForm(recipe)), action('Delete', async () => {
        if (!confirm('Delete “' + recipe.name + '”?')) return;
        try {
          await api('/' + recipe.id, 'DELETE');
          if (editingId === recipe.id) form.hidden = true;
          showList(await api());
          status.textContent = 'Recipe deleted.';
        } catch (error) { status.textContent = error.message; }
      }));
      list.append(row);
    }
  }
  login.addEventListener('submit', async event => {
    event.preventDefault();
    const button = login.querySelector('button');
    button.disabled = true;
    password = login.elements.password.value;
    try {
      showList(await api());
      login.reset();
      login.hidden = true;
      editor.hidden = false;
      status.textContent = '';
    } catch (error) {
      password = '';
      status.textContent = error.message || 'Could not unlock the editor.';
    } finally { button.disabled = false; }
  });
  document.querySelector('#lock').addEventListener('click', () => {
    password = '';
    form.reset();
    form.hidden = true;
    list.replaceChildren();
    editor.hidden = true;
    login.hidden = false;
    status.textContent = '';
    login.elements.password.focus();
  });
  document.querySelector('#add').addEventListener('click', () => showForm());
  document.querySelector('#cancel').addEventListener('click', () => { form.hidden = true; });
  function lines(value) {
    return value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  }
  function parseIngredients(value) {
    return lines(value).map((line, index) => {
      const parts = line.split('|').map(part => part.trim());
      const [quantity, unit, name] = parts;
      const match = quantity.match(/^(~|≈)?\s*(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?$/);
      if (parts.length !== 3 || !name || !match || (match[3] && Number(match[3]) < Number(match[2]))) {
        throw new Error('Check ingredient line ' + (index + 1) + '. Use quantity | unit | ingredient.');
      }
      return {name, unit, amount:Number(match[2]), max:match[3] ? Number(match[3]) : null, approx:Boolean(match[1])};
    });
  }
  async function preparePhoto(file) {
    let bitmap;
    try { bitmap = await createImageBitmap(file); }
    catch { throw new Error('Choose a photo your browser can open, such as JPEG, PNG or WebP.'); }
    try {
      const ratio = Math.min(1, 1350 / Math.max(bitmap.width,bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const context = canvas.getContext('2d', {alpha:false});
      context.fillStyle = '#ffffff';
      context.fillRect(0,0,canvas.width,canvas.height);
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const photo = canvas.toDataURL('image/jpeg',.84);
      return photo.length <= 1200000 ? photo : canvas.toDataURL('image/jpeg',.65);
    } finally { bitmap.close(); }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    editStatus.textContent = 'Saving…';
    const id = editingId;
    try {
      const value = name => field(name).value.trim();
      const tags = new Map();
      for (const tag of value('tags').split(',').map(tag => tag.trim()).filter(Boolean)) {
        tags.set(tag.toLowerCase(), tag);
      }
      const data = {
        name:value('name'), description:value('description'), time:value('time'),
        servings:Number(value('servings')), servingUnit:value('servingUnit'),
        ingredients:parseIngredients(value('ingredients')), steps:lines(value('steps')),
        tags:[...tags.values()], nutrition:value('nutrition')
      };
      const file = field('photo').files[0];
      if (file) data.photo = await preparePhoto(file);
      await api(id ? '/' + id : '', id ? 'PUT' : 'POST', data);
      form.hidden = true;
      status.textContent = 'Recipe saved.';
      showList(await api());
    } catch (error) {
      (form.hidden ? status : editStatus).textContent = error.message || 'Could not save the recipe.';
    } finally { button.disabled = false; }
  });
}
