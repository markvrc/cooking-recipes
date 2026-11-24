const seed = {
  id: 'vegan-high-protein-gluten-buns',
  name: 'Vegan High-Protein Buns Without Semolina',
  description: 'Yeast-free, oven-baked buns with a soft, dense crumb. Cornstarch makes the dough less elastic, so add the water gradually. Try them warm with a drizzle of maple syrup.',
  servings: 3, servingUnit: 'buns', time: '20–25 min baking',
  tags: ['Vegan', 'High Protein', 'Low FODMAP', 'Low Fiber'],
  ingredients: [
    {name:'Vital wheat gluten', amount:60, unit:'g'},
    {name:'Cornstarch', amount:35, unit:'g'},
    {name:'Soy protein isolate', amount:20, unit:'g'},
    {name:'Maple syrup', amount:10, unit:'g'},
    {name:'Olive oil', amount:5, unit:'g'},
    {name:'Baking powder', amount:4, unit:'g'},
    {name:'Salt', amount:2, unit:'g'},
    {name:'Water', amount:100, max:130, unit:'ml', approx:true}
  ],
  steps: [
    'Preheat the oven to 180°C.',
    'Mix the vital wheat gluten, cornstarch, soy protein isolate, baking powder, and salt.',
    'Add the maple syrup, olive oil, and about the lower end of the water range (100 ml for three buns).',
    'Gradually add more water until a soft, slightly sticky dough forms.',
    'Knead briefly, approximately 1–2 minutes.',
    'Divide the dough into equal portions and shape into slightly flattened buns.',
    'Lightly brush the tops of the buns with a little extra olive oil before baking.',
    'Bake for 20–25 minutes, checking that the centers are cooked through.'
  ],
  photo: '/buns.webp',
  nutrition: [
    'Estimated per bun (one-third of the recipe)',
    '165 kcal · 21 g protein · 16 g total carbohydrate · 2.3 g fat',
    '',
    'Essential amino acids per bun',
    'Histidine 0.42 g · Isoleucine 0.73 g · Leucine 1.47 g · Lysine 0.78 g · Methionine 0.36 g · Phenylalanine 0.97 g · Threonine 0.60 g · Tryptophan 0.27 g · Valine 0.95 g',
    '',
    'Other amino acids per bun',
    'Alanine 0.71 g · Arginine 1.15 g · Aspartic acid 1.28 g · Cysteine/cystine 0.36 g · Glutamic acid/glutamine 5.93 g · Glycine 0.81 g · Proline 1.74 g · Serine 0.89 g · Tyrosine 0.58 g',
    '',
    'Macros use USDA ingredient data. The amino acid estimate uses representative wheat-gluten and soy-isolate profiles. Values vary by brand and bun size. The estimates exclude the optional olive oil brushed on top and any maple syrup added for serving.'
  ].join('\n')
};
const standardTags = ['Vegan','High Protein','Low FODMAP','Low Fiber','High Fiber','High Iron','Gluten Free','Low Calorie'];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.4"/><path d="m16 16 4.4 4.4"/></svg>';
const clock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const leaf = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 28c3-6 7-11 14-17M10 22C4 12 12 6 27 4c-1 13-5 20-17 18Z"/><path d="m15 17-1-5m4 2 5-1"/></svg>';
const pills = tags => '<div class="tags">' + tags.map(tag => '<span class="pill">'+esc(tag)+'</span>').join('') + '</div>';
const time = recipe => '<div class="meta">' + clock + esc(recipe.time) + '</div>';
const photo = (recipe, lazy = false) => recipe.photo
  ? '<img src="' + (recipe.photo === '/buns.webp' ? '/buns.webp' : '/photo/' + esc(recipe.id)) + '" alt="' + esc(recipe.name) + '"' + (lazy ? ' loading="lazy"' : '') + '>'
  : '<div class="placeholder" aria-hidden="true"></div>';

