// src/data/districts.ts
export const SENATORIAL_DISTRICTS: Record<string, Record<string, string[]>> = {
  "Edo": {
    "Edo North": ["Akoko Edo", "Etsako East", "Etsako Central", "Etsako West", "Owan East", "Owan West"],
    "Edo Central": ["Esan Central", "Esan North East", "Esan South East", "Esan West", "Igueben"],
    "Edo South": ["Egor", "Ikpoba/Okha", "Oredo", "Orhionmwon", "Ovia North East", "Ovia South West", "Uhunmwonde"]
  },
  "Delta": {
    "Delta North": ["Aniocha North", "Aniocha South", "Ika North East", "Ika South", "Ndokwa East", "Ndokwa West", "Oshimili North", "Oshimili South", "Ukwuani"],
    "Delta Central": ["Ethiope East", "Ethiope West", "Okpe", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Uvwie"],
    "Delta South": ["Bomadi", "Burutu", "Isoko North", "Isoko South", "Patani", "Warri North", "Warri South", "Warri South West"]
  },
  "FCT Abuja": {
    "FCT": ["Abaji", "Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali"]
  },
  "Nasarawa": {
    "Nasarawa North": ["Akwanga", "Nasarawa", "Nasarawa Eggon", "Wamba", "Toto"],
    "Nasarawa West": ["Karu", "Keffi", "Kokona"],
    "Nasarawa South": ["Awe", "Doma", "Keana", "Lafia", "Obi"]
  }
}