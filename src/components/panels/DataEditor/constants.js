export const TABS = ['Products', 'Machines', 'Recipes', 'Research']

export const CATEGORIES = ['Extractor', 'Factory', 'Logic', 'Miscellaneous', 'Modular', 'Pipes', 'Power', 'Storage Silo']

export const SUBCATEGORIES = {
  Extractor:      ['Fluid Extractor', 'Item Extractor'],
  Factory:        ['Assembler', 'Furnace', 'Misc', 'Molder', 'Plant', 'Processor', 'Refinery', 'Separator'],
  Logic:          ['Logic Gate', 'Logic Input', 'Logic Output', 'Miscellaneous'],
  Miscellaneous:  ['Decoration', 'Depot', 'Other', 'Research'],
  Modular:        ['Modular Diesel Engine', 'Modular Turbine', 'Tree Farm'],
  Pipes:          ['Pipe', 'Intersection', 'Special'],
  Power:          ['Battery', 'Large Power Plant', 'Misc', 'Non-Renewable', 'Power Rate Calculators', 'Renewable', 'Transfer Pole'],
  'Storage Silo': ['Fluid Silo', 'Item Silo'],
}

export const CYCLE_MODES    = ['none', 'steam_temp', 'settings']
export const QUANTITY_MODES = ['none', 'steam_temp', 'settings', 'pollution']
export const POWER_TYPES    = ['MV', 'HV', 'MV/HV', 'Logic', 'Data']
export const NODE_DIRS      = ['input', 'output', 'both']
export const NODE_FACES     = ['North', 'East', 'West', 'South']
export const NODE_TYPES     = ['Item', 'Fluid', 'Power']
export const PRODUCT_TYPES  = ['Item', 'Fluid']
export const TIERS          = [1, 2, 3, 4]
export const RESEARCH_CATEGORIES = ['Production', 'Energy', 'Utility']

export const DATA_KEY = { Products: 'products', Machines: 'machines', Recipes: 'recipes', Research: 'research' }
export const FILE_KEY = { Products: 'products.json', Machines: 'machines.json', Recipes: 'recipes.json', Research: 'research.json' }

export const DEFAULT = {
  Products: { name: '', sell_price: 0, rp_multiplier: 1, type: 'Item' },
  Machines: { name: '', cost: 0, category: 'Factory', subcategory: 'Assembler', tier: 1, size: { x: 2, y: 2 }, nodes: [], variant: null, limited: false, research: null },
  Recipes:  { name: '', nameManual: false, machine_id: '', cycle_time: 1, cycle_mode: 'none', power_consumption: 0, power_type: null, pollution: 0, inputs: [], outputs: [] },
  Research: { name: '', rp_cost: 100, category: 'Production', prerequisites: [] },
}

export const STICKY = {
  Products: ['type'],
  Machines: ['tier', 'limited', 'category', 'subcategory', 'variant'],
  Recipes:  ['machine_id', 'cycle_time', 'cycle_mode', 'power_consumption', 'power_type', 'pollution'],
  Research: ['category'],
}