function page(title, body, status = 200, description = 'A personal collection of vegan recipes.') {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><title>${esc(title)} · The Green Collection</title><link rel="stylesheet" href="/style.css"><script defer src="/site.js"></script></head><body><header><nav class="wrap nav" aria-label="Main"><a class="brand" href="/">${leaf} The Green Collection</a><a class="nav-link" href="/#recipes">Recipes</a></nav></header>${body}<footer><div class="wrap footer-row"><span>The Green Collection</span><a href="/admin">Manage recipes</a></div></footer></body></html>`, {
    status, headers: {
      'Content-Type':'text/html; charset=utf-8', 'X-Content-Type-Options':'nosniff',
      'Cache-Control':'no-store', 'Referrer-Policy':'strict-origin-when-cross-origin',
      'Content-Security-Policy':"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
    }
  });
}

function home(recipes) {
  const tags = new Map(standardTags.map(tag => [tag.toLowerCase(), tag]));
  for (const recipe of recipes) {
    for (const tag of recipe.tags) {
      if (!tags.has(tag.toLowerCase())) tags.set(tag.toLowerCase(), tag);
    }
  }
  const cards = recipes.map(recipe => `<a class="card" href="/recipes/${esc(recipe.id)}" data-tags="${esc(JSON.stringify(recipe.tags.map(tag=>tag.toLowerCase())))}" data-search="${esc([recipe.name, recipe.description, ...recipe.tags, ...recipe.ingredients.map(item=>item.name)].join(' ').toLowerCase())}">${photo(recipe,true)}<div class="card-body">${time(recipe)}<h3>${esc(recipe.name)}</h3><p>${esc(recipe.description)}</p>${pills(recipe.tags)}</div></a>`).join('');
  return page('Vegan recipes', `<main class="wrap"><section class="hero"><div class="hero-copy"><p class="eyebrow">The plant-based recipe collection</p><h1>Good food,<br><em>grown from plants.</em></h1><p>Find something delicious to cook, whatever’s on your ingredient list.</p></div><div class="hero-photo"><img src="/buns.webp" alt="Golden homemade wheat buns on a ceramic plate" fetchpriority="high"></div></section><section class="collection" id="recipes"><div class="section-head"><div><p class="eyebrow">The recipe box</p><h2>Browse recipes</h2></div><label class="search">${searchIcon}<input id="search" type="search" placeholder="Search recipes…" aria-label="Search recipes"></label></div><div class="filters" aria-label="Dietary filters"><button class="pill" data-filter="" aria-pressed="true">All recipes</button>${Array.from(tags, ([key, label]) => `<button class="pill" data-filter="${esc(key)}" aria-pressed="false">${esc(label)}</button>`).join('')}</div><p class="count" id="count" aria-live="polite">${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}</p><div class="grid">${cards}</div><p id="empty" class="empty"${recipes.length ? ' hidden' : ''}>No recipes match. Try a different search or clear a filter.</p></section></main>`);
}

const greenMondayIngredients = new Set(['vital wheat gluten', 'soy protein isolate']);

function ingredientName(name) {
  const label = esc(name);
  return greenMondayIngredients.has(name.trim().toLowerCase())
    ? '<a href="https://greenmonday.cy/">' + label + '</a>'
    : label;
}

function nutritionPanel(recipe) {
  if (!recipe.nutrition) return '';
  const sources = recipe.id === seed.id && recipe.nutrition === seed.nutrition
    ? '<p class="nutrition-sources"><a href="https://fdc.nal.usda.gov/">USDA FoodData Central</a> · <a href="https://biolayne.com/app/uploads/publications/Layne-Norton-PhD-Thesis.pdf#page=34">Wheat gluten amino acid reference</a></p>'
    : '';
  return '<section class="nutrition"><h2>Nutrition</h2><p>' + esc(recipe.nutrition) + '</p>' + sources + '</section>';
}

function detail(recipe) {
  const rows = recipe.ingredients.map(item => `<li><span>${ingredientName(item.name)}</span><span data-amount="${item.amount}" data-max="${item.max ?? ''}" data-unit="${esc(item.unit)}" data-approx="${Boolean(item.approx)}">${item.approx ? '≈ ' : ''}${item.amount}${item.max == null ? '' : '–'+item.max} ${esc(item.unit)}</span></li>`).join('');
  return page(recipe.name, `<main class="wrap detail"><a class="back" href="/#recipes">Back to recipes</a><div class="detail-head"><div>${time(recipe)}<h1>${esc(recipe.name)}</h1><p>${esc(recipe.description)}</p>${pills(recipe.tags)}</div>${photo(recipe)}</div><div class="recipe-body"><section class="ingredients"><h2>Ingredients</h2><div class="servings" data-base="${recipe.servings}"><span>Servings</span><button type="button" id="minus" aria-label="Decrease servings"${recipe.servings === 1 ? ' disabled' : ''}>−</button><output id="servings" aria-live="polite">${recipe.servings}</output><button type="button" id="plus" aria-label="Increase servings"${recipe.servings === 999 ? ' disabled' : ''}>+</button><span>${esc(recipe.servingUnit)}</span></div><ul class="ingredient-list">${rows}</ul></section><section><h2>Instructions</h2><ol class="steps">${recipe.steps.map(step => '<li>'+esc(step)+'</li>').join('')}</ol>${nutritionPanel(recipe)}</section></div></main>`, 200, recipe.description);
}

function admin() {
  return page('Manage recipes', `<main class="wrap admin"><h1>Manage recipes</h1><p id="admin-status" role="status"></p><form id="login"><label>Admin password<input name="password" type="password" autocomplete="current-password" required></label><button class="button">Unlock editor</button></form><section id="editor" hidden><div class="form-actions"><button class="button" id="add" type="button">Add recipe</button><button class="button secondary" id="lock" type="button">Lock editor</button></div><div class="admin-list" id="admin-list"></div><form id="edit" hidden><h2 id="edit-title">New recipe</h2><label>Recipe name<input name="name" maxlength="120" required></label><label>Short description<textarea name="description" rows="2" maxlength="1000" required></textarea></label><label>Photo<input name="photo" type="file" accept="image/*"></label><span id="photo-note" class="help"></span><label>Cooking time<input name="time" placeholder="e.g. 30 min" maxlength="80" required></label><label>Base servings<input name="servings" type="number" min="1" max="999" required></label><label>Yield unit <span class="help">Optional, e.g. buns</span><input name="servingUnit" maxlength="40"></label><label>Dietary tags <span class="help">Separate tags with commas.</span><input name="tags" placeholder="Vegan, High Protein"></label><label>Ingredients <span class="help">One per line in the format quantity | unit | ingredient. Use ~ for approximate quantities and a dash for ranges.</span><textarea name="ingredients" rows="7" placeholder="60 | g | Vital wheat gluten&#10;~110–135 | ml | Water" required></textarea></label><label>Instructions <span class="help">One step per line.</span><textarea name="steps" rows="6" required></textarea></label><label>Nutrition <span class="help">Optional. Enter your own values.</span><textarea name="nutrition" rows="3" maxlength="4000"></textarea></label><div class="form-actions"><button class="button">Save recipe</button><button class="button secondary" id="cancel" type="button">Cancel</button></div><p id="edit-status" role="status"></p></form></section></main>`);
}

async function readRecipe(bucket, id) {
  const object = await bucket.get('recipes/' + id);
  const value = object ? await object.json() : (id === seed.id ? seed : null);
  return value?.deleted ? null : value;
}
async function recipesFrom(bucket) {
  const keys = new Set([seed.id]);
  let cursor;
  do {
    const result = await bucket.list({prefix:'recipes/', cursor});
    for (const object of result.objects) keys.add(object.key.slice(8));
    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);
  const recipes = await Promise.all(Array.from(keys, id => readRecipe(bucket,id)));
  return recipes.filter(Boolean);
}
function withoutPhotoData(recipe) {
  return {...recipe, photo: recipe.photo?.startsWith('data:') ? 'uploaded' : recipe.photo};
}
function authorized(request, password) {
  if (!password) return false;
  const value = request.headers.get('Authorization') ?? '';
  const expected = 'Bearer ' + password;
  let difference = value.length ^ expected.length;
  for (let i=0; i<expected.length; i++) difference |= expected.charCodeAt(i) ^ (value.charCodeAt(i) || 0);
  return difference === 0;
}
const json = (data, status = 200) => Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const validString = (value, max, min=0) => typeof value === 'string' && value.trim().length >= min && value.length <= max;
const validPhoto = value => typeof value === 'string' && value.length <= 1200000 && /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
function validate(recipe) {
  return validString(recipe.name,120,1) && validString(recipe.description,1000,1)
    && validString(recipe.time,80,1) && validString(recipe.servingUnit,40)
    && Number.isInteger(recipe.servings) && recipe.servings >= 1 && recipe.servings <= 999
    && validString(recipe.nutrition,4000)
    && Array.isArray(recipe.tags) && recipe.tags.length <= 40 && recipe.tags.every(tag => validString(tag,70,1))
    && Array.isArray(recipe.steps) && recipe.steps.length > 0 && recipe.steps.length <= 100 && recipe.steps.every(step => validString(step,2000,1))
    && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && recipe.ingredients.length <= 100
    && recipe.ingredients.every(item => item && validString(item.name,150,1) && validString(item.unit,40)
      && Number.isFinite(item.amount) && item.amount >= 0 && (item.max == null || Number.isFinite(item.max) && item.max >= item.amount)
      && typeof item.approx === 'boolean');
}
async function manage(request, bucket, id) {
  if (request.method === 'GET' && !id) {
    return json((await recipesFrom(bucket)).map(withoutPhotoData));
  }
  if (request.method === 'DELETE' && id) {
    if (!(await readRecipe(bucket,id))) return json({error:'Recipe not found.'},404);
    if (id === seed.id) await bucket.put('recipes/'+id, JSON.stringify({deleted:true}));
    else await bucket.delete('recipes/'+id);
    return json({ok:true});
  }
  if (request.method === 'POST' && !id || request.method === 'PUT' && id) {
    let input;
    try { input = JSON.parse(await request.text()); } catch { return json({error:'Invalid recipe data.'},400); }
    if (!input || !validate(input) || (input.photo && !validPhoto(input.photo))) return json({error:'Check the recipe fields and photo.'},400);
    const previous = id ? await readRecipe(bucket,id) : null;
    if (id && !previous) return json({error:'Recipe not found.'},404);
    if (!input.photo && !previous?.photo) return json({error:'Choose a recipe photo.'},400);
    const newId = id || (input.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75) || 'recipe') + '-' + crypto.randomUUID().slice(0,8);
    const {name,description,time,servings,servingUnit,steps,nutrition,ingredients,tags} = input;
    const recipe = {id:newId,name,description,time,servings,servingUnit,steps,nutrition,ingredients,tags,photo:input.photo || previous.photo};
    await bucket.put('recipes/'+newId, JSON.stringify(recipe));
    return json(withoutPhotoData(recipe), id ? 200 : 201);
  }
  return json({error:'Method not allowed.'},405);
}
function asset(body, type) {
  return new Response(body,{headers:{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=300'}});
}
function imageBytes(base64) {
  return Uint8Array.from(atob(base64), character => character.charCodeAt(0));
}

export default {
  async fetch(request, env) {
    const {pathname} = new URL(request.url);
    const bucket = env.BUCKET;
    try {
      if (pathname === '/style.css') return asset(assets.css,'text/css; charset=utf-8');
      if (pathname === '/site.js') return asset(assets.js,'text/javascript; charset=utf-8');
      if (pathname === '/buns.webp') return asset(imageBytes(assets.photo),'image/webp');
      if (pathname === '/admin') return admin();
      const api = pathname.match(/^\/api\/recipes(?:\/([a-z0-9-]+))?$/);
      if (api) {
        if (!authorized(request,env.RECIPE_ADMIN_PASSWORD)) return json({error:'Incorrect admin password.'},401);
        if (!bucket) return json({error:'Recipe storage is unavailable.'},503);
        if (Number(request.headers.get('Content-Length')) > 1400000) return json({error:'The photo is too large.'},413);
        return await manage(request,bucket,api[1]);
      }
      if (pathname === '/') return home(bucket ? (await recipesFrom(bucket)).map(withoutPhotoData) : [seed]);
      const match = pathname.match(/^\/(recipes|photo)\/([a-z0-9-]+)\/?$/);
      if (match) {
        const recipe = bucket ? await readRecipe(bucket,match[2]) : (match[2] === seed.id ? seed : null);
        if (recipe && match[1] === 'recipes') return detail(withoutPhotoData(recipe));
        const image = recipe?.photo?.match(/^data:(image\/(?:jpeg|webp|png));base64,(.+)$/);
        if (image) return asset(imageBytes(image[2]),image[1]);
      }
      return page('Page not found','<main class="wrap detail"><h1>Page not found</h1><a class="back" href="/#recipes">Back to recipes</a></main>',404);
    } catch (error) {
      console.error(error);
      if (pathname.startsWith('/api/')) return json({error:'Could not save or load recipes. Try again.'},500);
      return page('Recipes unavailable','<main class="wrap detail"><h1>Recipes are temporarily unavailable</h1><a class="back" href="/">Try again</a></main>',503);
    }
  }
};
